import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Stripe from "stripe";
import crypto from "crypto";
import { sendOrderEmails } from "@/app/lib/sendOrderEmails";
import {
  DELIVERY_COSTS,
  getCurrentPrice,
  getDeliveryCost,
  getDiscountAmount,
  round2,
  validateDiscount,
} from "@/app/lib/pricing";

class CheckoutError extends Error {}

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

    // Ceny, koszt dostawy i rabat liczymy wyłącznie na serwerze —
    // wartości z przeglądarki (total, deliveryCost, discountValue) są ignorowane.
    const { formData, paymentMethod, deliveryMethod, discountCode } = body;
    const cartItems = Array.isArray(body.cartItems)
      ? body.cartItems.map((item) => ({
          productId: Number(item.productId),
          size: item.size,
          quantity: Number(item.quantity),
        }))
      : [];

    // Walidacje
    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Koszyk jest pusty" }, { status: 400 });
    }
    if (
      !cartItems.every(
        (item) =>
          Number.isInteger(item.productId) &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0,
      )
    ) {
      return NextResponse.json(
        { error: "Nieprawidłowa zawartość koszyka" },
        { status: 400 },
      );
    }
    if (!(deliveryMethod in DELIVERY_COSTS)) {
      return NextResponse.json(
        { error: "Nieprawidłowa metoda dostawy" },
        { status: 400 },
      );
    }
    if (!["stripe", "traditional"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Nieprawidłowa metoda płatności" },
        { status: 400 },
      );
    }
    if (!isValidEmail(formData?.email)) {
      return NextResponse.json(
        { error: "Nieprawidłowy adres e-mail" },
        { status: 400 },
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
        // walidacja stocku + ceny z bazy
        const products = new Map();
        let subtotal = 0;
        for (const item of cartItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product || product.deletedAt || !product.sizes)
            throw new CheckoutError(`Brak produktu ${item.productId}`);
          let sizes =
            typeof product.sizes === "string"
              ? JSON.parse(product.sizes)
              : product.sizes;
          const sizeData = sizes.find((s) => s.size === item.size);
          if (!sizeData || sizeData.stock < item.quantity) {
            throw new CheckoutError(
              `Brak wystarczającej ilości: ${product.name} (${item.size})`,
            );
          }
          products.set(item.productId, product);
          subtotal += getCurrentPrice(product) * item.quantity;
        }
        subtotal = round2(subtotal);

        const deliveryCost = getDeliveryCost(deliveryMethod, subtotal);

        let discountAmount = 0;
        let appliedCode = null;
        if (discountCode) {
          const code = String(discountCode).toUpperCase().trim();
          const { discount, error } = validateDiscount(
            await tx.discountCode.findUnique({ where: { code } }),
            subtotal,
          );
          if (error) throw new CheckoutError(`Kod rabatowy: ${error}`);
          discountAmount = getDiscountAmount(discount, subtotal, deliveryCost);
          appliedCode = discount.code;
        }

        const totalAmount = round2(subtotal + deliveryCost - discountAmount);

        const order = await tx.order.create({
          data: {
            user: userId ? { connect: { id: userId } } : undefined,
            isGuest,
            totalAmount,
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
            deliveryCost,
            companyName: formData.companyName || null,
            nip: formData.nip || null,
            discountCode: appliedCode,
            discountAmount,
            status: "PENDING",
            items: {
              create: cartItems.map((item) => {
                const product = products.get(item.productId);
                const currentPrice = getCurrentPrice(product);
                return {
                  productId: item.productId,
                  name: product.name,
                  size: item.size,
                  quantity: item.quantity,
                  price: product.price,
                  // tylko jeśli promocja faktycznie obowiązywała w chwili zakupu
                  promoPrice:
                    currentPrice < product.price ? currentPrice : null,
                };
              }),
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

        if (appliedCode) {
          await tx.discountCode.update({
            where: { code: appliedCode },
            data: { usedCount: { increment: 1 } },
          });
        }

        return { createdOrder: order, guestToken };
      },
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const orderUrl = new URL(`/zamowienie/${createdOrder.id}`, baseUrl);
    if (isGuest && guestToken) orderUrl.searchParams.set("guestToken", guestToken);
    const redirectUrl = orderUrl.toString();

    // TYLKO PRZY PRZELEWIE TRADYCYJNYM → WYSYŁAMY MAILE OD RAZU
    if (paymentMethod !== "stripe") {
      await sendOrderEmails(createdOrder, false); // false = nieopłacone (przelew tradycyjny)
      console.log(
        `Maile wysłane – zamówienie #${createdOrder.id} (przelew tradycyjny)`,
      );
      return NextResponse.json({ redirectUrl });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "pln",
      customer_email: formData.email,
      metadata: { orderId: createdOrder.id.toString() },
      // {CHECKOUT_SESSION_ID} podstawia Stripe — strona zamówienia weryfikuje nim płatność.
      // Doklejamy ręcznie, bo URL zakodowałby nawiasy klamrowe.
      success_url: `${redirectUrl}${redirectUrl.includes("?") ? "&" : "?"}payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${redirectUrl}${redirectUrl.includes("?") ? "&" : "?"}status=error`,
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
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Błąd podczas składania zamówienia" },
      { status: 500 },
    );
  }
}
