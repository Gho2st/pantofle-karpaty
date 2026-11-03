// app/lib/orderAccess.js
// Dostęp gościa do strony zamówienia. Jednorazowy token z linku (guestToken)
// jest wymieniany na podpisane ciasteczko dla tego jednego zamówienia
// (/api/order/[id]/access) — dzięki temu "Wstecz" i odświeżenie strony działają,
// a link z historii przeglądarki nie daje dostępu nikomu innemu.
import crypto from "crypto";

export const ACCESS_MAX_AGE_S = 30 * 24 * 60 * 60; // 30 dni

export const orderAccessCookie = (orderId) => `order_access_${orderId}`;

export function signOrderAccess(orderId) {
  return crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET)
    .update(`order-access:${orderId}`)
    .digest("hex");
}

export function hasOrderAccess(cookieValue, orderId) {
  if (typeof cookieValue !== "string") return false;
  const expected = Buffer.from(signOrderAccess(orderId));
  const given = Buffer.from(cookieValue);
  return (
    expected.length === given.length && crypto.timingSafeEqual(expected, given)
  );
}

// Adres strony zamówienia; dla gościa przez wymianę tokenu na ciasteczko.
// Zwraca adres bez dodatkowych parametrów i separator do ich doklejenia.
export function orderPageUrl(orderId, guestToken = null) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = guestToken
    ? new URL(`/api/order/${orderId}/access`, baseUrl)
    : new URL(`/zamowienie/${orderId}`, baseUrl);
  if (guestToken) url.searchParams.set("token", guestToken);
  const href = url.toString();
  return { href, sep: href.includes("?") ? "&" : "?" };
}
