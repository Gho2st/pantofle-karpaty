import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/app/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  // Odczyt surowego body
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Błąd weryfikacji webhooka:", err.message);
    return NextResponse.json({ error: "Błąd webhooka" }, { status: 400 });
  }

  // Obsługa zdarzeń
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: parseInt(orderId) },
          data: { status: "PAID" },
        });
        console.log(`Zaktualizowano status zamówienia ${orderId} na PAID`);
      }
      break;
    case "checkout.session.expired":
      const expiredSession = event.data.object;
      const expiredOrderId = expiredSession.metadata.orderId;

      if (expiredOrderId) {
        await prisma.order.update({
          where: { id: parseInt(expiredOrderId) },
          data: { status: "EXPIRED" },
        });
        console.log(
          `Zaktualizowano status zamówienia ${expiredOrderId} na EXPIRED`
        );
      }
      break;
    default:
      console.log(`Nieobsługiwane zdarzenie: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
