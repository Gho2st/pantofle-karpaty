"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useCart } from "@/app/context/cartContext";
import SizeChart from "@/app/components/Sizes";
import {
  X,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ====================== BEZPIECZNY KOMPONENT IMAGE ======================
function SafeImage({ src, alt, ...props }) {
  const finalSrc =
    src && typeof src === "string" && src.trim() !== ""
      ? src
      : "/placeholder.png";
  return <Image src={finalSrc} alt={alt || "Zdjęcie produktu"} {...props} />;
}

// ====================== MOBILNY SLIDER ======================
function MobileSlider({ images, productName, onImageClick }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 8) isDragging.current = true;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (isDragging.current && Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  if (!images.length) {
    return (
      <div className="relative aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-400 text-sm">Brak zdjęć</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden select-none">
      {/* Zdjęcia */}
      {images.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: current === i ? 1 : 0,
            pointerEvents: current === i ? "auto" : "none",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={() => !isDragging.current && onImageClick(src)}
        >
          <SafeImage
            src={src}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            alt={`${productName} - zdjęcie ${i + 1}`}
            priority={i === 0}
            className="cursor-zoom-in"
          />
        </div>
      ))}

      {/* Strzałki — tylko gdy >1 zdjęcie */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-800 shadow-sm hover:bg-white transition-colors"
            aria-label="Poprzednie zdjęcie"
          >
            <ChevronLeft size={18} strokeWidth={1.8} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-800 shadow-sm hover:bg-white transition-colors"
            aria-label="Następne zdjęcie"
          >
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>

          {/* Licznik */}
          <div className="absolute bottom-3 right-3 z-10 text-xs font-medium text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full tabular-nums">
            {current + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}

// ====================== GŁÓWNY KOMPONENT ======================
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
  const [descExpanded, setDescExpanded] = useState(false);

  const images = product.images || [];
  const category = product.category;

  const currentPrice = product ? getCurrentPrice(product) : null;
  const isPromoActive = product ? currentPrice < product.price : false;

  useEffect(() => {
    if (images.length > 0 && images[0]) {
      setMainImage(images[0]);
    } else {
      setMainImage("/placeholder.png");
    }
  }, [images]);

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
      toast.error("Błąd dodawania do koszyka");
    }
  };

  const selectedSizeObj = product.sizes?.find(
    (s) => s.size.toString() === selectedSize,
  );
  const selectedSizeStock = selectedSizeObj?.stock || 0;
  const isSizeAvailable = selectedSizeStock > 0;

  const handleQuantityChange = (delta) => {
    setQuantity((q) =>
      Math.max(1, Math.min(selectedSizeStock || 1, q + delta)),
    );
  };

  const discount = isPromoActive
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : null;

  return (
    <>
      <div className="max-w-7xl mx-auto my-12 md:my-24 px-4">
        {/* Breadcrumb */}
        <nav className="text-xs text-center md:text-left text-gray-400 mb-8 xl:mb-12 tracking-wide uppercase">
          {breadcrumb.map((item, i) => (
            <span key={i}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-red-600 transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-gray-700">{item.name}</span>
              )}
              {i < breadcrumb.length - 1 && (
                <span className="mx-2 text-gray-300">›</span>
              )}
            </span>
          ))}
        </nav>

        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          {/* ====================== GALERIA ZDJĘĆ ====================== */}
          <div className="w-full md:w-1/2">
            {/* MOBILE: własny slider */}
            <div className="md:hidden">
              <MobileSlider
                images={images}
                productName={product.name}
                onImageClick={(src) => {
                  setMainImage(src);
                  setIsZoomed(true);
                }}
              />
            </div>

            {/* DESKTOP: Miniaturki + główne zdjęcie */}
            <div className="hidden md:grid md:grid-cols-12 gap-4">
              <div className="flex flex-col gap-2 col-span-2">
                {images.length > 0 ? (
                  images.map((image, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(image)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                        mainImage === image
                          ? "border-red-600 shadow-md"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <SafeImage
                        src={image}
                        fill
                        sizes="80px"
                        style={{ objectFit: "cover" }}
                        alt={`Miniaturka ${product.name} ${i + 1}`}
                        className="hover:scale-105 transition-transform"
                      />
                    </button>
                  ))
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-md border-2 border-gray-200" />
                )}
              </div>

              <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden col-span-10">
                <div
                  className="group relative w-full h-full cursor-zoom-in"
                  onMouseEnter={() => setIsHoverZoom(true)}
                  onMouseLeave={() => {
                    setIsHoverZoom(false);
                    setMousePos({ x: 50, y: 50 });
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePos({
                      x: ((e.clientX - rect.left) / rect.width) * 100,
                      y: ((e.clientY - rect.top) / rect.height) * 100,
                    });
                  }}
                  onClick={() => setIsZoomed(true)}
                >
                  <SafeImage
                    src={mainImage}
                    fill
                    sizes="50vw"
                    style={{ objectFit: "cover" }}
                    alt={product.name}
                    priority
                  />

                  {isHoverZoom &&
                    mainImage &&
                    mainImage !== "/placeholder.png" && (
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

          {/* ====================== INFORMACJE O PRODUKCIE ====================== */}
          <div className="w-full md:w-1/2 flex flex-col gap-0">
            {/* Nazwa + kategoria */}
            <div className="mb-5">
              {category && (
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                  {category.name}
                </p>
              )}
              <h1 className="text-3xl md:text-4xl uppercase font-medium leading-tight text-gray-900">
                {product.name}
              </h1>
            </div>

            {/* Cena */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              {isPromoActive ? (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-red-600">
                    {currentPrice?.toFixed(2)} PLN
                  </span>
                  <span className="text-xl line-through text-gray-400">
                    {product.price.toFixed(2)} PLN
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide bg-red-100 text-red-700 px-2 py-1 rounded">
                    −{discount}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {currentPrice?.toFixed(2)} PLN
                </span>
              )}

              {product.lowestPrice && (
                <p className="text-xs text-gray-400 mt-2">
                  Najniższa cena z 30 dni:{" "}
                  <span
                    className={`font-semibold ${
                      product.lowestPrice < currentPrice
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {product.lowestPrice.toFixed(2)} PLN
                  </span>
                </p>
              )}
            </div>

            {/* Warianty kolorystyczne */}
            {product.colorVariants?.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                  Kolor —{" "}
                  <span className="text-gray-700 normal-case font-medium">
                    {product.name}
                  </span>
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div
                    className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-gray-900 scale-110 cursor-default"
                    style={{ background: product.colorHex || "#e5e7eb" }}
                    title={product.name}
                  />
                  {product.colorVariants.map((v) => (
                    <Link
                      key={v.id}
                      href={`/produkty/${v.slug}`}
                      title={v.name}
                      className="w-8 h-8 rounded-full ring-1 ring-gray-200 hover:scale-110 hover:ring-gray-400 transition-all duration-200"
                      style={{ background: v.colorHex || "#e5e7eb" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Opis krótki */}
            {product.description && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Formularz */}
            <form onSubmit={handleAddToCart} className="flex flex-col gap-6">
              {/* Rozmiar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Rozmiar
                  </label>
                  {selectedSize && (
                    <span className="text-xs text-gray-400">
                      {isSizeAvailable
                        ? `${selectedSizeStock} szt. dostępnych`
                        : "Niedostępny"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes
                    ?.slice()
                    .sort((a, b) => a.size - b.size)
                    .map((s) => {
                      const isSelected = selectedSize === s.size.toString();
                      const isOut = s.stock === 0;
                      return (
                        <button
                          key={s.size}
                          type="button"
                          onClick={() =>
                            !isOut && setSelectedSize(s.size.toString())
                          }
                          className={`w-12 h-12 rounded-md text-sm font-medium transition-all duration-150 ${
                            isSelected
                              ? "border-2 border-red-600 bg-red-50 text-red-700"
                              : isOut
                                ? "border border-gray-200 text-gray-300 line-through cursor-not-allowed"
                                : "border border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {s.size}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Ilość */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                  Ilość
                </label>
                <div className="flex items-center border border-gray-300 rounded-md w-fit overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 text-lg font-light disabled:opacity-30 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-gray-900 border-x border-gray-300 leading-[40px] select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={!isSizeAvailable || quantity >= selectedSizeStock}
                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-600 text-lg font-light disabled:opacity-30 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3 items-center flex-wrap">
                <button
                  type="submit"
                  disabled={isAdded || !selectedSize || !isSizeAvailable}
                  className={`flex-1 min-w-[180px] py-4 px-6 rounded-md text-sm font-semibold uppercase tracking-wider text-white transition-all duration-200 ${
                    isAdded
                      ? "bg-green-600"
                      : "bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  }`}
                >
                  {isAdded ? "✓ Dodano do koszyka" : "Dodaj do koszyka"}
                </button>

                {showCartLink && (
                  <Link
                    href="/koszyk"
                    className="py-4 px-6 rounded-md text-sm font-semibold uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                  >
                    Przejdź do koszyka →
                  </Link>
                )}
              </div>

              {/* Dostawa */}
              <div className="grid grid-cols-1 gap-2 pt-2">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <Truck size={14} className="text-gray-400 shrink-0" />
                  Darmowa dostawa od 200 PLN
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <RotateCcw size={14} className="text-gray-400 shrink-0" />
                  Zwrot w ciągu 30 dni
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <ShieldCheck size={14} className="text-gray-400 shrink-0" />
                  Bezpieczna płatność
                </div>
              </div>
            </form>

            {/* Szczegóły — rozwijane */}
            {(product.description2 || product.additionalInfo) && (
              <div className="mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="flex items-center justify-between w-full py-4 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <span className="uppercase tracking-widest text-xs font-semibold text-gray-500">
                    Szczegóły produktu
                  </span>
                  {descExpanded ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>

                {descExpanded && (
                  <div className="pb-4 flex flex-col gap-3 text-sm text-gray-600 leading-relaxed">
                    {product.description2 && <p>{product.description2}</p>}
                    {product.additionalInfo && <p>{product.additionalInfo}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Tabela rozmiarów */}
            <div className="mt-2">
              <SizeChart />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ZOOM */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
            onClick={() => setIsZoomed(false)}
          >
            <X size={28} />
          </button>
          <div
            className="relative max-w-5xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <SafeImage
              src={mainImage}
              width={1200}
              height={1500}
              style={{ objectFit: "contain" }}
              alt="Powiększone zdjęcie"
              className="max-w-full max-h-[90vh]"
            />
          </div>
        </div>
      )}

      {/* PARTNER TILE */}
      {product.showPartnerTile && (
        <div className="max-w-7xl mx-auto my-16 px-4">
          <div className="border-t-2 border-gray-100 pt-12">
            <h2 className="text-2xl md:text-3xl uppercase text-center mb-10 text-gray-900 font-medium">
              {product.partnerTitle}
            </h2>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center">
                <div className="relative aspect-square w-full max-w-md bg-gray-100 rounded-md overflow-hidden">
                  <SafeImage
                    src={product.partnerImage}
                    fill
                    sizes="(max-width: 768px) 90vw, 500px"
                    style={{ objectFit: "cover" }}
                    alt={product.partnerName}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>

              <div className="text-center md:text-left space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl uppercase mb-4 font-medium">
                    {product.partnerName}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Idealny komplet dla pary – te same ciepłe, wełniane kapcie
                    <br />w wersji{" "}
                    {product.partnerTitle === "Kup też dla Niego"
                      ? "męskiej"
                      : "damskiej"}
                  </p>
                </div>
                <Link
                  href={product.partnerUrl}
                  className="inline-block px-8 py-4 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition uppercase tracking-wider"
                >
                  Pokaż drugą parę →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
