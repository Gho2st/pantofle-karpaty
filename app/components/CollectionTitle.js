"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/context/cartContext";

export default function CollectionTitle({ src, alt, label, href, product }) {
  const { getCurrentPrice } = useCart();

  const currentPrice = product ? getCurrentPrice(product) : null;
  const isPromoActive = product ? currentPrice < product.price : false;

  // Oblicz procent rabatu (tylko jeśli promocja aktywna)
  const discountPercentage = isPromoActive
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;

  return (
    <Link href={href} className="group block relative text-left">
      {/* Obrazek z badge'em w lewym górnym rogu */}
      <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-3 relative">
        <Image
          src={src}
          alt={alt}
          width={300}
          height={300}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />

        {/* Badge z % zniżki – tylko gdy promocja */}
        {isPromoActive && discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm shadow-md">
            -{discountPercentage}%
          </div>
        )}
      </div>

      <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
        {label}
      </h3>

      {/* Cena – tylko jeśli produkt ma cenę > 0 */}
      {product && currentPrice != null && currentPrice > 0 ? (
        <div className="mt-1">
          {isPromoActive ? (
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-red-600">
                {currentPrice.toFixed(2)} PLN
              </span>
              <span className="text-sm line-through text-gray-500">
                {product.price.toFixed(2)} PLN
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary">
              {currentPrice.toFixed(2)} PLN
            </span>
          )}

          {product.lowestPrice != null && (
            <p className="text-xs text-gray-500 mt-1">
              Najniższa cena z 30 dni:{" "}
              <span
                className={
                  product.lowestPrice < currentPrice
                    ? "text-red-600 font-bold"
                    : "text-gray-700"
                }
              >
                {product.lowestPrice.toFixed(2)} PLN
              </span>
            </p>
          )}
        </div>
      ) : null}
    </Link>
  );
}
