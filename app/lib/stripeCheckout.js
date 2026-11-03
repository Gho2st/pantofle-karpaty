// app/lib/stripeCheckout.js
// Tworzenie sesji płatności Stripe dla zamówienia — wspólne dla checkoutu,
// ponowienia płatności i maila z przypomnieniem.
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Pierwsza sesja jest krótka: po jej wygaśnięciu klient dostaje mail
// z przypomnieniem i nową, dobową sesją (patrz stripe-webhook)
export const FIRST_SESSION_MINUTES = 60;

export async function createCheckoutSession({
  order,
  guestToken = null,
  // true = przypomnienie już nie przysługuje (wysłane albo klient sam wrócił)
  reminderSent = false,
  expiresInMinutes = null,
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const orderUrl = new URL(`/zamowienie/${order.id}`, baseUrl);
  if (guestToken) orderUrl.searchParams.set("guestToken", guestToken);
  const url = orderUrl.toString();
  const sep = url.includes("?") ? "&" : "?";

  return stripe.checkout.sessions.create({
    mode: "payment",
    currency: "pln",
    customer_email: order.email,
    metadata: {
      orderId: order.id.toString(),
      ...(reminderSent && { reminderSent: "1" }),
    },
    ...(expiresInMinutes && {
      expires_at: Math.floor(Date.now() / 1000) + expiresInMinutes * 60,
    }),
    // {CHECKOUT_SESSION_ID} podstawia Stripe — strona zamówienia weryfikuje nim płatność.
    // Doklejamy ręcznie, bo URL zakodowałby nawiasy klamrowe.
    success_url: `${url}${sep}payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url}${sep}status=error`,
    line_items: [
      {
        price_data: {
          currency: "pln",
          product_data: { name: `Zamówienie #${order.id}` },
          unit_amount: Math.round(order.totalAmount * 100),
        },
        quantity: 1,
      },
    ],
  });
}
