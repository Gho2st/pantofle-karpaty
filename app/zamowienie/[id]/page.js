import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import Stripe from "stripe";
import StripeStatus from "./StripeStatus";
import TraditionalPaymentInstructions from "../TraditionalPaymentInstructions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

async function getOrder(id) {
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }
  return order;
}

export default async function OrderConfirmationPage({ params, searchParams }) {
  const param = await params;
  // 2. Pobieramy zamówienie PIERWSZY RAZ
  let order = await getOrder(param.id);

  // 3. Await searchParams to resolve the promise
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams.session_id;

  // 4. Weryfikacja sesji Stripe (jeśli jest to powrót ze Stripe)
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

    // 5. Pobierz zamówienie PONOWNIE po aktualizacji
    order = await getOrder(params.id);
  }

  return (
    <div className="max-w-3xl mx-auto my-12 p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Dziękujemy za Twoje zamówienie!
      </h1>
      <p className="text-lg text-center text-gray-600 mb-6">
        Otrzymaliśmy Twoje zamówienie o numerze <strong>#{order.id}</strong>.
        Potwierdzenie wysłaliśmy na Twój adres email ({order.email}).
      </p>

      {order.paymentMethod === "traditional" && (
        <TraditionalPaymentInstructions order={order} />
      )}
      {order.paymentMethod === "stripe" && (
        <StripeStatus order={order} /> // Używamy zaimportowanego komponentu
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          Podsumowanie zamówienia
        </h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-2"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">
                  Rozmiar: {item.size} | Ilość: {item.quantity} x{" "}
                  {item.price.toFixed(2)} PLN
                </p>
              </div>
              <p className="font-semibold">
                {(item.price * item.quantity).toFixed(2)} PLN
              </p>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">
              Dostawa ({order.deliveryMethod})
            </span>
            <span>{order.deliveryCost.toFixed(2)} PLN</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Łącznie</span>
            <span>{order.totalAmount.toFixed(2)} PLN</span>
          </div>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          Adres dostawy
        </h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="font-semibold">
            {order.firstName} {order.lastName}
          </p>
          <p>
            {order.email} | tel: {order.phone}
          </p>
          <p>{order.street}</p>
          <p>
            {order.postalCode} {order.city}
          </p>
          {order.deliveryMethod === "paczkomat" && (
            <p className="font-semibold mt-2">Paczkomat: {order.paczkomat}</p>
          )}
        </div>
      </div>
    </div>
  );
}
