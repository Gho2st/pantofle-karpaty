"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCategories } from "@/app/context/categoriesContext";

const categoryMeta = {
  "dla-dzieci": {
    heading: "Obuwie dziecięce — wygoda i zdrowy rozwój stopy",
    body: "Pantofle i kapcie dla dzieci w rozmiarach 26–35. Szyjemy zarówno ze skóry naturalnej z wkładką skórzaną, jak i z wysokiej jakości materiałów syntetycznych — miękkich, przewiewnych i łatwych w pielęgnacji. Każda para tworzona z dbałością o komfort i bezpieczeństwo dziecka.",
    cta: "Kolekcja dziecięca",
  },
  "dla-kobiet": {
    heading: "Obuwie damskie — styl i komfort na co dzień",
    body: "Kapcie, klapki mule i sandały dla kobiet — dostępne w wersjach ze skóry naturalnej (welur, zamsz, lico) oraz z trwałych materiałów syntetycznych. Łączymy tradycyjne rzemiosło z nowoczesnym krojem. Idealne do noszenia w domu i jako elegancki prezent.",
    cta: "Kolekcja damska",
  },
  "dla-mezczyzn": {
    heading: "Obuwie męskie — solidne i ponadczasowe",
    body: "Pantofle, klapki i sandały męskie w rozmiarach 40–46. W ofercie modele ze skóry bydlęcej i weluru oraz wersje z materiałów syntetycznych — wszystkie z mocną podeszwą i wkładką zapewniającą komfort. Proste wzornictwo, które nie wychodzi z mody.",
    cta: "Kolekcja męska",
  },
  regionalne: {
    heading: "Pantofle regionalne i góralskie — tradycja z Karpat",
    body: "Wzory inspirowane folklorem karpackim, szyte technikami przekazywanymi z pokolenia na pokolenie. Chętnie wybierane jako pamiątka z Polski i prezent dla bliskich za granicą.",
    cta: "Pantofle regionalne",
  },
  klapki: {
    heading: "Klapki skórzane — komfort na co dzień",
    body: "Klapki ze skóry naturalnej to solidna alternatywa dla masowo produkowanego obuwia syntetycznego. Miękkie, dopasowujące się do stopy, z anatomiczną wkładką. Dostępne w wersjach damskiej i męskiej.",
    cta: "Klapki skórzane",
  },
};

const fallbackMeta = {
  heading: "Obuwie ze skóry naturalnej",
  body: "Ręcznie szyte obuwie z naturalnych materiałów — komfortowe, trwałe, ponadczasowe.",
  cta: "Zobacz kolekcję",
};

export default function SeoSection() {
  const { categories, isLoading } = useCategories();

  return (
    <section className="py-20 lg:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Nagłówek */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
            <span className="text-base">🇵🇱</span> Polski producent z Karpat
          </span>
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Skórzane obuwie domowe
            <br className="hidden sm:block" />
            <span className="text-red-700"> prosto z warsztatu.</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Pantofle Karpaty to rodzinny producent obuwia — kapci, klapek,
            sandałów i pantofli regionalnych. Produkujemy zarówno ze skóry
            naturalnej, jak i z wykorzystaniem wysokiej jakości materiałów
            syntetycznych. Każda para szyta ręcznie w Polsce, sprzedawana bez
            pośredników, wysyłana do całej Europy.
          </p>
        </div>

        {/* Siatka — kategorie ze zdjęciami */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden flex flex-col gap-0"
              >
                <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                <div className="p-7 flex flex-col gap-3">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((category, index) => {
              const slug = category.slug || category.name;
              const meta = categoryMeta[slug] || fallbackMeta;
              const href = `/kategorie/${slug}`;
              const src = category.image || "/pantofle/pantofle.jpg";

              return (
                <motion.article
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
                >
                  {/* Zdjęcie */}
                  <Link
                    href={href}
                    className="group block relative aspect-[4/3] overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={src}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-block bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full">
                        {category.name}
                      </span>
                    </div>
                  </Link>

                  {/* Tekst */}
                  <div className="p-7 flex flex-col gap-3 flex-1">
                    <h3 className="text-base font-medium text-gray-900 leading-snug">
                      {meta.heading}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed flex-1">
                      {meta.body}
                    </p>
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800 transition-colors self-start mt-1"
                    >
                      {meta.cta}
                      <span className="group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Zamknięcie SEO */}
        <p className="text-sm text-gray-400 leading-relaxed max-w-3xl mx-auto text-center mt-12">
          Szukasz kapci skórzanych, klapek ze skóry naturalnej, pantofli
          regionalnych lub góralskich? Oferujemy darmową dostawę od 200 zł i 30
          dni na zwrot. Wysyłka: następny dzień roboczy.
        </p>
      </div>
    </section>
  );
}
