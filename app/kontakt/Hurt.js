import { Check } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    title: "Personalizacja",
    description:
      "Logo, kolor, rozmiar — dostosujemy produkt do Twoich potrzeb.",
  },
  {
    title: "Szybka realizacja",
    description: "Zamówienia od 48h. Dostawa w całej Polsce i nie tylko.",
  },
  {
    title: "Elastyczność",
    description:
      "Indywidualne podejście i warunki współpracy dla każdego klienta.",
  },
];

export default function Hurt() {
  return (
    <section className="py-20 lg:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto ">
        {/* Nagłówek */}
        <div className="mb-14">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
            Współpraca B2B
          </p>
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4 max-w-2xl leading-tight">
            Zamówienia hurtowe —{" "}
            <span className="text-red-700">im więcej, tym taniej.</span>
          </h2>
          <p className="text-base text-gray-500 leading-relaxed max-w-2xl">
            Współpracujemy z firmami, sklepami oraz partnerami biznesowymi,
            oferując sprzedaż hurtową naszego obuwia. Chętnie przygotujemy
            indywidualną ofertę dopasowaną do potrzeb Państwa firmy
          </p>
        </div>

        {/* Karty */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <Check size={16} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {b.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
