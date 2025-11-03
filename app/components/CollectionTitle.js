// components/CollectionTitle.js
import Image from "next/image";
import Link from "next/link";

export default function CollectionTitle({
  src,
  alt,
  label,
  href,
  price,
  promoPrice,
  lowestPrice,
}) {
  const imageContainerClasses = "relative w-full h-64 lg:h-80 overflow-hidden";

  // ZABEZPIECZENIE: jeśli price i promoPrice są null/undefined → nie pokazuj ceny
  const hasPrice = price != null || promoPrice != null;
  const safePrice = price != null ? price : 0;
  const safePromoPrice = promoPrice != null ? promoPrice : 0;

  const displayPrice = promoPrice != null ? safePromoPrice : safePrice;
  const hasPromo = promoPrice != null && promoPrice < safePrice;

  // Oblicz % rabatu – tylko jeśli są liczby
  const discountPercent = hasPromo
    ? Math.round(((safePrice - safePromoPrice) / safePrice) * 100)
    : 0;

  return (
    <Link
      href={href}
      className="block transform hover:scale-[1.01] transition duration-300 group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md"
    >
      <div className={imageContainerClasses}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:brightness-105 group-hover:scale-105"
        />

        {/* PASEK Z % RABATU */}
        {hasPromo && (
          <div className="absolute top-3 left-3 bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm z-10 transform -rotate-12 transition-all duration-300 group-hover:rotate-0 group-hover:scale-110">
            -{discountPercent}%
          </div>
        )}
      </div>

      <h3 className="text-lg font-light uppercase text-center py-2 text-gray-900 group-hover:text-primary transition">
        {label}
      </h3>

      {/* CENA – TYLKO GDY JEST JAKAŚ CENA */}
      {hasPrice && (
        <div className="text-center pb-4 space-y-1">
          {/* Przekreślona cena */}
          {hasPromo && price != null && (
            <div className="text-sm text-gray-500 line-through">
              {price.toFixed(2)} PLN
            </div>
          )}

          {/* Najniższa cena z 30 dni */}
          {lowestPrice != null && lowestPrice < displayPrice && (
            <div className="text-xs text-gray-400">
              Najniższa cena: {lowestPrice.toFixed(2)} PLN
            </div>
          )}

          {/* Aktualna cena – BEZPIECZNA */}
          <div
            className={`font-bold text-xl ${
              hasPromo ? "text-red-600" : "text-primary"
            }`}
          >
            {displayPrice.toFixed(2)} PLN
          </div>
        </div>
      )}
    </Link>
  );
}
