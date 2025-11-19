import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/app/lib/prisma";
import { sendOrderEmails } from "@/app/lib/sendOrderEmails";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
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
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Obsługa tylko ważnych zdarzeń
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.log("Webhook: brak orderId w metadata");
      return NextResponse.json({ received: true });
    }

    const orderIdNum = parseInt(orderId);

    // Pobieramy zamówienie z produktami
    const order = await prisma.order.findUnique({
      where: { id: orderIdNum },
      include: { items: true },
    });

    if (!order) {
      console.log(`Webhook: nie znaleziono zamówienia #${orderIdNum}`);
      return NextResponse.json({ received: true });
    }

    // Zabezpieczenie przed podwójnym wysłaniem maila
    if (order.status === "PAID") {
      console.log(`Zamówienie #${orderIdNum} już ma status PAID – pomijam`);
      return NextResponse.json({ received: true });
    }

    // Aktualizujemy status
    await prisma.order.update({
      where: { id: orderIdNum },
      data: { status: "PAID" },
    });

    // WYSYŁAMY MAILE – dopiero teraz!
    try {
      await sendOrderEmails(order, true); // true = opłacone przez Stripe
      console.log(`Zamówienie #${orderIdNum} opłacone – maile wysłane!`);
    } catch (mailError) {
      console.error(`Błąd wysyłania maili dla #${orderIdNum}:`, mailError);
      // Nie przerywamy odpowiedzi webhooka – Stripe i tak dostanie 200
    }
  }

  // Opcjonalnie: sesja wygasła po 24h bez płatności
  else if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { status: "EXPIRED" },
      });
      console.log(
        `Sesja wygasła – zamówienie #${orderId} oznaczone jako EXPIRED`
      );
    }
  }

  // Wszystkie inne zdarzenia (np. payment_intent.succeeded itp.) ignorujemy
  else {
    console.log(`Nieobsługiwane zdarzenie Stripe: ${event.type}`);
  }

  // Zawsze zwracamy 200 – Stripe wymaga tego
  return NextResponse.json({ received: true });
}
