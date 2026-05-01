"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/cartContext";

export default function FeaturedSlider({ products }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const step = card ? (card.offsetWidth + 16) * 2 : 600;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (!products?.length) return null;

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Nagłówek */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
              Polecane
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight">
              Wybrane dla <span className="text-red-700">Ciebie.</span>
            </h2>
          </div>

          {/* Strzałki */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className="w-12 h-12 rounded-full bg-gray-900/90 text-white text-xl flex items-center justify-center shadow-md hover:bg-gray-700 hover:shadow-lg active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300"
              aria-label="Poprzednie"
            >
              ←
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className="w-12 h-12 rounded-full bg-gray-900/90 text-white text-xl flex items-center justify-center shadow-md hover:bg-gray-700 hover:shadow-lg active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300"
              aria-label="Następne"
            >
              →
            </button>
          </div>
        </div>

        {/* Scroll track */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="featured-track flex gap-4 overflow-x-auto pb-4 -mr-6"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingRight: "1.5rem",
            }}
          >
            <style>{`.featured-track::-webkit-scrollbar { display: none; }`}</style>

            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            <div style={{ flex: "0 0 1px" }} aria-hidden />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/kategorie"
            className="group inline-flex items-center gap-3 border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900 font-medium px-8 py-4 rounded-xl transition-all duration-300"
          >
            Zobacz wszystkie produkty
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ====================== KARTA PRODUKTU ======================
function ProductCard({ product }) {
  const { getCurrentPrice } = useCart();
  const currentPrice = getCurrentPrice(product);
  const isPromo = currentPrice < product.price;
  const discount = isPromo
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;

  const images = Array.isArray(product.images) ? product.images : [];
  const primary = images[0] || "/pantofle/pantofle.jpg";

  return (
    <div
      data-card
      className="group relative shrink-0"
      style={{
        scrollSnapAlign: "start",
        flex: "0 0 clamp(200px, 48vw, 280px)",
      }}
    >
      <Link href={`/produkty/${product.slug}`} className="block">
        {/* Kafelek — kwadrat, ciepłe białe tło, contain z paddingiem */}
        <div className="relative aspect-square bg-stone-50 rounded-2xl overflow-hidden mb-3">
          <Image
            src={primary}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 48vw, 280px"
            className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />

          {/* Badge promocji */}
          {isPromo && discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm z-10">
              −{discount}%
            </div>
          )}

        </div>

        <h3 className="text-sm font-medium text-gray-900 group-hover:text-red-700 transition-colors leading-snug mb-1 line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          <span
            className={`text-sm font-semibold ${isPromo ? "text-red-600" : "text-gray-900"}`}
          >
            {currentPrice?.toFixed(2)} PLN
          </span>
          {isPromo && (
            <span className="text-xs text-gray-400 line-through">
              {product.price.toFixed(2)} PLN
            </span>
          )}
        </div>

        {product.lowestPrice != null && (
          <p className="text-xs text-gray-400 mt-0.5">
            Najniższa z 30 dni:{" "}
            <span
              className={
                product.lowestPrice < currentPrice ? "text-red-600" : ""
              }
            >
              {product.lowestPrice.toFixed(2)} PLN
            </span>
          </p>
        )}
      </Link>
    </div>
  );
}
