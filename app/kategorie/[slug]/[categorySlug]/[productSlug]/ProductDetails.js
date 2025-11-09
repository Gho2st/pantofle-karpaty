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

  // === CENA PROMOCYJNA ===
  const isPromoActive =
    product.promoPrice !== null &&
    product.promoPrice < product.price &&
    (!product.promoEndDate || new Date(product.promoEndDate) > new Date());

  const displayPrice = isPromoActive ? product.promoPrice : product.price;
  const originalPrice = product.price;

  // === BREADCRUMB ===
  const buildCategoryPath = (cat) => {
    if (!cat) return [];
    const path = [];
    let current = cat;
    while (current) {
      const slugPath = current.parent
        ? `${current.parent.slug}/${current.slug}`
        : current.slug;
      path.unshift({ name: current.name, href: `/kategorie/${slugPath}` });
      current = current.parent;
    }
    return path;
  };

  const categoryPath = buildCategoryPath(category);
  const breadcrumb = [
    { name: "Strona główna", href: "/" },
    ...categoryPath,
    { name: product.name, href: null },
  ];

  // === DODAJ DO KOSZYKA Z CENĄ PROMOCYJNĄ ===
  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!selectedSize) return toast.error("Wybierz rozmiar");

    const priceToUse = isPromoActive ? product.promoPrice : product.price;

    try {
      await addToCart(product.id, selectedSize, quantity, {
        ...product,
        price: priceToUse, // ← PRZEKAŻ CENĘ PROMOCYJNĄ!
      });
      setIsAdded(true);
      setShowCartLink(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch {
      toast.error("Błąd serwera");
    }
  };

  const stockForSelectedSize =
    product.sizes?.find((s) => s.size === selectedSize)?.stock || 0;

  return (
    <div className="max-w-7xl mx-auto my-12 md:my-24 px-4">
      {/* BREADCRUMB */}
      <nav className="text-sm text-center md:text-left text-gray-600 mb-8 xl:mb-12">
        {breadcrumb.map((item, i) => (
          <span key={i}>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-red-600 hover:underline"
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
        {/* GALERIA */}
        <div className="w-full md:w-1/3">
          <Swiper
            modules={[Zoom, Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            zoom
            className="product-gallery-swiper"
          >
            {images.length > 0 ? (
              images.map((image, i) => (
                <SwiperSlide
                  key={i}
                  className="aspect-4/5 bg-gray-100 rounded-md overflow-hidden"
                >
                  <div className="swiper-zoom-container">
                    <Image
                      src={image}
                      fill
                      sizes="(max-width: 768px) 90vw, 33vw"
                      style={{ objectFit: "cover" }}
                      alt={`${product.name} ${i + 1}`}
                      priority={i === 0}
                    />
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide className="aspect-4/5 bg-gray-100 rounded-md overflow-hidden">
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

        {/* SZCZEGÓŁY */}
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl md:text-4xl uppercase mb-6">
            {product.name}
          </h1>

          {/* CENA + PROMOCJA + NAJNIŻSZA CENA */}
          <div className="mb-6">
            {isPromoActive ? (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-red-600">
                  {displayPrice.toFixed(2)} PLN
                </span>
                <span className="text-xl line-through text-gray-500">
                  {originalPrice.toFixed(2)} PLN
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary">
                {displayPrice.toFixed(2)} PLN
              </span>
            )}

            {product.lowestPrice && (
              <div className="text-sm text-gray-500 mt-1">
                Najniższa cena z 30 dni:{" "}
                <span
                  className={`font-bold ${
                    product.lowestPrice < displayPrice
                      ? "text-red-600"
                      : "text-gray-700"
                  }`}
                >
                  {product.lowestPrice.toFixed(2)} PLN
                </span>
              </div>
            )}
          </div>

          <p className="mt-6 text-gray-700">{product.description}</p>

          <form onSubmit={handleAddToCart} className="mt-6">
            <div className="mb-4">
              <label className="block text-lg font-medium mb-2">
                Wybierz rozmiar:
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
                required
              >
                <option value="" disabled>
                  Wybierz rozmiar
                </option>
                {product.sizes?.map((s) => (
                  <option key={s.size} value={s.size} disabled={s.stock === 0}>
                    Rozmiar {s.size}{" "}
                    {s.stock === 0 ? "(Brak)" : `(dostępne: ${s.stock})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-lg font-medium mb-2">Ilość:</label>
              <input
                type="number"
                min="1"
                max={stockForSelectedSize > 0 ? stockForSelectedSize : 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
                disabled={!selectedSize || stockForSelectedSize === 0}
                required
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <button
                type="submit"
                className={`px-6 py-3 rounded-md text-white transition ${
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
    </div>
  );
}
