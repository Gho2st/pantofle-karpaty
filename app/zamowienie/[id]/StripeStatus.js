"use client";
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function StripeStatus({ order }) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState(null);

  // Handle retry payment
  const handleRetryPayment = async () => {
    setIsRetrying(true);
    setError(null);
    try {
      const response = await fetch(`/api/order/${order.id}/retry-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Nie udało się wygenerować nowej sesji płatności"
        );
      }
      const { redirectUrl } = await response.json();
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRetrying(false);
    }
  };

  if (order.status === "PAID") {
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

  if (order.status === "PENDING" || order.status === "EXPIRED") {
    return (
      <div className="bg-orange-100 p-6 rounded-lg mt-6 text-center">
        <div className="flex justify-center items-center mb-4">
          <AlertCircle className="w-8 h-8 text-orange-600 mr-2" />
          <h2 className="text-xl font-semibold text-orange-700">
            {order.status === "EXPIRED"
              ? "Sesja płatności wygasła"
              : "Płatność w toku"}
          </h2>
        </div>
        <p className="text-gray-700">
          {order.status === "EXPIRED"
            ? `Sesja płatności dla zamówienia nr ${order.id} wygasła, ponieważ płatność nie została zakończona.`
            : `Oczekujemy na potwierdzenie Twojej płatności dla zamówienia nr ${order.id}. Jeśli nie dokonałeś jeszcze płatności, możesz spróbować ponownie.`}
          Możesz spróbować ponownie lub skontaktować się z nami pod adresem{" "}
          <a
            href="mailto:mwidel@pantofle-karpaty.pl"
            className="text-blue-600 hover:underline"
          >
            mwidel@pantofle-karpaty.pl
          </a>
          .
        </p>
        {error && <p className="text-red-600 mt-2">{error}</p>}
        <button
          onClick={handleRetryPayment}
          disabled={isRetrying}
          className={`mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 ${
            isRetrying ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isRetrying ? "Generowanie sesji..." : "Spróbuj ponownie"}
        </button>
      </div>
    );
  }

  // Handle CANCELLED or other statuses
  return (
    <div className="bg-red-100 p-6 rounded-lg mt-6 text-center">
      <div className="flex justify-center items-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 mr-2" />
        <h2 className="text-xl font-semibold text-red-700">
          Płatność nieudana
        </h2>
      </div>
      <p className="text-gray-700">
        Wystąpił błąd podczas przetwarzania płatności dla zamówienia nr{" "}
        {order.id}. Prosimy złożyć nowe zamówienie lub skontaktować się z nami
        pod adresem{" "}
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
