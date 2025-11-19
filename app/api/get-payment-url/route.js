// app/api/get-payment-url/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: "Brak paymentId" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(paymentId);

    // Jeśli sesja wygasła – zwróć null (przycisk się nie pokaże)
    if (session.status === "expired") {
      return NextResponse.json({ url: null });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Błąd pobierania URL sesji:", error);
    return NextResponse.json({ url: null });
  }
}
