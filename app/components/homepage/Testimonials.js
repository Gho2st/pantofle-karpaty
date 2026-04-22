"use client";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Małgorzata S.",
    location: "Gdańsk",
    rating: 5,
    text: "Zakupiłam siedem par różnych klapek i kapci dla całej rodziny. Jestem bardzo zadowolona z jakości, starannego wykonania i szybkiej wysyłki. Polecam z całego serca!",
  },
  {
    name: "Marysia",
    location: "",
    rating: 5,
    text: "Świetna jakość i cena!! Polecam z całego serca 😍",
  },
  {
    name: "Agnieszka G.",
    location: "Małopolska",
    rating: 5,
    text: "Najlepszy i najbardziej rzetelny producent pantofli w Małopolsce, z jakim współpracowałam. Godny polecenia!",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Nagłówek */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-red-600 mb-3">
            <Star className="w-6 h-6 fill-current" />
            <Star className="w-6 h-6 fill-current" />
            <Star className="w-6 h-6 fill-current" />
            <Star className="w-6 h-6 fill-current" />
            <Star className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900">
            Co mówią nasi klienci?
          </h2>
          <p className="mt-3 text-gray-600 text-lg">
            Zaufanie tysięcy zadowolonych osób
          </p>
        </div>

        {/* Opinie */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              {/* Gwiazdki */}
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Treść opinii */}
              <p className="text-gray-700 leading-relaxed flex-grow text-[17px]">
                „{t.text}”
              </p>

              {/* Autor */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="font-semibold text-gray-900">{t.name}</p>
                {t.location && (
                  <p className="text-sm text-gray-500">{t.location}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
