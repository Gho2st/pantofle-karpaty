// app/zamowienie/[id]/page.js
import { notFound, redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import StripeStatus from "./StripeStatus";
import TraditionalPaymentInstructions from "../TraditionalPaymentInstructions";
import OrderSummary from "./OrderSummary";

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
    include: { items: true, user: true },
  });

  if (!order) notFound();
  return order;
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
  const isGuestWithToken =
    !session && resolvedSearchParams.guestToken === order.guestToken;

  // 1. LINK JUŻ WYGASŁ (token był, ale go nie ma)
  if (!session && resolvedSearchParams.guestToken && !order.guestToken) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Link wygasł</h1>
        <p className="text-gray-600 mb-4">
          Ten link do potwierdzenia zamówienia był{" "}
          <strong>jednorazowy</strong> i już nie działa.
        </p>
        <p className="text-sm text-gray-500">
          Sprawdź swoją skrzynkę email – wysłaliśmy Ci potwierdzenie na:
          <br />
          <strong className="text-blue-600">{order.email}</strong>
        </p>
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Wróć na stronę główną
        </a>
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
  if (!isOwner && !isGuestWithToken) {
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
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "EXPIRED" },
        });
      }
    } catch (error) {
      console.error("Błąd weryfikacji Stripe:", error);
    }
    const updatedOrder = await getOrder(id);
    order.status = updatedOrder.status;
  }

  // === TREŚĆ STRONY ===
  return (
    <div className="max-w-3xl mx-auto my-12 2xl:my-24 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Dziękujemy za Twoje zamówienie!
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8">
          Otrzymaliśmy Twoje zamówienie o numerze <strong>#{order.id}</strong>.
          <br />
          Potwierdzenie wysłaliśmy na <strong>{order.email}</strong>.
        </p>

        {order.paymentMethod === "traditional" && (
          <TraditionalPaymentInstructions order={order} />
        )}
        {order.paymentMethod === "stripe" && <StripeStatus order={order} />}

        <OrderSummary order={order} />

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-800">
            Adres dostawy
          </h2>
          <div className="bg-gray-50 p-5 rounded-lg">
            <p className="font-semibold text-gray-900">
              {order.firstName} {order.lastName}
            </p>
            <p className="text-gray-700">
              {order.email} | tel: {order.phone}
            </p>
            <p className="text-gray-700">{order.street}</p>
            <p className="text-gray-700">
              {order.postalCode} {order.city}
            </p>
            {order.deliveryMethod === "paczkomat" && (
              <p className="font-semibold text-gray-900 mt-3">
                Paczkomat: {order.paczkomat}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Masz pytania? Napisz na{" "}
            <a
              href="mailto:mwidel@pantofle-karpaty.pl"
              className="text-blue-600 underline"
            >
              mwidel@pantofle-karpaty.pl
            </a>{" "}
            lub zadzwoń: <strong>+48 608 238 103</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
