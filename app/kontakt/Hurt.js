import { Check } from "lucide-react";

export default function Hurt() {
  return (
    <>
      <div className=" from-gray-50 to-white py-16 2xl:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              id="wholesale-heading"
              className="text-3xl sm:text-4xl 2xl:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
            >
              Zamówienia hurtowe – im więcej, tym taniej!
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto mb-10 leading-relaxed">
              Szukasz pantofli i kapci dla{" "}
              <strong>hotelu, pensjonatu, spa, sklepu lub firmy</strong>?
              Oferujemy{" "}
              <strong className="text-primary">atrakcyjne ceny hurtowe</strong>,
              elastyczne warunki współpracy oraz indywidualne podejście do
              każdego zlecenia.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
              <BenefitItem
                title="Personalizacja"
                description="Logo, kolor, rozmiar – dostosujemy produkt do Twoich potrzeb."
              />
              <BenefitItem
                title="Szybka realizacja"
                description="Zamówienia od 48h. Dostawa w całej Polsce i nie tylko."
              />
              <BenefitItem
                title="Elastyczność"
                description="Jesteśmy elastyczni do Twoich potrzeb."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Komponent pomocniczy – korzyści
function BenefitItem({ title, description }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
        <Check />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
