// app/lib/retryToken.js
// Krótkożyjący, podpisany token uprawniający do ponowienia płatności.
// Wydaje go strona zamówienia po sprawdzeniu dostępu (właściciel albo gość
// z jednorazowym linkiem), więc gość może ponowić płatność, a obcy nie
// wygeneruje sesji Stripe dla cudzego zamówienia.
import crypto from "crypto";

const TTL_MS = 60 * 60 * 1000; // 1h

function sign(payload) {
  return crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET)
    .update(`retry-payment:${payload}`)
    .digest("hex");
}

export function createRetryToken(orderId) {
  const expires = Date.now() + TTL_MS;
  return `${expires}.${sign(`${orderId}.${expires}`)}`;
}

export function verifyRetryToken(orderId, token) {
  if (typeof token !== "string") return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;

  const expected = Buffer.from(sign(`${orderId}.${expires}`));
  const given = Buffer.from(signature);
  return (
    expected.length === given.length && crypto.timingSafeEqual(expected, given)
  );
}
