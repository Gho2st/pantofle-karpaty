// app/components/SeoSection.jsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const topics = [
  {
    href: "/kategorie/dla-dzieci",
    heading: "Obuwie dziecięce — zdrowy rozwój stopy",
    body: "Kapcie, pantofle i klapki dziecięce wykonane z miękkiej skóry naturalnej i owczej wełny. Pozwalają stopie swobodnie oddychać i prawidłowo się rozwijać. Każda para szyta ręcznie, bez klejów chemicznych i plastikowych wypełnień. Rozmiary od 26 do 35.",
  },
  {
    href: "/kategorie/dla-kobiet",
    heading: "Obuwie damskie ze skóry — styl i komfort",
    body: "Kapcie domowe, klapki typu mule i sandały skórzane dla kobiet. Łączą tradycyjne rzemiosło z nowoczesną sylwetką — dostępne w welurze, zamszu i gładkiej skórze licowej. Idealne do codziennego noszenia i jako elegancki prezent.",
  },
  {
    href: "/kategorie/dla-mezczyzn",
    heading: "Obuwie męskie — solidne i ponadczasowe",
    body: "Pantofle, klapki skórzane i sandały męskie z naturalnej skóry bydlęcej lub weluru. Mocna podeszwa, wkładka skórzana i prosty krój, który nie wychodzi z mody. Dostępne w rozmiarach 40–46, wytrzymują lata użytkowania.",
  },
  {
    href: "/kategorie",
    heading: "Klapki skórzane — komfort na co dzień",
    body: "Nasze klapki ze skóry naturalnej to solidna alternatywa dla masowo produkowanego obuwia syntetycznego. Miękkie, dopasowujące się do stopy, z anatomiczną wkładką. Dostępne w wersjach damskiej i męskiej — idealne na lato i do noszenia w domu.",
  },
  {
    href: "/kategorie",
    heading: "Pantofle regionalne i góralskie — tradycja z Karpat",
    body: "Pantofle regionalne inspirowane folklorem karpackim, szyte technikami przekazywanymi z pokolenia na pokolenie. Chętnie wybierane jako pamiątka z Polski i prezent dla bliskich za granicą. Wysyłamy do całej Europy.",
  },
  {
    href: "/kategorie",
    heading: "Polski producent obuwia ze skóry naturalnej",
    body: "Kapcie, klapki, sandały i pantofle regionalne — wszystko wytwarzamy ręcznie w naszym warsztacie w Męcinie. Sprzedajemy bezpośrednio, bez pośredników. Materiały: skóra bydlęca, welur, zamsz, owcza wełna. Dostawa do 12 krajów Europy.",
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
            Pantofle Karpaty to rodzinny producent obuwia ze skóry naturalnej —
            kapci, klapek, sandałów i pantofli regionalnych. Każda para szyta
            ręcznie w Polsce, sprzedawana bez pośredników, wysyłana do całej
            Europy.
          </p>
        </div>

        {/* Siatka tematów — 3 kolumny na desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => (
            <motion.article
              key={topic.href}
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
          dni na zwrot. Zamówienia złożone do 14:00 wysyłamy tego samego dnia
          roboczego.
        </p>
      </div>
    </section>
  );
}
