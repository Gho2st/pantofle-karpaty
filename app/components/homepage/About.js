import Collection from "./Collection";

export default function About() {
  return (
    // Dodajemy padding pionowy i horyzontalny do sekcji
    <section className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
      {/* NAGŁÓWEK H2 */}
      <h2 className="text-4xl lg:text-4xl font-extrabold text-center  mb-6 md:mb-12 leading-tight tracking-tight">
        Odkryj Wyjątkowe Pantofle Skórzane Karpaty – Tradycja i Jakość Prosto z
        Polski
      </h2>

      {/* Kontener dla bloku tekstu (ogranicza szerokość dla lepszej czytelności) */}
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 text-gray-700 text-lg">
        {/* PARAGRAF 1 */}
        <p className="leading-relaxed">
          Jesteśmy firmą Karpaty, dumnym, polskim producentem pantofli. Od lat
          specjalizujemy się w wytwarzaniu szerokiej gamy wysokiej jakości
          pantoflize skóry naturalnej. Nasze wieloletnie doświadczenie w
          rzemiośle obuwniczym gwarantuje, że każdy produkt cechuje się nie
          tylko wysoką jakością wykonania i komfortem, ale przede wszystkim
          długą żywotnością.
        </p>

        {/* PARAGRAF 2 - Wyróżniony np. lekkim cieniem lub większą czcionką */}
        <p className="leading-relaxed bg-gray-50 p-6 rounded-lg border-l-4 border-primary shadow-sm italic text-gray-800">
          Na naszej stronie znajdą Państwo pełną ofertę produktów – od pantofli
          damskich i męskichpo kolekcje dla dzieci. Nasze solidne i wygodne
          pantofle ze skóry doceniło już tysiące klientów. Eksportujemy je z
          sukcesem do krajów Unii Europejskiej, w tym do Niemiec, Francji, Litwy
          i Wielkiej Brytanii, co jest najlepszym dowodem na międzynarodową
          jakość marki Karpaty.
        </p>

        {/* PARAGRAF 3 - CTA */}
        <p className="leading-relaxed pt-4 text-center">
          Zapraszamy do zapoznania się ze szczegółami naszej najnowszej
          kolekcji. Jeśli mają Państwo pytania dotyczące zamówień hurtowych lub
          specyficznych modeli, nasz zespół pozostaje do Państwa dyspozycji.
          Prosimy dzwonić lub pisać – chętnie doradzimy i odpowiemy na wszystkie
          pytania.
        </p>
      </div>
      <Collection />
    </section>
  );
}
