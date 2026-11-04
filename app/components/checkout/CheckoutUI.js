// app/components/checkout/CheckoutUI.js
// Wspólne elementy koszyka, formularza zamówienia i strony potwierdzenia —
// jeden zestaw rozmiarów, kart, zdjęć i formatów cen dla całej ścieżki zakupu.
import Image from "next/image";
import { Check } from "lucide-react";

const priceFormat = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
});

// "349,97 zł"
export const formatPrice = (value) => priceFormat.format(Number(value) || 0);

export const CARD = "bg-white rounded-2xl border border-gray-200 p-5 sm:p-6";

const STEPS = ["Koszyk", "Dane i płatność", "Potwierdzenie"];

export function CheckoutSteps({ current }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm mb-6">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`flex items-center gap-1.5 ${
                active
                  ? "font-semibold text-gray-900"
                  : done
                    ? "text-gray-700"
                    : "text-gray-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  active
                    ? "bg-red-600 text-white"
                    : done
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : step}
              </span>
              {label}
            </span>
            {step < STEPS.length && (
              <span className="h-px w-4 sm:w-8 bg-gray-300" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function PageShell({ step, title, subtitle, children }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 lg:py-14">
      <CheckoutSteps current={step} />
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      <div className="mt-6 lg:mt-8">{children}</div>
    </div>
  );
}

export function SectionTitle({ children, className = "" }) {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 mb-4 ${className}`}>
      {children}
    </h2>
  );
}

// Miniatura produktu — ten sam rozmiar i tło na wszystkich ekranach
export function ProductThumb({ src, alt, size = "md" }) {
  const box = size === "lg" ? "h-20 w-20 sm:h-24 sm:w-24" : "h-16 w-16";
  return (
    <div
      className={`${box} shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          className="h-full w-full object-contain p-1"
        />
      ) : null}
    </div>
  );
}

// Wiersz produktu w podsumowaniu (zamówienie, potwierdzenie)
export function ProductLine({
  image,
  name,
  size,
  quantity,
  unitPrice,
  regularPrice,
}) {
  const isPromo = regularPrice && regularPrice > unitPrice;
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <div className="relative">
        <ProductThumb src={image} alt={name} />
        {quantity > 1 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[11px] font-medium text-white">
            {quantity}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 leading-snug">{name}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          Rozmiar {size} · {quantity} szt.
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900 tabular-nums">
          {formatPrice(unitPrice * quantity)}
        </p>
        {isPromo && (
          <p className="text-xs text-gray-400 line-through tabular-nums">
            {formatPrice(regularPrice * quantity)}
          </p>
        )}
      </div>
    </li>
  );
}

// Wiersz kwoty w podsumowaniu; tone: "default" | "discount" | "total"
export function SummaryRow({ label, value, tone = "default" }) {
  if (tone === "total") {
    return (
      <div className="flex items-baseline justify-between border-t border-gray-200 pt-4 mt-4">
        <span className="text-base font-semibold text-gray-900">{label}</span>
        <span className="text-xl font-semibold text-gray-900 tabular-nums">
          {value}
        </span>
      </div>
    );
  }
  return (
    <div
      className={`flex justify-between text-sm ${
        tone === "discount" ? "text-green-700" : "text-gray-600"
      }`}
    >
      <span>{label}</span>
      <span
        className={`tabular-nums ${tone === "discount" ? "" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

export const PRIMARY_BUTTON =
  "w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3.5 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
