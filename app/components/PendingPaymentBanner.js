"use client";
// Baner "Masz niedokończone zamówienie" — koszyk jest czyszczony przy składaniu
// zamówienia, więc klient, który wrócił ze Stripe bez płacenia, widział pusty
// koszyk i nie miał jak wrócić do płatności.
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

const STORAGE_KEY = "pendingPayment";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function savePendingPayment({ orderId, totalAmount, retryToken }) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ orderId, totalAmount, retryToken, savedAt: Date.now() })
    );
  } catch {
    // brak localStorage (tryb prywatny) — baner się po prostu nie pokaże
  }
}

function clearPendingPayment() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export default function PendingPaymentBanner() {
  const [pending, setPending] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {}
    if (!saved?.orderId) return;
    if (Date.now() - saved.savedAt > MAX_AGE_MS) return clearPendingPayment();

    // Sprawdź na serwerze, czy zamówienie nadal czeka (mogło zostać opłacone lub wygasnąć)
    fetch(`/api/order/${saved.orderId}/pending`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ retryToken: saved.retryToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.pending) setPending({ ...saved, totalAmount: data.totalAmount });
        else clearPendingPayment();
      })
      .catch(() => {});
  }, []);

  if (!pending) return null;

  const resumePayment = async () => {
    setIsRedirecting(true);
    setError("");
    try {
      const res = await fetch(`/api/order/${pending.orderId}/retry-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retryToken: pending.retryToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirectUrl) throw new Error(data.error);
      window.location.href = data.redirectUrl;
    } catch {
      setError("Nie udało się otworzyć płatności. Spróbuj ponownie za chwilę.");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
      <AlertCircle className="hidden sm:block h-6 w-6 shrink-0 text-amber-600" />
      <div className="flex-1">
        <p className="font-semibold text-gray-900">
          Masz niedokończone zamówienie #{pending.orderId}
        </p>
        <p className="text-sm text-gray-600">
          Produkty czekają na Ciebie — dokończ płatność{" "}
          {pending.totalAmount.toFixed(2)} zł, bez ponownego składania
          zamówienia.
        </p>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
      <button
        type="button"
        onClick={resumePayment}
        disabled={isRedirecting}
        className="shrink-0 bg-red-600 text-white font-medium px-5 py-2.5 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {isRedirecting ? "Przekierowujemy…" : "Dokończ płatność"}
      </button>
    </div>
  );
}
