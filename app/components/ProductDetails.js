"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useCart } from "@/app/context/cartContext";
import SizeChart from "@/app/components/Sizes";

// Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductDetails({ product }) {
  const { addToCart, getCurrentPrice } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showCartLink, setShowCartLink] = useState(false);
  const [mainImage, setMainImage] = useState("/placeholder.png");
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHoverZoom, setIsHoverZoom] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const images = product.images || [];
  const category = product.category;

  const currentPrice = product ? getCurrentPrice(product) : null;
  const isPromoActive = product ? currentPrice < product.price : false;

  // Ustaw pierwsze zdjęcie
  useEffect(() => {
    if (images.length > 0) {
      setMainImage(images[0]);
    }
  }, [images]);

  // Reset myszki
  useEffect(() => {
    if (!isHoverZoom) {
      setMousePos({ x: 50, y: 50 });
    }
  }, [isHoverZoom]);

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

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!selectedSize) return toast.error("Wybierz rozmiar");

    try {
      await addToCart(product.id, selectedSize, quantity);
      setIsAdded(true);
      setShowCartLink(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch {
      toast.error("Błąd dodawania");
    }
  };

  const selectedSizeStock =
    product.sizes?.find((s) => s.size === selectedSize)?.stock || 0;
  const isSizeAvailable = selectedSizeStock > 0;

  return (
    <>
      <div className="max-w-7xl mx-auto my-12 md:my-24 px-4">
        {/* Breadcrumb */}
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
          {/* --- GALERIA ZDJĘĆ --- */}
          <div className="w-full md:w-1/3">
            {/* MOBILE: Swiper (przesuwanie lewo/prawo) */}
            <div className="md:hidden">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                pagination={{ clickable: true }}
                navigation
                loop={images.length > 1}
                className="rounded-md overflow-hidden"
              >
                {images.length > 0 ? (
                  images.map((image, i) => (
                    <SwiperSlide key={i}>
                      <div
                        className="relative aspect-4/5 bg-gray-100 cursor-zoom-in"
                        onClick={() => {
                          setMainImage(image);
                          setIsZoomed(true);
                        }}
                      >
                        <Image
                          src={image}
                          fill
                          sizes="90vw"
                          style={{ objectFit: "cover" }}
                          alt={`${product.name} - zdjęcie ${i + 1}`}
                          priority={i === 0}
                        />
                      </div>
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide>
                    <div className="relative aspect-4/5 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">Brak zdjęć</span>
                    </div>
                  </SwiperSlide>
                )}
              </Swiper>
            </div>

            {/* DESKTOP: Miniaturki + główne zdjęcie z hover zoom */}
            <div className="hidden md:grid md:grid-cols-12 gap-4">
              {/* Miniaturki po lewej */}
              <div className="flex flex-col gap-2 col-span-2">
                {images.length > 0 ? (
                  images.map((image, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(image)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        mainImage === image
                          ? "border-red-600 shadow-md"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={image}
                        fill
                        sizes="80px"
                        style={{ objectFit: "cover" }}
                        alt={`Miniaturka ${i + 1}`}
                        className="hover:scale-105 transition-transform"
                      />
                    </button>
                  ))
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-md border-2 border-gray-300" />
                )}
              </div>

              {/* Główne zdjęcie z hover zoom */}
              <div className="relative aspect-4/5 bg-gray-100 rounded-md overflow-hidden col-span-10">
                <div
                  className="group relative w-full h-full cursor-zoom-in"
                  onMouseEnter={() => setIsHoverZoom(true)}
                  onMouseLeave={() => {
                    setIsHoverZoom(false);
                    setMousePos({ x: 50, y: 50 });
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setMousePos({ x, y });
                  }}
                  onClick={() => setIsZoomed(true)}
                >
                  <Image
                    src={mainImage || "/placeholder.png"}
                    fill
                    sizes="50vw"
                    style={{ objectFit: "cover" }}
                    alt={product.name}
                    priority
                  />

                  {/* Hover zoom lupa */}
                  {isHoverZoom && (
                    <div
                      className="absolute inset-0 pointer-events-none overflow-hidden rounded-md"
                      style={{
                        backgroundImage: `url(${mainImage})`,
                        backgroundSize: "200%",
                        backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <div
                        className="absolute w-40 h-40 border-4 border-white rounded-full pointer-events-none shadow-2xl"
                        style={{
                          top: `${mousePos.y}%`,
                          left: `${mousePos.x}%`,
                          transform: "translate(-50%, -50%)",
                          clipPath: "circle(50%)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* --- KONIEC GALERII --- */}

          {/* Informacje o produkcie */}
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl md:text-4xl uppercase mb-6">
              {product.name}
            </h1>

            <div className="mb-6">
              {isPromoActive ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-red-600">
                    {currentPrice?.toFixed(2)} PLN
                  </span>
                  <span className="text-xl line-through text-gray-500">
                    {product.price.toFixed(2)} PLN
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {currentPrice?.toFixed(2)} PLN
                </span>
              )}

              {product.lowestPrice && (
                <div className="text-sm text-gray-500 mt-1">
                  Najniższa cena z 30 dni:{" "}
                  <span
                    className={`font-bold ${
                      product.lowestPrice < currentPrice
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
                  {product.sizes
                    ?.slice() // tworzymy kopię, żeby nie mutować oryginalnej tablicy
                    .sort((a, b) => a.size - b.size) // sortujemy numerycznie rosnąco
                    .map((s) => (
                      <option
                        key={s.size}
                        value={s.size}
                        disabled={s.stock === 0}
                      >
                        Rozmiar {s.size}
                        {s.stock === 0 && " (niedostępny)"}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-lg font-medium mb-2">Ilość:</label>
                <input
                  type="number"
                  min="1"
                  max={isSizeAvailable ? selectedSizeStock : 1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
                  disabled={!selectedSize || !isSizeAvailable}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-md text-white transition-all duration-200 ${
                    isAdded
                      ? "bg-green-600"
                      : "bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
                  }`}
                  disabled={isAdded || !selectedSize || !isSizeAvailable}
                >
                  {isAdded ? "Dodano!" : "Dodaj do koszyka"}
                </button>
                {showCartLink && (
                  <Link
                    href="/koszyk"
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
            <SizeChart />
          </div>
        </div>
      </div>
      {/* MODAL ZOOM */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-5xl max-h-full">
            <Image
              src={mainImage || "/placeholder.png"}
              width={1200}
              height={1500}
              style={{ objectFit: "contain" }}
              alt="Powiększone zdjęcie"
              className="max-w-full max-h-full"
            />
            <button
              className="absolute top-4 right-4 text-white text-3xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 transition"
              onClick={() => setIsZoomed(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      {product.showPartnerTile && (
        <div className="max-w-7xl mx-auto my-16 px-4">
          <div className="border-t-2 border-gray-200 pt-12">
            <h2 className="text-2xl md:text-3xl uppercase text-center mb-10 text-gray-900">
              {product.partnerTitle}
            </h2>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Zdjęcie drugiego produktu */}
              <div className="flex justify-center">
                <div className="relative aspect-4/5 w-full max-w-md bg-gray-100 rounded-md overflow-hidden border-2 border-gray-300">
                  <Image
                    src={product.partnerImage || "/placeholder.png"}
                    fill
                    sizes="(max-width: 768px) 90vw, 500px"
                    style={{ objectFit: "cover" }}
                    alt={product.partnerName}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>

              {/* Tekst + przycisk */}
              <div className="text-center md:text-left space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl uppercase mb-4">
                    {product.partnerName}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Idealny komplet dla pary – te same ciepłe, wełniane kapcie
                    <br />w wersji{" "}
                    {product.partnerTitle === "Kup też dla Niego"
                      ? "męskiej"
                      : "damskiej"}
                  </p>
                </div>

                <a
                  href={product.partnerUrl}
                  className="inline-block px-8 py-4 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition uppercase tracking-wider"
                >
                  Pokaż drugą parę →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
