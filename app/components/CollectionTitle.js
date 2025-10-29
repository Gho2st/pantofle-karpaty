// components/CollectionTitle.js
import Image from "next/image";
import Link from "next/link";

export default function CollectionTitle({
  src,
  alt,
  label,
  href,
  price,
  lowestPrice,
}) {
  const imageContainerClasses = "relative w-full h-64 lg:h-80 overflow-hidden";

  return (
    <Link
      href={href}
      className="block transform hover:scale-[1.01] transition duration-300 group bg-white"
    >
      <div className={imageContainerClasses}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:brightness-105"
        />
      </div>

      {/* Tytuł */}
      <h3 className="text-lg font-light uppercase text-center py-2 text-gray-900 group-hover:text-primary transition">
        {label}
      </h3>

      {/* CENA – TYLKO JEŚLI PODANA */}
      {price !== undefined && (
        <div className="text-center pb-4">
          <span className="text-xl font-bold text-primary">
            {price.toFixed(2)} PLN
          </span>

          {lowestPrice && lowestPrice < price && (
            <div className="text-xs text-green-600 font-medium">
              ↓ {lowestPrice.toFixed(2)} PLN
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
