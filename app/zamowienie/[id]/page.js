// app/zamowienie/[id]/page.js
import { notFound, redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import StripeStatus from "./StripeStatus";
import TraditionalPaymentInstructions from "../TraditionalPaymentInstructions";
import OrderSummary from "./OrderSummary";
import {
  CARD,
  PRIMARY_BUTTON,
  PageShell,
  SectionTitle,
} from "@/app/components/checkout/CheckoutUI";
import PurchaseTracker from "./PurchaseTracker";
import { expireOrder } from "@/app/lib/releaseOrder";
import { createRetryToken } from "@/app/lib/retryToken";
import { cookies } from "next/headers";
import { hasOrderAccess, orderAccessCookie } from "@/app/lib/orderAccess";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) {
    return {
      title: "Zamówienie nie znalezione | Pantofle Karpaty",
      robots: "noindex, nofollow, noarchive",
    };
  }

  return {
    title: `Zamówienie #${orderId} – Potwierdzenie | Pantofle Karpaty`,
    description: `Twoje zamówienie #${orderId} zostało przyjęte.`,
    robots: "noindex, nofollow, noarchive",
  };
}

async function getOrder(id) {
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { images: true } } } },
      user: true,
    },
  });

  if (!order) notFound();
  return order;
}

// Wygasłe zamówienie: bez danych do przelewu i bez ponawiania płatności —
// towar wrócił już na stan.
function ExpiredNotice({ orderId }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Zamówienie wygasło
      </h2>
      <p className="text-gray-600">
        Zamówienie nr {orderId} nie zostało opłacone w terminie i zostało
        anulowane. Prosimy nie dokonywać płatności — jeśli nadal chcesz kupić
        te produkty, złóż nowe zamówienie. W razie pytań napisz do nas:{" "}
        <a
          href="mailto:mwidel@pantofle-karpaty.pl"
          className="text-blue-600 hover:underline"
        >
          mwidel@pantofle-karpaty.pl
        </a>
        .
      </p>
    </div>
  );
}

export default async function OrderConfirmationPage({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams.session_id;
  const session = await getServerSession(authOptions);

  const order = await getOrder(id);

  // === AUTORYZACJA ===
  const userEmail = session?.user?.email;
  const isOwner = userEmail && order.user?.email === userEmail;
  // Stary sposób (?guestToken=) — dla linków z płatności sprzed wprowadzenia ciasteczka
  const isGuestWithToken =
    !session &&
    !!resolvedSearchParams.guestToken &&
    resolvedSearchParams.guestToken === order.guestToken;
  // Ciasteczko z /api/order/[id]/access — działa przy "Wstecz" i odświeżeniu
  const cookieStore = await cookies();
  const hasAccessCookie = hasOrderAccess(
    cookieStore.get(orderAccessCookie(order.id))?.value,
    order.id,
  );

  // 1. LINK JUŻ WYGASŁ (token był, ale go nie ma)
  if (
    !session &&
    !hasAccessCookie &&
    resolvedSearchParams.guestToken &&
    !order.guestToken
  ) {
    // Adres maskowany — stary link może otworzyć ktoś inny niż klient
    const [local, domain] = order.email.split("@");
    const maskedEmail = `${local.slice(0, 2)}***@${domain}`;
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className={`${CARD} text-center`}>
          <h1 className="text-xl font-semibold text-gray-900 mb-3">
            Link wygasł
          </h1>
          <p className="text-gray-600 mb-3">
            Ten link do potwierdzenia zamówienia był jednorazowy i już nie
            działa.
          </p>
          <p className="text-sm text-gray-500">
            Potwierdzenie zamówienia wysłaliśmy na adres{" "}
            <strong className="text-gray-900">{maskedEmail}</strong>.
          </p>
          <a href="/" className={`${PRIMARY_BUTTON} mt-6`}>
            Wróć na stronę główną
          </a>
        </div>
      </div>
    );
  }

  // 2. POPRAWNY TOKEN → USUŃ GO OD RAZU
  if (isGuestWithToken) {
    await prisma.order.update({
      where: { id: order.id },
      data: { guestToken: null },
    });
  }

  // 3. BRAK DOSTĘPU → przekieruj
  if (!isOwner && !isGuestWithToken && !hasAccessCookie) {
    redirect("/zamowienie/brak-dostepu");
  }

  // === WERYFIKACJA STRIPE ===
  if (
    sessionId &&
    order.paymentId === sessionId &&
    order.status === "PENDING"
  ) {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
      if (stripeSession.payment_status === "paid") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });
      } else if (stripeSession.status === "expired") {
        await expireOrder(order.id, sessionId);
      }
    } catch (error) {
      console.error("Błąd weryfikacji Stripe:", error);
    }
    const updatedOrder = await getOrder(id);
    order.status = updatedOrder.status;
  }

  // Meta Pixel: zakup opłacony przez Stripe albo złożone zamówienie na przelew.
  // Tylko świeże zamówienia — oglądanie starych w profilu nie raportuje zakupu.
  const isFreshOrder =
    Date.now() - new Date(order.createdAt).getTime() < 24 * 3600e3;
  const trackPurchase =
    isFreshOrder &&
    ((order.paymentMethod === "stripe" && order.status === "PAID") ||
      (order.paymentMethod === "traditional" && order.status === "PENDING"));

  // === TREŚĆ STRONY ===
  return (
    <PageShell
      step={3}
      title="Dziękujemy za zamówienie!"
      subtitle={
        <>
          Zamówienie <strong>#{order.id}</strong> zostało przyjęte.
          Potwierdzenie wysłaliśmy na <strong>{order.email}</strong>.
        </>
      }
    >
      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        <div className="lg:col-span-2 space-y-6">
          {order.status === "EXPIRED" ? (
            <ExpiredNotice orderId={order.id} />
          ) : (
            <>
              {order.paymentMethod === "traditional" &&
                order.status === "PENDING" && (
                  <TraditionalPaymentInstructions order={order} />
                )}
              {order.paymentMethod === "stripe" && (
                <StripeStatus
                  order={order}
                  retryToken={
                    order.status === "PENDING"
                      ? createRetryToken(order.id)
                      : null
                  }
                />
              )}
            </>
          )}

          <div className={CARD}>
            <SectionTitle>Dostawa</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Odbiorca
                </p>
                <p className="font-medium text-gray-900">
                  {order.firstName} {order.lastName}
                </p>
                <p className="text-gray-600">{order.email}</p>
                <p className="text-gray-600">tel. {order.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  {order.deliveryMethod === "paczkomat"
                    ? "Paczkomat InPost"
                    : "Adres (kurier InPost)"}
                </p>
                {order.deliveryMethod === "paczkomat" && (
                  <p className="font-medium text-gray-900">{order.paczkomat}</p>
                )}
                <p className="text-gray-600">{order.street}</p>
                <p className="text-gray-600">
                  {order.postalCode} {order.city}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Masz pytania? Napisz na{" "}
            <a
              href="mailto:mwidel@pantofle-karpaty.pl"
              className="text-red-700 hover:underline"
            >
              mwidel@pantofle-karpaty.pl
            </a>{" "}
            lub zadzwoń: <strong>+48 608 238 103</strong>
          </p>
        </div>

        <div className="mt-6 lg:mt-0 lg:sticky lg:top-24">
          <OrderSummary order={order} />
        </div>
      </div>

      {trackPurchase && (
        <PurchaseTracker
          orderId={order.id}
          value={order.totalAmount}
          items={order.items.map((item) => ({
            id: item.productId,
            quantity: item.quantity,
            price: item.promoPrice || item.price,
          }))}
        />
      )}
    </PageShell>
  );
}
