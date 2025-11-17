import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Stripe from "stripe";
import crypto from "crypto";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const {
      cartItems,
      formData,
      total,
      deliveryCost,
      paymentMethod,
      deliveryMethod,
      discountCode,
      discountValue,
    } = body;

    // Walidacje
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Koszyk jest pusty" }, { status: 400 });
    }
    if (!isValidEmail(formData.email)) {
      return NextResponse.json(
        { error: "Nieprawidłowy adres e-mail" },
        { status: 400 }
      );
    }

    // Zalogowany?
    let userId = null;
    let isGuest = true;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        userId = user.id;
        isGuest = false;
      }
    }

    // === GŁÓWNA TRANSAKCJA ===
    const { createdOrder, guestToken } = await prisma.$transaction(
      async (tx) => {
        for (const item of cartItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product || !product.sizes) {
            throw new Error(
              `Produkt o ID ${item.productId} nie istnieje lub brak rozmiarów`
            );
          }
          let sizes =
            typeof product.sizes === "string"
              ? JSON.parse(product.sizes)
              : product.sizes;
          const sizeData = sizes.find((s) => s.size === item.size);
          if (!sizeData || sizeData.stock < item.quantity) {
            throw new Error(
              `Brak wystarczającej ilości: ${product.name} (rozmiar ${item.size})`
            );
          }
        }

        const order = await tx.order.create({
          data: {
            user: userId ? { connect: { id: userId } } : undefined,
            isGuest,
            totalAmount: parseFloat(total),
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            street: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
            phone: formData.phone,
            paczkomat: formData.parcelLocker || null,
            paymentMethod,
            deliveryMethod,
            deliveryCost: parseFloat(deliveryCost),
            companyName: formData.companyName || null,
            nip: formData.nip || null,
            discountCode: discountCode || null,
            discountAmount: discountValue || 0,
            status: "PENDING",
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                name: item.product.name,
                size: item.size,
                quantity: item.quantity,
                price: item.product.price,
                promoPrice: item.product.promoPrice || null,
                promoEndDate: item.product.promoEndDate || null,
              })),
            },
          },
          include: { items: true },
        });

        let guestToken = null;
        if (isGuest) {
          guestToken = crypto.randomBytes(20).toString("hex");
          await tx.order.update({
            where: { id: order.id },
            data: { guestToken },
          });
        }

        // Odejmij stock
        for (const item of cartItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) continue;
          let sizes =
            typeof product.sizes === "string"
              ? JSON.parse(product.sizes)
              : product.sizes;
          const sizeIndex = sizes.findIndex((s) => s.size === item.size);
          if (sizeIndex !== -1) {
            sizes[sizeIndex].stock -= item.quantity;
            await tx.product.update({
              where: { id: item.productId },
              data: { sizes: JSON.stringify(sizes) },
            });
          }
        }

        if (discountCode) {
          await tx.discountCode.update({
            where: { code: discountCode },
            data: { usedCount: { increment: 1 } },
          });
        }

        return { createdOrder: order, guestToken };
      }
    );

    // Link do zamówienia
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    let redirectUrl = `${baseUrl}/zamowienie/${createdOrder.id}`;
    if (isGuest && guestToken) redirectUrl += `?guestToken=${guestToken}`;

    // Czy faktura?
    const isCompany = !!formData.companyName && !!formData.nip;
    const totalWithoutDelivery =
      createdOrder.totalAmount - parseFloat(deliveryCost || "0");
    const needsInvoice = isCompany && totalWithoutDelivery >= 450;
    const invoiceInfo = needsInvoice
      ? `<div style="background:#e8f5e8;padding:15px;border-radius:8px;border-left:4px solid #4CAF50;margin:20px 0;">Faktura VAT zostanie wysłana na <strong>${formData.email}</strong> w ciągu 1-2 dni.</div>`
      : `<div style="background:#f0f0f0;padding:15px;border-radius:8px;margin:20px 0;">Paragon fiskalny będzie w paczce.</div>`;

    // === TRANSPORTER (używamy raz dla obu maili) ===
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();

    // === 1. MAIL DO KLIENTA (ten sam co miałeś) ===
    const itemsHtml = createdOrder.items
      .map(
        (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${
          i.name
        } (rozmiar: ${i.size})</td>
        <td style="text-align:center;">${i.quantity} szt.</td>
        <td style="text-align:right;">${parseFloat(i.price).toFixed(2)} zł</td>
      </tr>`
      )
      .join("");

    const clientEmailHtml = `...`; // Twój dotychczasowy piękny HTML (zostaw dokładnie taki sam jak miałeś – nie zmieniamy)

    await transporter.sendMail({
      from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
      to: formData.email,
      subject: `Zamówienie #${createdOrder.id} – Pantofle Karpaty`,
      html: clientEmailHtml, // wklej tutaj swój stary HTML klienta
    });

    // === 2. NOWY MAIL DO CIEBIE (DO SKLEPU) ===
    const adminItems = createdOrder.items
      .map(
        (i) =>
          `${i.name} – rozmiar: ${i.size} – ${i.quantity} szt. – ${parseFloat(
            i.price
          ).toFixed(2)} zł`
      )
      .join("\n");

    const adminEmailHtml = `
      <h2>Nowe zamówienie #${createdOrder.id}</h2>
      <p><strong>Klient:</strong> ${formData.firstName} ${formData.lastName} (${
      formData.email
    })</p>
      <p><strong>Telefon:</strong> ${formData.phone}</p>
      <p><strong>Adres:</strong> ${formData.street}, ${formData.postalCode} ${
      formData.city
    }</p>
      ${
        formData.parcelLocker
          ? `<p><strong>Paczkomat:</strong> ${formData.parcelLocker}</p>`
          : ""
      }
      ${
        formData.companyName
          ? `<p><strong>Firma:</strong> ${formData.companyName} (NIP: ${formData.nip})</p>`
          : ""
      }
      
      <hr>
      <h3>Zamówione produkty:</h3>
      <pre style="background:#f4f4f4;padding:15px;border-radius:8px;">${adminItems}</pre>
      
      <p><strong>Dostawa:</strong> ${deliveryMethod} – ${parseFloat(
      deliveryCost
    ).toFixed(2)} zł</p>
      ${
        discountValue
          ? `<p><strong>Rabat:</strong> -${parseFloat(discountValue).toFixed(
              2
            )} zł (${discountCode})</p>`
          : ""
      }
      <p><strong>Do zapłaty:</strong> <strong style="font-size:18px;color:#fa7070;">${createdOrder.totalAmount.toFixed(
        2
      )} zł</strong></p>
      
      <p><strong>Płatność:</strong> ${
        paymentMethod === "stripe" ? "Online (Stripe)" : "Przelew tradycyjny"
      }</p>
      <p><strong>Faktura?</strong> ${
        needsInvoice ? "TAK (kwota ≥450 zł + NIP)" : "Nie – paragon w paczce"
      }</p>
      
      <hr>
      <p><a href="${baseUrl}/admin/zamowienia/${
      createdOrder.id
    }" style="background:#fa7070;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;">
        Otwórz w panelu admina →
      </a></p>
    `;

    await transporter.sendMail({
      from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
      to: "mwidel@pantofle-karpaty.pl",
      subject: `NOWE ZAMÓWIENIE #${
        createdOrder.id
      } – ${createdOrder.totalAmount.toFixed(2)} zł`,
      html: adminEmailHtml,
    });

    console.log(
      `Mail do klienta + mail do sklepu wysłane! Zamówienie #${createdOrder.id}`
    );

    // === STRIPE ===
    if (paymentMethod === "stripe") {
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "p24", "blik"],
        mode: "payment",
        currency: "pln",
        customer_email: formData.email,
        receipt_email: null, // ← WYŁĄCZA paragon od Stripe
        metadata: { orderId: createdOrder.id.toString() },
        success_url: redirectUrl,
        cancel_url: `${baseUrl}/koszyk`,
        line_items: [
          {
            price_data: {
              currency: "pln",
              product_data: { name: `Zamówienie #${createdOrder.id}` },
              unit_amount: Math.round(createdOrder.totalAmount * 100),
            },
            quantity: 1,
          },
        ],
      });

      await prisma.order.update({
        where: { id: createdOrder.id },
        data: { paymentId: stripeSession.id },
      });

      return NextResponse.json({ redirectUrl: stripeSession.url });
    }

    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Błąd podczas składania zamówienia" },
      { status: 500 }
    );
  }
}
