"use client";
import CollectionTitle from "@/app/components/CollectionTitle";
import Link from "next/link";

export default function BlogProducts({ products }) {
  if (!products?.length) return null;

  return (
    <section className="mt-24 pt-16 border-t border-gray-100">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
            Sklep
          </p>
          <h2 className="text-2xl md:text-3xl font-light text-gray-900">
            Może Cię zainteresować
          </h2>
        </div>
        <Link
          href="/kategorie"
          className="group hidden sm:inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Wszystkie produkty
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => {
          const image =
            Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : "/pantofle/pantofle.jpg";

          return (
            <CollectionTitle
              key={product.id}
              src={image}
              alt={product.name}
              label={product.name}
              href={`/produkty/${product.slug}`}
              product={product}
            />
          );
        })}
      </div>

      <div className="mt-8 sm:hidden">
        <Link
          href="/kategorie"
          className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Wszystkie produkty
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
