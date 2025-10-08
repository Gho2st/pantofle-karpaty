import Image from "next/image";
import Link from "next/link";

export default function CollectionTile({ src, alt, label, href }) {
  // Kontener obrazu bez zaokrągleń
  const imageContainerClasses = "relative w-full h-64 lg:h-80 overflow-hidden";

  return (
    // Cały kafelek jako klikalny link
    <Link
      href={href}
      // Usunięto shadow-xl, rounded-lg. Hover scale zmniejszony dla subtelności.
      className="block transform hover:scale-[1.01] transition duration-300 group bg-white"
    >
      <div className={imageContainerClasses}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          // Usunięto opacity: obraz staje się tylko jaśniejszy na hover
          className="object-cover transition duration-500 group-hover:brightness-105"
        />
      </div>

      {/* Podpis/Tytuł pod obrazem */}
      <h3 className="text-lg font-light uppercase text-center py-4 text-gray-900 group-hover:text-primary transition">
        {label}
      </h3>
    </Link>
  );
}
