import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const { createdOrder } = await prisma.$transaction(async (tx) => {
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
              promoPrice: item.product.promoPrice, // ← ZAPISZ CENĘ PO PROMOCJI
              promoEndDate: item.product.promoEndDate, // ← ZAPISZ DATĘ
            })),
          },
        },
      });

      // Zwiększ usedCount
      if (discountCode) {
        await tx.discountCode.update({
          where: { code: discountCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return { createdOrder: order };
    });

    if (paymentMethod === "stripe") {
      const amountInCents = Math.round(
        parseFloat(createdOrder.totalAmount) * 100
      );
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "blik", "p24"],
        mode: "payment",
        currency: "pln",
        customer_email: formData.email,
        metadata: { orderId: createdOrder.id.toString() },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie/${createdOrder.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie`,
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
        data: { paymentId: session.id },
      });

      return NextResponse.json({ redirectUrl: session.url });
    }

    return NextResponse.json({
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie/${createdOrder.id}`,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
