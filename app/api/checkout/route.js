import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Stripe from "stripe";
import crypto from "crypto";
import { sendOrderEmails } from "@/app/lib/sendOrderEmails";

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
        // walidacja stocku
        for (const item of cartItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product || !product.sizes)
            throw new Error(`Brak produktu ${item.productId}`);
          let sizes =
            typeof product.sizes === "string"
              ? JSON.parse(product.sizes)
              : product.sizes;
          const sizeData = sizes.find((s) => s.size === item.size);
          if (!sizeData || sizeData.stock < item.quantity) {
            throw new Error(
              `Brak wystarczającej ilości: ${product.name} (${item.size})`
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

        // odejmij stock
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    let redirectUrl = `${baseUrl}/zamowienie/${createdOrder.id}`;
    if (isGuest && guestToken) redirectUrl += `?guestToken=${guestToken}`;

    // TYLKO PRZY PRZELEWIE TRADYCYJNYM → WYSYŁAMY MAILE OD RAZU
    if (paymentMethod !== "stripe") {
      await sendOrderEmails(createdOrder, false); // false = nieopłacone (przelew tradycyjny)
      console.log(
        `Maile wysłane – zamówienie #${createdOrder.id} (przelew tradycyjny)`
      );
      return NextResponse.json({ redirectUrl });
    }

    // === STRIPE – tylko tworzymy sesję, ŻADNYCH MAILI ===
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "p24", "blik"],
      mode: "payment",
      currency: "pln",
      customer_email: formData.email,
      metadata: { orderId: createdOrder.id.toString() },
      success_url: redirectUrl + "?payment=success",
      cancel_url: `${baseUrl}/profil`,
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
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Błąd podczas składania zamówienia" },
      { status: 500 }
    );
  }
}
