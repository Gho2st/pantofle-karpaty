"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCart } from "@/app/context/cartContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductDetails({ product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showCartLink, setShowCartLink] = useState(false);

  const images = product.images || [];
  const category = product.category;

  // --- BREADCRUMB ---
  const breadcrumb = [
    { name: "Strona główna", href: "/" },
    category?.parent && {
      name: category.parent.name,
      href: `/kategoria/${category.parent.slug}`,
    },
    category && {
      name: category.name,
      href: `/kategoria/${category.slug}`,
    },
    { name: product.name, href: null },
  ].filter(Boolean);

  // --- NAJNIŻSZA CENA Z 30 DNI ---
  const lowestPrice30Days = product.lowestPrice;
  const currentPrice = product.price;

  // --- DODAJ DO KOSZYKA ---
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
    product.sizes?.find((s) => s.size === selectedSize)?.stock || 0;

  return (
    <div className="max-w-7xl mx-auto my-12 md:my-24 px-4">
      {/* === BREADCRUMB === */}
      <nav className="text-sm text-gray-600 mb-8">
        {breadcrumb.map((item, i) => (
          <span key={i}>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-red-600 hover:underline transition"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.name}</span>
            )}
            {i < breadcrumb.length - 1 && (
              <span className="mx-2 text-gray-400">›</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        {/* === GALERIA === */}
        <div className="w-full md:w-1/3">
          <Swiper
            modules={[Zoom, Navigation, Pagination]}
            spaceBetween={10}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            zoom={true}
            className="w-full product-gallery-swiper"
          >
            {images.length > 0 ? (
              images.map((image, index) => (
                <SwiperSlide
                  key={`main-${index}`}
                  className="relative aspect-[4/5] bg-gray-100 rounded-md overflow-hidden"
                >
                  <div className="swiper-zoom-container">
                    <Image
                      src={image}
                      fill
                      sizes="(max-width: 768px) 90vw, 33vw"
                      style={{ objectFit: "cover" }}
                      alt={`${product.name} - zdjęcie ${index + 1}`}
                      priority={index === 0}
                    />
                  </div>
                </SwiperSlide>
              ))
            ) : (
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

        {/* === SZCZEGÓŁY === */}
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl md:text-4xl uppercase mb-6">
            {product.name}
          </h1>

          {/* === CENA + NAJNIŻSZA Z 30 DNI === */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-red-600">
              {currentPrice.toFixed(2)} PLN
            </span>

            {lowestPrice30Days && lowestPrice30Days < currentPrice && (
              <div className="text-sm text-gray-500 mt-1">
                Najniższa cena z 30 dni:{" "}
                <span className="font-bold text-green-600">
                  {lowestPrice30Days.toFixed(2)} PLN
                </span>
              </div>
            )}
          </div>

          <p className="mt-6 text-gray-700">{product.description}</p>

          <form onSubmit={handleAddToCart} className="mt-6">
            {/* ROZMIAR */}
            <div className="mb-4">
              <label htmlFor="size" className="block text-lg font-medium mb-2">
                Wybierz rozmiar:
              </label>
              <select
                id="size"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
                required
              >
                <option value="" disabled>
                  Wybierz rozmiar
                </option>
                {product.sizes?.map((sizeOption) => (
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

            {/* ILOŚĆ */}
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
                min="1"
                max={stockForSelectedSize > 0 ? stockForSelectedSize : 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
                disabled={!selectedSize || stockForSelectedSize === 0}
                required
              />
            </div>

            {/* PRZYCISKI */}
            <div className="flex flex-wrap gap-4 items-center">
              <button
                type="submit"
                className={`px-6 py-3 rounded-md text-white transition duration-300 ${
                  isAdded
                    ? "bg-green-600"
                    : "bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                }`}
                disabled={
                  isAdded || !selectedSize || stockForSelectedSize === 0
                }
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

          {/* DODATKOWE INFO */}
          {product.description2 && (
            <p className="mt-10 text-gray-700">{product.description2}</p>
          )}
          {product.additionalInfo && (
            <p className="mt-10 text-gray-700">{product.additionalInfo}</p>
          )}
        </div>
      </div>
    </div>
  );
}
