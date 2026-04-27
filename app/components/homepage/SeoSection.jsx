// app/components/SeoSection.jsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const topics = [
  {
    href: "/kategorie/dla-dzieci",
    heading: "Obuwie dziecięce — wygoda i zdrowy rozwój stopy",
    body: "Pantofle i kapcie dla dzieci w rozmiarach 26–35. Szyjemy zarówno ze skóry naturalnej z wkładką skórzaną, jak i z wysokiej jakości materiałów syntetycznych — miękkich, przewiewnych i łatwych w pielęgnacji. Każda para tworzona z dbałością o komfort i bezpieczeństwo dziecka.",
  },
  {
    href: "/kategorie/dla-kobiet",
    heading: "Obuwie damskie — styl i komfort na co dzień",
    body: "Kapcie, klapki mule i sandały dla kobiet — dostępne w wersjach ze skóry naturalnej (welur, zamsz, lico) oraz z trwałych materiałów syntetycznych. Łączymy tradycyjne rzemiosło z nowoczesnym krojem. Idealne do noszenia w domu i jako elegancki prezent.",
  },
  {
    href: "/kategorie/dla-mezczyzn",
    heading: "Obuwie męskie — solidne i ponadczasowe",
    body: "Pantofle, klapki i sandały męskie w rozmiarach 40–46. W ofercie modele ze skóry bydlęcej i weluru oraz wersje z materiałów syntetycznych — wszystkie z mocną podeszwą i wkładką zapewniającą komfort. Proste wzornictwo, które nie wychodzi z mody.",
  },
];

export default function SeoSection() {
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
            pośredników, wysyłana do całej Europy
          </p>
        </div>

        {/* Siatka tematów — 3 kolumny na desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4"
            >
              <h3 className="text-base font-medium text-gray-900 leading-snug">
                {topic.heading}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                {topic.body}
              </p>
              <Link
                href={topic.href}
                className="group inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800 transition-colors self-start"
              >
                Zobacz kolekcję
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Zamknięcie SEO */}
        <p className="text-sm text-gray-400 leading-relaxed max-w-3xl mx-auto text-center mt-12">
          Szukasz kapci skórzanych, klapek ze skóry naturalnej, pantofli
          regionalnych lub góralskich? Oferujemy darmową dostawę od 200 zł i 30
          dni na zwrot. Wysyłka: następny dzień roboczy
        </p>
      </div>
    </section>
  );
}
