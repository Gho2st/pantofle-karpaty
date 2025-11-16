import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Stripe from "stripe";
import crypto from "crypto";
import nodemailer from "nodemailer"; // DODANE

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// === WALIDACJA E-MAILA ===
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Koszyk pusty" }, { status: 400 });
    }

    // Walidacja e-maila
    if (!isValidEmail(formData.email)) {
      return NextResponse.json(
        { error: "Nieprawidłowy adres e-mail" },
        { status: 400 }
      );
    }

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

    // === TRANSACTION: SPRAWDŹ STOCK + UTWÓRZ ZAMÓWIENIE + ODEJMIJ STOCK + GENERUJ TOKEN ===
    const { createdOrder, guestToken } = await prisma.$transaction(
      async (tx) => {
        // 1. SPRAWDŹ STOCK PRZED ZAMÓWIENIEM
        for (const item of cartItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (
            !product ||
            product.sizes === null ||
            product.sizes === undefined
          ) {
            throw new Error(
              `Produkt o ID ${item.productId} nie istnieje lub brak danych o rozmiarach`
            );
          }

          let sizes;
          try {
            sizes =
              typeof product.sizes === "string"
                ? JSON.parse(product.sizes)
                : product.sizes;
          } catch (e) {
            throw new Error(
              `Nieprawidłowy format danych sizes dla produktu ${product.name}`
            );
          }

          if (!Array.isArray(sizes)) {
            throw new Error(
              `Dane sizes nie są tablicą dla produktu ${product.name}`
            );
          }

          const sizeData = sizes.find((s) => s.size === item.size);

          if (!sizeData || sizeData.stock < item.quantity) {
            throw new Error(
              `Brak wystarczającej ilości produktu "${
                product.name
              }" (rozmiar: ${item.size}). Dostępne: ${
                sizeData?.stock || 0
              }, potrzebne: ${item.quantity}`
            );
          }
        }

        // 2. UTWÓRZ ZAMÓWIENIE
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
            status: "PENDING",
            deliveryMethod,
            deliveryCost: parseFloat(deliveryCost),
            companyName: formData.companyName || null,
            nip: formData.nip || null,
            discountCode: discountCode || null,
            discountAmount: discountValue || 0,
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                name: item.product.name,
                size: item.size,
                quantity: item.quantity,
                price: item.product.price,
                promoPrice: item.product.promoPrice,
                promoEndDate: item.product.promoDate,
              })),
            },
          },
          include: { items: true }, // Pobierz items do e-maila
        });

        // 3. GENERUJ GUEST TOKEN (jeśli gość)
        let guestToken = null;
        if (isGuest) {
          guestToken = crypto.randomBytes(16).toString("hex");
          await tx.order.update({
            where: { id: order.id },
            data: { guestToken },
          });
        }

        // 4. ODEJMIJ STOCK
        for (const item of cartItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          let sizes;
          try {
            sizes =
              typeof product.sizes === "string"
                ? JSON.parse(product.sizes)
                : product.sizes;
          } catch (e) {
            throw new Error(
              `Błąd parsowania sizes przy odjęciu stocku dla ${product.name}`
            );
          }

          const sizeIndex = sizes.findIndex((s) => s.size === item.size);
          if (sizeIndex !== -1) {
            sizes[sizeIndex].stock -= item.quantity;
            await tx.product.update({
              where: { id: item.productId },
              data: { sizes: JSON.stringify(sizes) },
            });
          }
        }

        // 5. ZWIĘKSZ usedCount KODU RABATOWEGO
        if (discountCode) {
          await tx.discountCode.update({
            where: { code: discountCode },
            data: { usedCount: { increment: 1 } },
          });
        }

        return { createdOrder: order, guestToken };
      }
    );

    // === BUDUJ redirectUrl Z GUEST TOKENEM ===
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    let redirectUrl = `${baseUrl}/zamowienie/${createdOrder.id}`;
    if (isGuest && guestToken) {
      redirectUrl += `?guestToken=${guestToken}`;
    }

    // === WYŚLIJ E-MAIL Z POTWIERDZENIEM ZAMÓWIENIA ===
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        socketTimeout: 10000,
      });

      await transporter.verify();

      const orderItemsHtml = createdOrder.items
        .map(
          (item) => `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                ${item.name} (rozmiar: ${item.size})
              </td>
              <td style="text-align: right;">${item.quantity} szt.</td>
              <td style="text-align: right;">${item.price.toFixed(2)} zł</td>
            </tr>
          `
        )
        .join("");

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #fa7070; text-align: center;">Dziękujemy za zamówienie!</h2>
            <p style="font-size: 16px; color: #333;">
              Cześć <strong>${formData.firstName} ${formData.lastName}</strong>!
            </p>
            <p>Otrzymaliśmy Twoje zamówienie <strong>#${
              createdOrder.id
            }</strong>. Oto szczegóły:</p>

            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #fa7070;">
                  <th style="text-align: left; padding: 8px 0;">Produkt</th>
                  <th style="text-align: right;">Ilość</th>
                  <th style="text-align: right;">Cena</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
                <tr>
                  <td colspan="2" style="padding-top: 12px; font-weight: bold;">Koszt dostawy:</td>
                  <td style="text-align: right;">${deliveryCost.toFixed(
                    2
                  )} zł</td>
                </tr>
                ${
                  discountValue
                    ? `<tr>
                        <td colspan="2" style="padding-top: 8px; font-weight: bold; color: #4CAF50;">Rabat (${discountCode}):</td>
                        <td style="text-align: right; color: #4CAF50;">-${discountValue.toFixed(
                          2
                        )} zł</td>
                      </tr>`
                    : ""
                }
                <tr>
                  <td colspan="2" style="padding-top: 12px; font-size: 18px; font-weight: bold; color: #fa7070;">
                    Do zapłaty:
                  </td>
                  <td style="text-align: right; font-size: 18px; font-weight: bold; color: #fa7070;">
                    ${createdOrder.totalAmount.toFixed(2)} zł
                  </td>
                </tr>
              </tbody>
            </table>

            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
              <p><strong>Metoda płatności:</strong> ${
                paymentMethod === "stripe"
                  ? "Stripe (karta, BLIK, P24)"
                  : "Przelew tradycyjny"
              }</p>
              <p><strong>Metoda dostawy:</strong> ${deliveryMethod}</p>
              ${
                formData.parcelLocker
                  ? `<p><strong>Paczkomat:</strong> ${formData.parcelLocker}</p>`
                  : ""
              }
            </div>

            <hr style="border: 1px solid #eee; margin: 25px 0;">

            <p style="text-align: center; font-size: 14px; color: #777;">
              <strong>Pantofle Karpaty</strong> • <a href="https://pantofle-karpaty.pl" style="color: #fa7070;">pantofle-karpaty.pl</a>
            </p>
            <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
              Zamówienie możesz śledzić tutaj: 
              <a href="${redirectUrl}" style="color: #fa7070;">Zobacz zamówienie #${
        createdOrder.id
      }</a>
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
        to: formData.email,
        subject: `Potwierdzenie zamówienia #${createdOrder.id} – Pantofle Karpaty`,
        html: emailHtml,
      });

      console.log(`E-mail z potwierdzeniem wysłany do: ${formData.email}`);
    } catch (emailError) {
      console.error(
        "Błąd wysyłki e-maila z potwierdzeniem:",
        emailError.message
      );
      // Nie przerywaj – zamówienie istnieje!
    }

    // === STRIPE LUB PRZEKIEROWANIE ===
    if (paymentMethod === "stripe") {
      const amountInCents = Math.round(
        parseFloat(createdOrder.totalAmount) * 100
      );

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "blik", "p24"],
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
              unit_amount: amountInCents,
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

    // Tradycyjna płatność → przekieruj od razu
    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd podczas składania zamówienia" },
      { status: 500 }
    );
  }
}
