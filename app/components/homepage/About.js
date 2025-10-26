import Collection from "./Collection";

export default function About() {
  return (
    <section className="max-w-7xl mx-auto py-20 px-6 sm:px-8">
      {/* NAGŁÓWEK H2 */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-gray-900 mb-8 md:mb-16 leading-tight tracking-tight">
        {/* Zmniejszono rozmiar tekstu na mniejszych ekranach (text-3xl), dodano text-gray-900 dla kontrastu */}
        Odkryj Wyjątkowe Pantofle Skórzane Karpaty – Tradycja i Jakość Prosto z
        Polski
      </h2>

      {/* Kontener dla bloku tekstu */}
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-10 text-gray-700 text-base sm:text-lg leading-relaxed">
        {/* Zmniejszono domyślny rozmiar tekstu (text-base), dodano leading-relaxed globalnie dla lepszej czytelności */}

        {/* PARAGRAF 1 */}
        <p className="leading-relaxed">
          Jesteśmy firmą Karpaty, dumnym, polskim producentem pantofli. Od lat
          specjalizujemy się w wytwarzaniu szerokiej gamy wysokiej jakości
          pantofli ze skóry naturalnej. Nasze wieloletnie doświadczenie w
          rzemiośle obuwniczym gwarantuje, że każdy produkt cechuje się nie
          tylko wysoką jakością wykonania i komfortem, ale przede wszystkim
          długą żywotnością.
        </p>

        {/* PARAGRAF 2 - Wyróżniony */}
        <p className="relative bg-white p-8 rounded-xl border border-gray-200 shadow-md italic text-gray-800 md:text-lg">
          {/* Zmieniono tło na białe (bg-white), dodano subtelny cień (shadow-md), ramkę (border), większy padding (p-8), zaokrąglone rogi (rounded-xl) */}
          Na naszej stronie znajdą Państwo pełną ofertę produktów – od pantofli
          damskich i męskich po kolekcje dla dzieci. Nasze solidne i wygodne
          pantofle ze skóry doceniło już tysiące klientów. Eksportujemy je z
          sukcesem do krajów Unii Europejskiej, w tym do Niemiec, Francji, Litwy
          i Wielkiej Brytanii, co jest najlepszym dowodem na międzynarodową
          jakość marki Karpaty.
        </p>

        {/* PARAGRAF 3 - CTA */}
        <div className="text-center">
          {/* Przeniesiono CTA do osobnego div dla lepszej kontroli nad układem */}
          <p className="leading-relaxed mb-6">
            Zapraszamy do zapoznania się ze szczegółami naszej najnowszej
            kolekcji. Jeśli mają Państwo pytania dotyczące zamówień hurtowych
            lub specyficznych modeli, nasz zespół pozostaje do Państwa
            dyspozycji.
          </p>
          <a
            href="#kontakt"
            className="inline-block bg-primary text-white font-semibold py-3 px-6 rounded-full hover:bg-primary-dark transition-colors duration-300"
          >
            {/* Dodano przycisk CTA dla lepszego wezwania do działania */}
            Skontaktuj się z nami
          </a>
        </div>
      </div>

      {/* Komponent Collection */}
      <div className="mt-12 md:mt-16">
        {/* Dodano margines nad komponentem Collection dla lepszego odstępu */}
        <Collection />
      </div>
    </section>
  );
}
