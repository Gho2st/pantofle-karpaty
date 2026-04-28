"use client";
import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// ====================== PRZYKŁADOWE DANE ======================
// Podmień na własne dane — każdy wariant to osobny produkt w bazie
// images: [bok, profil, góra] — ścieżki do zdjęć

const DEFAULT_VARIANTS = [
  {
    label: "Ciemny brąz",
    color: "#3b2314",
    href: "/produkty/klapki-mule-ciemny-braz-damskie",
    images: [
      "https://pantofle-karpaty.s3.eu-central-1.amazonaws.com/products/dc1eb092-1bb9-4e4a-88b7-0ae720ec19f1-IMG_4913.PNG",
      "https://pantofle-karpaty.s3.eu-central-1.amazonaws.com/products/804dd41f-a152-47bb-a935-b9df1a2735ba-Photoroom_20260420_230419.JPG",
      "https://pantofle-karpaty.s3.eu-central-1.amazonaws.com/products/fd539bc8-d352-4828-90a0-301438e27868-Photoroom_20260420_230638.JPG",
    ],
  },

  {
    label: "Szare",
    color: "#c8a97a",
    href: "/produkty/szare-klapki-mule-damskie",
    images: [
      "https://pantofle-karpaty.s3.eu-central-1.amazonaws.com/products/715085b9-f32e-4d68-8006-9b3d59df191a-Photoroom_20260421_103332.JPG",
      "https://pantofle-karpaty.s3.eu-central-1.amazonaws.com/products/22f96d91-8262-46ff-98e2-3a2129a4411a-Photoroom_20260421_103449.JPG",
      "https://pantofle-karpaty.s3.eu-central-1.amazonaws.com/products/85cfc526-3158-44fa-82fa-f5bbef989add-Photoroom_20260421_103655.jpg",
    ],
  },
];

const VIEW_LABELS = ["Bok", "Profil", "Góra"];

export default function ShoeViewer({ variants = DEFAULT_VARIANTS }) {
  const [activeVariant, setActiveVariant] = useState(0);
  const [activeView, setActiveView] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef(null);

  const variant = variants[activeVariant];

  const handleMouseMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 12, y: -y * 12 });
  }, []);

  const handleVariantChange = (i) => {
    setActiveVariant(i);
    setActiveView(0);
  };

  return (
    <section className="w-full bg-[#f7f5f2] py-16 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Lewa — tekst */}
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
              Nowość
            </span>
            <h2 className="text-4xl md:text-5xl xl:text-6xl font-serif font-medium leading-[1.05] text-gray-900 mb-5">
              Klapki z naturalnego
              <br />
              <span className="text-red-700">zamszu.</span>
            </h2>
            <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-sm">
              Ręcznie szyte w Męcinie. Podeszwa korkowa, wkładka ze skóry
              naturalnej, klamra ze stali nierdzewnej.
            </p>

            {/* Właściwości */}
            <div className="flex flex-wrap gap-6 mb-8 text-sm">
              {[
                { label: "Materiał", value: "Welur bydlęcy" },
                { label: "Podeszwa", value: "Korek + guma" },
                { label: "Wkładka", value: "Skóra naturalna" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">
                    {item.label}
                  </p>
                  <p className="font-medium text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Wybór koloru */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                Kolor —{" "}
                <span className="text-gray-700 normal-case font-medium">
                  {variant.label}
                </span>
              </p>
              <div className="flex items-center gap-3">
                {variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => handleVariantChange(i)}
                    title={v.label}
                    className={`w-8 h-8 rounded-full transition-all duration-200 ${
                      activeVariant === i
                        ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                        : "ring-1 ring-gray-200 hover:scale-105"
                    }`}
                    style={{ background: v.color }}
                    aria-label={v.label}
                  />
                ))}
              </div>
            </div>

            <Link
              href={variant.href}
              className="group inline-flex items-center gap-3 bg-gray-900 hover:bg-red-700 transition-all duration-300 text-white font-medium px-8 py-4 rounded-xl"
            >
              Zobacz produkt
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>

          {/* Prawa — viewer */}
          <div className="order-1 lg:order-2 flex flex-col items-center gap-6">
            {/* Karta 3D */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => {
                setIsHovering(false);
                setTilt({ x: 0, y: 0 });
              }}
              className="relative w-full max-w-md cursor-grab active:cursor-grabbing select-none"
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative w-full aspect-square bg-white rounded-3xl overflow-hidden shadow-xl"
                style={{
                  transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                  transition: isHovering
                    ? "transform 0.05s linear"
                    : "transform 0.6s cubic-bezier(0.23,1,0.32,1)",
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                {/* Zdjęcia aktywnego wariantu */}
                {variant.images.map((src, i) => (
                  <div
                    key={`${activeVariant}-${i}`}
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{ opacity: activeView === i ? 1 : 0 }}
                  >
                    <Image
                      src={src}
                      alt={`${variant.label} — ${VIEW_LABELS[i]}`}
                      fill
                      sizes="(max-width: 768px) 90vw, 480px"
                      className="object-contain p-8"
                      priority={i === 0 && activeVariant === 0}
                    />
                  </div>
                ))}

                {/* Hint */}
                <div className="absolute bottom-4 right-4 text-xs text-gray-300 font-mono">
                  ⟲ przesuń
                </div>

                {/* Shine */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: isHovering ? 0.06 : 0,
                    background: `radial-gradient(circle at ${50 + tilt.x * 3}% ${50 - tilt.y * 3}%, white, transparent 70%)`,
                  }}
                />
              </div>
            </div>

            {/* Przełącznik widoków */}
            <div className="flex items-center gap-3">
              {VIEW_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setActiveView(i)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeView === i
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
