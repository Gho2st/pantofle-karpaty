'use client'
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Małgorzata S",
    rating: 5,
    text: "Zakupiłam siedem par różnych klapek i kapci dla pań i panów w rodzinie i ..... jestem bardzo zadowolona z zakupu.Nie tylko ja,obdarowani również.Bardzo dobra jakość, to przede wszystkim,duży wybór,piękne i staranne wykonanie,promocyjne ceny i szybka wysyłka.Dziękuję i polecam! Zadowolona klientka z Gdańska.",
  },
  {
    name: "Marysia",
    rating: 5,
    text: "Świetna jakość i cena!! Polecam 😍",
  },
  {
    name: "Agnieszka G",
    rating: 5,
    text: "Najlepszy i najbardziej dokładny producent pantofli w Małopolsce z jakim współpracowałam, godny polecenia i uwagi.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-[9%] bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">
        Co mówią nasi klienci
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 bg-white rounded-lg shadow-md"
          >
            <div className="flex gap-1 mb-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <p className="text-gray-600 mb-4">{testimonial.text}</p>
            <p className="font-semibold">{testimonial.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
