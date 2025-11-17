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

    // Podstawowe walidacje
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Koszyk jest pusty" }, { status: 400 });
    }

    if (!isValidEmail(formData.email)) {
      return NextResponse.json(
        { error: "Nieprawidłowy adres e-mail" },
        { status: 400 }
      );
    }

    // Czy użytkownik zalogowany?
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

    // GŁÓWNA TRANSAKCJA – wszystko w jednym bloku
    const { createdOrder, guestToken } = await prisma.$transaction(
      async (tx) => {
        // 1. Sprawdź dostępność stocku
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

        // 2. Utwórz zamówienie
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

        // 3. Token dla gościa
        let guestToken = null;
        if (isGuest) {
          guestToken = crypto.randomBytes(20).toString("hex");
          await tx.order.update({
            where: { id: order.id },
            data: { guestToken },
          });
        }

        // 4. Odejmij stock
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

        // 5. Zwiększ licznik kodu rabatowego
        if (discountCode) {
          await tx.discountCode.update({
            where: { code: discountCode },
            data: { usedCount: { increment: 1 } },
          });
        }

        return { createdOrder: order, guestToken };
      }
    );

    // Link do śledzenia zamówienia
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    let redirectUrl = `${baseUrl}/zamowienie/${createdOrder.id}`;
    if (isGuest && guestToken) {
      redirectUrl += `?guestToken=${guestToken}`;
    }

    // Czy potrzebna faktura VAT?
    const isCompany = !!formData.companyName && !!formData.nip;
    const totalWithoutDelivery =
      createdOrder.totalAmount - parseFloat(deliveryCost || "0");
    const needsInvoice = isCompany && totalWithoutDelivery >= 450;

    const invoiceInfo = needsInvoice
      ? `<div style="background:#e8f5e8;padding:15px;border-radius:8px;border-left:4px solid #4CAF50;margin:20px 0;">
           Faktura VAT zostanie wysłana na <strong>${formData.email}</strong> w ciągu 1-2 dni roboczych.
         </div>`
      : `<div style="background:#f0f0f0;padding:15px;border-radius:8px;margin:20px 0;">
           Paragon fiskalny będzie dołączony do paczki.
         </div>`;

    // WYŚLIJ MAIL Z POTWIERDZENIEM ZAMÓWIENIA
    try {
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

      const itemsHtml = createdOrder.items
        .map(
          (i) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #eee;">
              ${i.name} (rozmiar: ${i.size})
            </td>
            <td style="text-align:center;">${i.quantity} szt.</td>
            <td style="text-align:right;">${parseFloat(i.price).toFixed(
              2
            )} zł</td>
          </tr>`
        )
        .join("");

      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f9f9f9;padding:20px;">
          <div style="background:#fff;padding:30px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color:#fa7070;text-align:center;">Dziękujemy za zamówienie!</h2>
            <p>Cześć <strong>${formData.firstName} ${
        formData.lastName
      }</strong>!</p>
            <p>Otrzymaliśmy Twoje zamówienie <strong>#${
              createdOrder.id
            }</strong>:</p>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <thead>
                <tr style="border-bottom:2px solid #fa7070;">
                  <th style="text-align:left;padding:8px 0;">Produkt</th>
                  <th style="text-align:center;">Ilość</th>
                  <th style="text-align:right;">Cena</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding-top:12px;font-weight:bold;">Dostawa:</td>
                  <td style="text-align:right;">${parseFloat(
                    deliveryCost
                  ).toFixed(2)} zł</td>
                </tr>
                ${
                  discountValue
                    ? `<tr>
                      <td colspan="2" style="padding-top:8px;color:#4CAF50;font-weight:bold;">Rabat (${discountCode}):</td>
                      <td style="text-align:right;color:#4CAF50;">-${parseFloat(
                        discountValue
                      ).toFixed(2)} zł</td>
                    </tr>`
                    : ""
                }
                <tr>
                  <td colspan="2" style="padding-top:15px;font-size:18px;font-weight:bold;color:#fa7070;">Do zapłaty:</td>
                  <td style="text-align:right;font-size:20px;font-weight:bold;color:#fa7070;">
                    ${createdOrder.totalAmount.toFixed(2)} zł
                  </td>
                </tr>
              </tbody>
            </table>

            <div style="background:#f8f8f8;padding:15px;border-radius:8px;margin:20px 0;">
              <p><strong>Płatność:</strong> ${
                paymentMethod === "stripe"
                  ? "Karta / BLIK / Przelewy24"
                  : "Przelew tradycyjny"
              }</p>
              <p><strong>Dostawa:</strong> ${deliveryMethod}${
        formData.parcelLocker ? ` – ${formData.parcelLocker}` : ""
      }</p>
            </div>

            ${invoiceInfo}

            <p style="text-align:center;margin-top:30px;">
              <a href="${redirectUrl}" style="background:#fa7070;color:white;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;">
                Śledź zamówienie →
              </a>
            </p>

            <p style="text-align:center;color:#888;font-size:13px;margin-top:40px;">
              Pantofle Karpaty • z miłości do gór i wygody<br>
              <a href="https://pantofle-karpaty.pl" style="color:#fa7070;">pantofle-karpaty.pl</a>
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
        to: formData.email,
        subject: `Zamówienie #${createdOrder.id} – Pantofle Karpaty`,
        html: emailHtml,
      });

      console.log("Mail potwierdzający wysłany do:", formData.email);
    } catch (emailErr) {
      console.error("Błąd wysyłki maila:", emailErr);
      // Nie przerywamy – zamówienie i tak istnieje
    }

    // PŁATNOŚĆ STRIPE
    if (paymentMethod === "stripe") {
      const amountCents = Math.round(createdOrder.totalAmount * 100);

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "p24", "blik"],
        mode: "payment",
        currency: "pln",
        customer_email: formData.email,
        metadata: { orderId: createdOrder.id.toString() },
        success_url: redirectUrl,
        cancel_url: `${baseUrl}/koszyk`,
        line_items: [
          {
            price_data: {
              currency: "pln",
              product_data: { name: `Zamówienie #${createdOrder.id}` },
              unit_amount: amountCents,
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

    // Przelew tradycyjny – od razu przekieruj
    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("Błąd checkout:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd podczas składania zamówienia" },
      { status: 500 }
    );
  }
}
