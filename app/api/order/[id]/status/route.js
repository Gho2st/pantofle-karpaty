import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);

  // Allow access for authenticated users or guests with valid order ID
  try {
    const awaitedParams = await params;
    const id = await awaitedParams?.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID zamówienia" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        status: true,
        paymentId: true,
        email: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Zamówienie nie istnieje" },
        { status: 404 }
      );
    }

    // If user is authenticated, ensure they own the order or are admin
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

    let sessionStatus = null;
    let isExpired = false;

    if (order.status === "PENDING" && order.paymentId) {
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(
          order.paymentId
        );
        sessionStatus = stripeSession.status; // e.g., "open", "complete", "expired"
        isExpired = stripeSession.status === "expired";
      } catch (error) {
        console.error("Błąd podczas sprawdzania sesji Stripe:", error);
        // Assume expired if session cannot be retrieved (e.g., invalid session ID)
        isExpired = true;
      }
    }

    return NextResponse.json({
      orderStatus: order.status,
      sessionStatus,
      isExpired,
    });
  } catch (error) {
    console.error("Błąd podczas sprawdzania statusu zamówienia:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas sprawdzania statusu zamówienia" },
      { status: 500 }
    );
  }
}
