import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import crypto from "crypto";
import { verifyRetryToken } from "@/app/lib/retryToken";

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

    // Autoryzacja: właściciel, admin albo gość z tokenem wydanym przez stronę zamówienia
    const isOwner =
      !!session?.user?.email && order.email === session.user.email;
    const isAdmin = session?.user?.role === "ADMIN";
    const { retryToken } = await request.json().catch(() => ({}));
    const isGuest = !isOwner && !isAdmin;

    if (isGuest && !verifyRetryToken(order.id, retryToken)) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
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

    // Gość nie ma już jednorazowego linku (zużył go przy wejściu na stronę),
    // więc po powrocie ze Stripe potrzebuje nowego — inaczej trafi na "brak dostępu".
    const guestToken = isGuest ? crypto.randomBytes(20).toString("hex") : null;
    const orderUrl = `${baseUrl}/zamowienie/${order.id}?${
      guestToken ? `guestToken=${guestToken}&` : ""
    }`;

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "pln",
      customer_email: order.email,
      metadata: {
        orderId: order.id.toString(),
      },
      success_url: `${orderUrl}status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${orderUrl}status=error`,
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
      data: {
        paymentId: stripeSession.id,
        status: "PENDING",
        ...(guestToken && { guestToken }),
      },
    });

    return NextResponse.json(
      { redirectUrl: stripeSession.url },
      { status: 200 },
    );
  } catch (error) {
    console.error("Błąd podczas generowania nowej sesji płatności:", error);
    return NextResponse.json(
      {
        error: "Błąd serwera podczas generowania nowej sesji płatności",
      },
      { status: 500 },
    );
  }
}
