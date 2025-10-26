'use client'
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Anna K.",
    rating: 5,
    text: "Najwygodniejsze pantofle, jakie kiedykolwiek nosiłam!",
  },
  {
    name: "Piotr M.",
    rating: 4,
    text: "Solidne wykonanie, idealne na co dzień.",
  },
  {
    name: "Kasia L.",
    rating: 5,
    text: "Dziecięce pantofle są świetne, córka je uwielbia!",
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
