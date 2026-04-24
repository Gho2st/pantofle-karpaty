"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCategories } from "@/app/context/categoriesContext";

const categoryMeta = {
  "dla-dzieci": {
    description: "Miękka skóra, naturalna wełna, zdrowy rozwój stopy.",
    cta: "Kolekcja dziecięca",
  },
  "dla-kobiet": {
    description: "Kapcie, klapki i sandały ze skóry — elegancja na co dzień.",
    cta: "Kolekcja damska",
  },
  "dla-mezczyzn": {
    description: "Solidne wykonanie, naturalne materiały, ponadczasowy styl.",
    cta: "Kolekcja męska",
  },
  regionalne: {
    description:
      "Wzory inspirowane folklorem karpackim — tradycja w każdym ściegu.",
    cta: "Pantofle regionalne",
  },
  klapki: {
    description: "Skórzane klapki na lato — komfort i naturalny oddech stopy.",
    cta: "Klapki skórzane",
  },
};

const fallbackMeta = {
  description: "Ręcznie szyte obuwie ze skóry naturalnej.",
  cta: "Zobacz kolekcję",
};

export default function HomeCollection() {
  const { categories, isLoading } = useCategories();
  const displayedCategories = categories.slice(0, 3);

  return (
    <section className="py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Nagłówek */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
              Nasze kolekcje
            </p>
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900">
              Obuwie dla <span className="text-red-700">każdego.</span>
            </h2>
          </div>
          <Link
            href="/kategorie"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors self-start md:self-auto"
          >
            Wszystkie kategorie
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {/* Siatka kategorii */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-[4/5] bg-gray-100 rounded-2xl animate-pulse" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {displayedCategories.map((category, index) => {
              const slug = category.slug || category.name;
              const meta = categoryMeta[slug] || fallbackMeta;
              const href = `/kategorie/${slug}`;
              const src = category.image || "/pantofle/pantofle.jpg";

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={href} className="group block">
                    {/* Zdjęcie */}
                    <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-5 relative">
                      <Image
                        src={src}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient overlay na dole */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                      {/* Label na zdjęciu */}
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-block bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full">
                          {category.name}
                        </span>
                      </div>
                    </div>

                    {/* Tekst pod zdjęciem */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-medium text-gray-900 group-hover:text-red-700 transition-colors mb-1">
                          {meta.cta}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {meta.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-gray-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all text-lg mt-0.5">
                        →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
