"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react"; // Usunięto useRef i useEffect
import { toast } from "react-toastify";
import { useCart } from "@/app/context/cartContext";

// Importy Swipera
import { Swiper, SwiperSlide } from "swiper/react";
// Usunięto 'Thumbs'
import { Zoom, Navigation, Pagination } from "swiper/modules";

// Importy stylów Swipera
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";
// Usunięto "swiper/css/thumbs";

export default function ProductDetails({ product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showCartLink, setShowCartLink] = useState(false);

  // Usunięto stan 'thumbsSwiper'

  const images = product.images || [];

  const handleAddToCart = async (e) => {
    // ... (bez zmian)
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
      {/* === NOWA SEKCJA GALERII (tylko główna karuzela) === */}
      {/* Szerokość ustawiona na md:w-1/3, tak jak w oryginale */}
      <div className="w-full md:w-1/3">
        <Swiper
          // Usunięto moduł 'Thumbs' i prop 'thumbs'
          modules={[Zoom, Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation={true} // Strzałki
          pagination={{ clickable: true }} // Kropki
          zoom={true} // Zoom
          className="w-full product-gallery-swiper"
        >
          {images.length > 0 ? (
            images.map((image, index) => (
              <SwiperSlide
                key={`main-${index}`}
                className="relative aspect-[4/5] bg-gray-100 rounded-md overflow-hidden"
              >
                <div className="swiper-zoom-container">
                  {" "}
                  {/* Wymagane dla zoomu */}
                  <Image
                    src={image}
                    fill
                    sizes="(max-width: 768px) 90vw, 33vw" // Dostosowano sizes
                    style={{ objectFit: "cover" }}
                    alt={`${product.name} - zdjęcie ${index + 1}`}
                    priority={index === 0}
                  />
                </div>
              </SwiperSlide>
            ))
          ) : (
            // Fallback, jeśli nie ma zdjęć
            <SwiperSlide className="relative aspect-[4/5] bg-gray-100 rounded-md overflow-hidden">
              <Image
                src="/placeholder.png"
                fill
                style={{ objectFit: "contain" }}
                alt="Brak zdjęcia"
                priority
              />
            </SwiperSlide>
          )}
        </Swiper>
      </div>
      {/* === KONIEC NOWEJ SEKCJI GALERII === */}

      {/* --- SEKCJA SZCZEGÓŁÓW --- */}
      {/* Szerokość ustawiona na md:w-2/3, tak jak w oryginale */}
      <div className="w-full md:w-2/3">
        <h1 className="text-3xl md:text-4xl uppercase mb-6">{product.name}</h1>
        <span className="font-light text-2xl">{product.price} PLN</span>
        <p className="mt-6 md:mt-10 text-gray-700">{product.description}</p>

        <form onSubmit={handleAddToCart} className="mt-6">
          {/* ... (reszta formularza - bez zmian) ... */}
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
