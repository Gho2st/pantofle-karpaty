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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID zamówienia" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        status: true,
        email: true,
        totalAmount: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Zamówienie nie istnieje" },
        { status: 404 },
      );
    }

    // Authorization check
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
          { status: 403 },
        );
      }
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Nie można ponowić płatności dla zamówienia w tym statusie" },
        { status: 400 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json(
        {
          error:
            "Brak konfiguracji Stripe lub NEXT_PUBLIC_BASE_URL w zmiennych środowiskowych",
        },
        { status: 500 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "pln",
      customer_email: order.email,
      metadata: {
        orderId: order.id.toString(),
      },
      success_url: `${baseUrl}/zamowienie/${order.id}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/zamowienie/${order.id}?status=error`,
      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: `Zamówienie #${order.id}`,
            },
            unit_amount: Math.round(order.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: stripeSession.id, status: "PENDING" },
    });

    return NextResponse.json(
      { redirectUrl: stripeSession.url },
      { status: 200 },
    );
  } catch (error) {
    console.error("Błąd podczas generowania nowej sesji płatności:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Błąd serwera podczas generowania nowej sesji płatności",
      },
      { status: 500 },
    );
  }
}
