// app/zamowienie/PaymentMethodSelector.js
"use client";
import { useEffect, useState } from "react";
import { Smartphone, Landmark, Check } from "lucide-react";

const OPTIONS = [
  {
    value: "stripe",
    title: "Płatność online",
    description: "Wysyłamy najszybciej — zaraz po opłaceniu zamówienia.",
    // Logotypy: BLIK (oficjalne, blik.com), pozostałe z Simple Icons (CC0)
    logos: [
      { src: "/payments/blik.svg", alt: "BLIK", className: "h-5" },
      { src: "/payments/apple-pay.svg", alt: "Apple Pay", className: "h-5" },
      {
        src: "/payments/google-pay.svg",
        alt: "Google Pay",
        className: "h-3.5",
      },
      { src: "/payments/visa.svg", alt: "Visa", className: "h-3" },
      {
        src: "/payments/mastercard.svg",
        alt: "Mastercard",
        className: "h-4",
      },
    ],
    Icon: Smartphone,
  },
  {
    value: "traditional",
    title: "Przelew tradycyjny",
    description:
      "Dane do przelewu wyślemy mailem. Wysyłamy po zaksięgowaniu wpłaty.",
    logos: [],
    Icon: Landmark,
  },
];

// Przeglądarki wbudowane w Instagram i Facebook nie obsługują Apple Pay
const isSocialInAppBrowser = () =>
  /Instagram|FBAN|FBAV|FB_IAB/i.test(navigator.userAgent);

export default function PaymentMethodSelector({
  paymentMethod,
  handlePaymentMethodChange,
}) {
  const [inAppBrowser, setInAppBrowser] = useState(false);
  useEffect(() => setInAppBrowser(isSocialInAppBrowser()), []);

  return (
    <fieldset>
      <legend className="text-lg font-semibold text-gray-900 mb-4">
        Metoda płatności
      </legend>
      <div className="flex flex-col gap-3">
        {OPTIONS.map(({ value, title, description, logos, Icon }) => {
          const selected = paymentMethod === value;
          return (
            <label
              key={value}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red-600 has-[:focus-visible]:ring-offset-2 ${
                selected
                  ? "border-red-600 bg-red-50/50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={value}
                checked={selected}
                onChange={handlePaymentMethodChange}
                className="sr-only"
              />
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? "border-red-600 bg-red-600" : "border-gray-300"
                }`}
              >
                {selected && <Check className="h-3 w-3 text-white" />}
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 font-medium text-gray-900">
                  <Icon className="h-4 w-4 text-gray-500" />
                  {title}
                </span>
                <span className="block text-sm text-gray-600 mt-1">
                  {description}
                </span>
                {logos.length > 0 && (
                  <span className="flex flex-wrap gap-1.5 mt-2.5">
                    {logos.map(({ src, alt, className }) => (
                      <span
                        key={alt}
                        className="flex h-8 items-center justify-center rounded border border-gray-200 bg-white px-2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={alt}
                          className={`${className} w-auto`}
                        />
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {inAppBrowser && paymentMethod === "stripe" && (
        <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Przeglądasz sklep w aplikacji Instagram lub Facebook — Apple Pay może
          tu nie działać. Zapłacisz BLIK-iem lub kartą, albo otwórz stronę w
          przeglądarce: <strong>⋯ → Otwórz w przeglądarce</strong>.
        </p>
      )}
    </fieldset>
  );
}
