import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/app/lib/prisma";
import { sendOrderEmails } from "@/app/lib/sendOrderEmails";
import { expireOrder } from "@/app/lib/releaseOrder";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Płatność za zamówienie, które nie czeka już na zapłatę (np. anulowane w tej
// samej chwili, gdy klient płacił) — pieniądze wpłynęły, trzeba zdecydować ręcznie.
async function alertPaymentForClosedOrder(orderId, status, amount) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"Pantofle Karpaty" <${process.env.SMTP_USER}>`,
    to: "mwidel@pantofle-karpaty.pl",
    subject: `UWAGA: płatność za zamówienie #${orderId} (status: ${status})`,
    html: `<p>Stripe przyjął płatność <strong>${amount.toFixed(2)} zł</strong> za zamówienie <strong>#${orderId}</strong>, które ma status <strong>${status}</strong>.</p>
      <p>Status nie został zmieniony, a towar z tego zamówienia wrócił wcześniej na stan. Zwróć płatność w panelu Stripe albo skontaktuj się z klientem i zrealizuj zamówienie ręcznie.</p>`,
  });
}

export async function POST(req) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
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

    // Opłacone może zostać tylko zamówienie oczekujące — anulowane/wygasłe ma
    // już towar z powrotem na stanie
    const { count } = await prisma.order.updateMany({
      where: { id: orderIdNum, status: "PENDING" },
      data: { status: "PAID" },
    });
    if (count === 0) {
      console.error(
        `Płatność za zamówienie #${orderIdNum} w statusie ${order.status} — status bez zmian`,
      );
      if (["CANCELLED", "EXPIRED"].includes(order.status)) {
        try {
          await alertPaymentForClosedOrder(
            orderIdNum,
            order.status,
            session.amount_total / 100,
          );
        } catch (mailError) {
          console.error("Błąd wysyłania ostrzeżenia:", mailError);
        }
      }
      return NextResponse.json({ received: true });
    }

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
      const expired = await expireOrder(parseInt(orderId), session.id);
      if (expired) {
        console.log(
          `Sesja wygasła – zamówienie #${orderId} oznaczone jako EXPIRED, towar wrócił na stan`,
        );
      }
    }
  }

  // Wszystkie inne zdarzenia (np. payment_intent.succeeded itp.) ignorujemy
  else {
    console.log(`Nieobsługiwane zdarzenie Stripe: ${event.type}`);
  }

  // Zawsze zwracamy 200 – Stripe wymaga tego
  return NextResponse.json({ received: true });
}
