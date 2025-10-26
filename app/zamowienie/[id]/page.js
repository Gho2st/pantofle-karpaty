import { notFound } from "next/navigation";
import { CheckCircle, Clock } from "lucide-react";
import prisma from "@/app/lib/prisma";
import TraditionalPaymentInstructions from "../TraditionalPaymentInstructions";

/**
 * Komponent pomocniczy dla statusu P24
 */
function P24Status({ order, status }) {
  if (status === "success") {
    return (
      <div className="bg-green-100 p-6 rounded-lg mt-6 text-center">
        <div className="flex justify-center items-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
          <h2 className="text-xl font-semibold text-green-700">
            Płatność udana!
          </h2>
        </div>
        <p className="text-gray-700">
          Twoja płatność została pomyślnie zaksięgowana. Twoje zamówienie (nr{" "}
          {order.id}) jest już w trakcie realizacji.
        </p>
      </div>
    );
  }

  // Obsługa innych statusów, np. błędu
  return (
    <div className="bg-red-100 p-6 rounded-lg mt-6 text-center">
      <h2 className="text-xl font-semibold text-red-700">Płatność nieudana</h2>
      <p className="text-gray-700">
        Wystąpił błąd podczas przetwarzania płatności. Prosimy o kontakt.
      </p>
    </div>
  );
}

/**
 * Główna funkcja pobierająca dane na serwerze
 */
async function getOrder(id) {
  // Sprawdzamy, czy ID jest liczbą
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true, // Dołączamy pozycje zamówienia
    },
  });

  if (!order) {
    notFound(); // Wyświetli stronę 404, jeśli nie ma takiego zamówienia
  }
  return order;
}

/**
 * Komponent Strony (Server Component)
 */
export default async function OrderConfirmationPage({ params, searchParams }) {
  const order = await getOrder(params.id);

  // Pobieramy status płatności z URL (np. ...?status=success)
  const paymentStatus = searchParams.status;

  return (
    <div className="max-w-3xl mx-auto my-12 p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Dziękujemy za Twoje zamówienie!
      </h1>
      <p className="text-lg text-center text-gray-600 mb-6">
        Otrzymaliśmy Twoje zamówienie o numerze <strong>#{order.id}</strong>.
        Potwierdzenie wysłaliśmy na Twój adres email ({order.email}).
      </p>
      {/* 1. Dynamiczna sekcja Płatności */}
      {order.paymentMethod === "traditional" && (
        <TraditionalPaymentInstructions order={order} />
      )}
      {order.paymentMethod === "p24" && (
        <P24Status order={order} status={paymentStatus} />
      )}
      {/* 2. Podsumowanie zamówienia */}
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
            {/* Odczytujemy wartość `deliveryCost` zapisaną w bazie */}
            <span>{order.deliveryCost.toFixed(2)} PLN</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Łącznie</span>
            {/* Odczytujemy wartość `totalAmount` zapisaną w bazie */}
            <span>{order.totalAmount.toFixed(2)} PLN</span>
          </div>
        </div>
      </div>
      {/* 3. Dane dostawy */}
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
