"use client";
import Image from "next/image";
import Link from "next/link";
// import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useCart } from "@/app/context/cartContext";

export default function ProductDetails({ product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showCartLink, setShowCartLink] = useState(false);

  const images = product.images || [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const mobileCarouselRef = useRef(null);
  const mobileSlideRefs = useRef([]);
  const mobileThumbRefs = useRef([]);
  const desktopThumbRefs = useRef([]);
  const scrollTimer = useRef(null);

  const mainDesktopImage =
    images.length > 0 ? images[activeIndex] : "/placeholder.png";

  // Ustaw początkowy activeIndex na 0, jeśli są obrazy
  useEffect(() => {
    if (images.length > 0 && activeIndex === -1) {
      setActiveIndex(0);
    }
  }, [images, activeIndex]);

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
    if (mobileSlideRefs.current[index]) {
      mobileSlideRefs.current[index].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const handleMobileScroll = () => {
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }

    scrollTimer.current = setTimeout(() => {
      if (mobileCarouselRef.current) {
        const { scrollLeft, clientWidth } = mobileCarouselRef.current;
        if (clientWidth === 0) return;

        const newIndex = Math.round(scrollLeft / clientWidth);
        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex);
          if (mobileThumbRefs.current[newIndex]) {
            mobileThumbRefs.current[newIndex].scrollIntoView({
              behavior: "smooth",
              inline: "center",
              block: "nearest",
            });
          }
        }
      }
    }, 150);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!selectedSize) {
      toast.error("Wybierz rozmiar");
      return;
    }
    try {
      await addToCart(product.id, selectedSize, quantity, product);
      setIsAdded(true);
      setShowCartLink(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Błąd podczas dodawania do koszyka:", error);
      toast.error("Błąd serwera");
    }
  };

  const stockForSelectedSize =
    product.sizes.find((s) => s.size === selectedSize)?.stock || 0;

  return (
    <div className="max-w-7xl mx-auto my-12 md:my-24 px-4 flex flex-col md:flex-row gap-8 md:gap-16">
      {/* === SEKCJA GALERII === */}

      {/* --- 1. GALERIA DESKTOP (Ukryta na mobile) --- */}
      <div className="w-full md:w-1/3 hidden md:flex gap-4">
        {/* Kolumna miniaturek (Desktop) */}
        {images.length > 0 && ( // Zmieniono z > 1 na > 0, aby zawsze wyświetlać jeśli jest zdjęcie
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
            {" "}
            {/* scrollbar-hide, jeśli używasz niestandardowego scrollbara */}
            {images.map((image, index) => (
              <div
                key={`desktop-thumb-${index}`}
                ref={(el) => (desktopThumbRefs.current[index] = el)}
                className="relative flex-shrink-0 w-20 h-24 rounded-md overflow-hidden cursor-pointer"
                onClick={() => handleThumbnailClick(index)}
              >
                <Image
                  src={image}
                  fill
                  sizes="5vw"
                  style={{ objectFit: "cover" }} // Miniaturki zawsze 'cover'
                  alt={`${product.name} - miniaturka ${index + 1}`}
                  className={`transition-all duration-200 ${
                    activeIndex === index
                      ? "ring-2 ring-red-600 ring-inset"
                      : "ring-1 ring-gray-200 hover:ring-gray-400"
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Główne zdjęcie (Desktop) */}
        <div className="flex-1 min-w-0">
          {" "}
          {/* min-w-0 jest ważne dla flex-1 w niektórych kontekstach */}
          <div
            className="relative w-full aspect-[4/5] rounded-md overflow-hidden cursor-zoom-in bg-gray-100" // Tło dla jednolitości
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={mainDesktopImage}
              fill
              sizes="33vw"
              style={{
                objectFit: "cover", // *** ZMIANA: object-fit na 'cover' ***
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
              alt={`${product.name} - zdjęcie główne`}
              className={`transition-transform duration-100 ease-linear ${
                isZoomed ? "scale-150 md:scale-200" : "scale-100"
              }`}
              priority
            />
          </div>
        </div>
      </div>

      {/* --- 2. KARUZELA MOBILNA (Ukryta na desktopie) --- */}
      <div className="w-full md:hidden flex flex-col gap-4">
        {/* Kontener karuzeli (Scroll Snap) */}
        <div
          ref={mobileCarouselRef}
          onScroll={handleMobileScroll}
          className="flex overflow-x-auto scroll-snap-x mandatory w-full" // snap-mandatory zamiast scroll-snap-type-x-mandatory
        >
          {images.map((image, index) => (
            <div
              key={`mobile-slide-${index}`}
              ref={(el) => (mobileSlideRefs.current[index] = el)}
              className="w-full flex-shrink-0 snap-center"
            >
              <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={image}
                  fill
                  sizes="90vw"
                  className="px-1"
                  style={{ objectFit: "cover" }} // *
                  alt={`${product.name} - zdjęcie ${index + 1}`}
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
          {/* Fallback dla braku zdjęć, jeśli images.length === 0 */}
          {images.length === 0 && (
            <div className="w-full flex-shrink-0 snap-center">
              <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src="/placeholder.png"
                  fill
                  style={{ objectFit: "contain" }} // Placeholder może być 'contain'
                  alt="Brak zdjęcia"
                  priority
                />
              </div>
            </div>
          )}
        </div>

        {/* Miniaturki (Mobile) */}
        {images.length > 0 && ( // Zmieniono z > 1 na > 0
          <div className="flex flex-row gap-2 overflow-x-auto p-2 scroll-snap-x snap-start">
            {images.map((image, index) => (
              <div
                key={`mobile-thumb-${index}`}
                ref={(el) => (mobileThumbRefs.current[index] = el)}
                className="relative flex-shrink-0 w-16 h-20 rounded-md overflow-hidden cursor-pointer"
                onClick={() => handleThumbnailClick(index)}
              >
                <Image
                  src={image}
                  fill
                  sizes="10vw"
                  style={{ objectFit: "cover" }}
                  alt={`Miniaturka ${index + 1}`}
                  className={`transition-all duration-200 ${
                    activeIndex === index
                      ? "ring-2 ring-red-600 ring-inset"
                      : "ring-1 ring-gray-200"
                  }`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* === KONIEC SEKCJI GALERII === */}

      {/* --- SEKCJA SZCZEGÓŁÓW --- */}
      <div className="w-full md:w-2/3">
        <h1 className="text-3xl md:text-4xl uppercase mb-6">{product.name}</h1>
        <span className="font-light text-2xl">{product.price} PLN</span>
        <p className="mt-6 md:mt-10 text-gray-700">{product.description}</p>

        <form onSubmit={handleAddToCart} className="mt-6">
          <div className="mb-4">
            <label htmlFor="size" className="block text-lg font-medium mb-2">
              Wybierz rozmiar:
            </label>
            <select
              id="size"
              name="size"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
              required
            >
              <option value="" disabled>
                Wybierz rozmiar
              </option>
              {product.sizes.map((sizeOption) => (
                <option
                  key={sizeOption.size}
                  value={sizeOption.size}
                  disabled={sizeOption.stock === 0}
                >
                  Rozmiar {sizeOption.size}{" "}
                  {sizeOption.stock === 0
                    ? "(Brak w magazynie)"
                    : `(Na stanie: ${sizeOption.stock})`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="quantity"
              className="block text-lg font-medium mb-2"
            >
              Ilość:
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              max={stockForSelectedSize > 0 ? stockForSelectedSize : 1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
              disabled={!selectedSize || stockForSelectedSize === 0}
              required
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button
              type="submit"
              className={`px-6 py-3 rounded-md text-white transition duration-300 ${
                isAdded
                  ? "bg-green-600"
                  : "bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
              }`}
              disabled={isAdded || !selectedSize || stockForSelectedSize === 0}
            >
              {isAdded ? "Dodano!" : "Dodaj do koszyka"}
            </button>

            {showCartLink && (
              <Link
                href="/koszyk"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Przejdź do koszyka
              </Link>
            )}
          </div>
        </form>

        {product.description2 && (
          <p className="mt-10 text-gray-700">{product.description2}</p>
        )}
        {product.additionalInfo && (
          <p className="mt-10 text-gray-700">{product.additionalInfo}</p>
        )}
      </div>
    </div>
  );
}
