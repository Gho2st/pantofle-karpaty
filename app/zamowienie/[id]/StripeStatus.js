"use client";
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function StripeStatus({ order, retryToken }) {
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
        body: JSON.stringify({ retryToken }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Nie udało się wygenerować nowej sesji płatności",
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
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
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

  if (order.status === "PENDING") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-2">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <h2 className="text-xl font-semibold text-gray-900">
            Zamówienie czeka na płatność
          </h2>
        </div>
        <p className="text-gray-700">
          Jeśli płatność nie została dokończona, możesz zapłacić teraz — BLIK-iem,
          kartą, Apple Pay lub Google Pay. Jeśli już zapłaciłeś, status
          zaktualizuje się w ciągu kilku minut.
        </p>
        {error && <p className="text-red-600 mt-3">{error}</p>}
        <button
          onClick={handleRetryPayment}
          disabled={isRetrying}
          className="mt-5 w-full sm:w-auto bg-red-600 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRetrying ? "Przekierowujemy do płatności…" : "Dokończ płatność"}
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Masz problem z płatnością? Napisz:{" "}
          <a
            href="mailto:mwidel@pantofle-karpaty.pl"
            className="text-red-700 hover:underline"
          >
            mwidel@pantofle-karpaty.pl
          </a>
        </p>
      </div>
    );
  }

  // Handle CANCELLED or other statuses
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
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
