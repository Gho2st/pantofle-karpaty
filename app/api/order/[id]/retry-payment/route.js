import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);

  try {
    const awaitedParams = await params;
    const id = awaitedParams?.id;

    // Validate order ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID zamówienia" },
        { status: 400 }
      );
    }

    // Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          select: {
            productId: true,
            name: true,
            size: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Zamówienie nie istnieje" },
        { status: 404 }
      );
    }

    // Restrict access to order owner or admin
    if (session && session.user && session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (
        !user ||
        (order.email !== session.user.email && session.user.role !== "ADMIN")
      ) {
        return NextResponse.json(
          { error: "Brak autoryzacji" },
          { status: 403 }
        );
      }
    }

    // Validate order status
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Nie można ponowić płatności dla zamówienia w tym statusie" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json(
        {
          error:
            "Brak konfiguracji Stripe lub NEXT_PUBLIC_BASE_URL w zmiennych środowiskowych",
        },
        { status: 500 }
      );
    }

    // Generate new Stripe Checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "blik", "p24"],
      mode: "payment",
      currency: "pln",
      customer_email: order.email,
      metadata: {
        orderId: order.id.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie/${order.id}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie/${order.id}?status=error`,
      line_items: order.items.map((item) => ({
        price_data: {
          currency: "pln",
          product_data: {
            name: item.name,
            description: `Rozmiar: ${item.size}`,
          },
          unit_amount: Math.round(item.price * 100), // Price in cents
        },
        quantity: item.quantity,
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(order.deliveryCost * 100),
              currency: "pln",
            },
            display_name:
              order.deliveryMethod === "paczkomat" ? "Paczkomat" : "Kurier",
          },
        },
      ],
    });

    // Update order with new session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: stripeSession.id, status: "PENDING" },
    });

    return NextResponse.json(
      { redirectUrl: stripeSession.url },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd podczas generowania nowej sesji płatności:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Błąd serwera podczas generowania nowej sesji płatności",
      },
      { status: 500 }
    );
  }
}
