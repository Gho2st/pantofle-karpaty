// app/potwierdzenie/[id]/page.js
import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import Stripe from "stripe";
import StripeStatus from "./StripeStatus";
import TraditionalPaymentInstructions from "../TraditionalPaymentInstructions";
import OrderSummary from "./OrderSummary"; // DODAJ

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) {
    return {
      title: "Zamówienie nie znalezione | Pantofle Karpaty",
      robots: "noindex, nofollow",
    };
  }

  return {
    title: `Zamówienie #${orderId} – Potwierdzenie | Pantofle Karpaty`,
    description: `Twoje zamówienie #${orderId} zostało przyjęte. Sprawdź szczegóły i status płatności.`,
    alternates: { canonical: `/potwierdzenie/${orderId}` },
    robots: "noindex, nofollow",
  };
}

async function getOrder(id) {
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) notFound();
  return order;
}

export default async function OrderConfirmationPage({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams.session_id;

  let order = await getOrder(id);

  // Weryfikacja Stripe
  if (
    sessionId &&
    order.paymentId === sessionId &&
    order.status === "PENDING"
  ) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });
      } else if (session.status === "expired") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "EXPIRED" },
        });
      }
    } catch (error) {
      console.error("Błąd weryfikacji sesji Stripe:", error);
    }
    order = await getOrder(id);
  }

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

        {/* NOWE PODSUMOWANIE */}
        <OrderSummary order={order} />

        {/* Adres dostawy */}
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
