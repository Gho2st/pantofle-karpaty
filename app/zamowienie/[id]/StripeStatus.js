import { CheckCircle, Clock } from "lucide-react";

export default function StripeStatus({ order }) {
  // Odczytujemy status bezpośrednio z obiektu zamówienia
  const status = order.status;

  if (status === "PAID") {
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

  if (status === "PENDING") {
    return (
      <div className="bg-yellow-100 p-6 rounded-lg mt-6 text-center">
        <div className="flex justify-center items-center mb-4">
          <Clock className="w-8 h-8 text-yellow-600 mr-2" />
          <h2 className="text-xl font-semibold text-yellow-700">
            Płatność w toku
          </h2>
        </div>
        <p className="text-gray-700">
          Oczekujemy na potwierdzenie Twojej płatności.
        </p>
      </div>
    );
  }

  if (status === "EXPIRED") {
    return (
      <div className="bg-orange-100 p-6 rounded-lg mt-6 text-center">
        <h2 className="text-xl font-semibold text-orange-700">
          Płatność wygasła
        </h2>
        <p className="text-gray-700">
          Sesja płatności wygasła. Spróbuj ponownie.
        </p>
      </div>
    );
  }

  // Domyślnie "ERROR", "CANCELLED" lub inny nieznany status
  return (
    <div className="bg-red-100 p-6 rounded-lg mt-6 text-center">
      <h2 className="text-xl font-semibold text-red-700">Płatność nieudana</h2>
      <p className="text-gray-700">
        Wystąpił błąd podczas przetwarzania płatności. Prosimy o kontakt.
      </p>
    </div>
  );
}
