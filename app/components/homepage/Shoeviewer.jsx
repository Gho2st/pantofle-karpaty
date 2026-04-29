"use client";
import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const VIEW_LABELS = ["Bok", "Profil", "Góra"];

export default function ShoeViewer({ variants }) {
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

  if (!variants.length) return null;

  return (
    <section className="w-full bg-[#f7f5f2] py-10 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-20 items-center">
          {/* === PRAWA — viewer (na mobile PIERWSZA) === */}
          <div className="order-1 lg:order-2 flex flex-col items-center gap-4">
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
                className="relative w-full aspect-square bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl"
                style={{
                  transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                  transition: isHovering
                    ? "transform 0.05s linear"
                    : "transform 0.6s cubic-bezier(0.23,1,0.32,1)",
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
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
                      className="object-contain p-6 sm:p-8"
                      priority={i === 0 && activeVariant === 0}
                    />
                  </div>
                ))}

                <div className="absolute bottom-3 right-3 text-xs text-gray-300 font-mono">
                  ⟲ przesuń
                </div>

                <div
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: isHovering ? 0.06 : 0,
                    background: `radial-gradient(circle at ${50 + tilt.x * 3}% ${50 - tilt.y * 3}%, white, transparent 70%)`,
                  }}
                />
              </div>
            </div>

            {/* Wiersz: kolor + widok — razem pod zdjęciem na mobile */}
            <div className="flex items-center justify-between w-full max-w-md px-1">
              {/* Wybór koloru */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  {variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => handleVariantChange(i)}
                      title={v.label}
                      className={`w-5 h-5 rounded-full transition-all duration-200 ${
                        activeVariant === i
                          ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                          : "ring-1 ring-gray-200 hover:scale-105"
                      }`}
                      style={{ background: v.color }}
                      aria-label={v.label}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium mt-4 text-gray-700">
                  {variant.label}
                </span>
              </div>

              {/* Przełącznik widoków */}
              <div className="flex items-center gap-2">
                {VIEW_LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveView(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
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

          {/* === LEWA — tekst (na mobile DRUGA) === */}
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-4 sm:mb-6">
              Nowość
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-serif font-medium leading-[1.05] text-gray-900 mb-4 sm:mb-5">
              Klapki z naturalnego
              <br />
              <span className="text-red-700">zamszu.</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 sm:mb-8 max-w-sm">
              Ręcznie szyte w Męcinie. Podeszwa korkowa, wkładka ze skóry
              naturalnej, klamra ze stali nierdzewnej.
            </p>

            {/* Właściwości */}
            <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-6 mb-6 sm:mb-8 text-sm">
              {[
                { label: "Materiał", value: "Welur bydlęcy" },
                { label: "Podeszwa", value: "Korek + guma" },
                { label: "Wkładka", value: "Skóra naturalna" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white sm:bg-transparent rounded-xl sm:rounded-none p-3 sm:p-0"
                >
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">
                    {item.label}
                  </p>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={variant.href}
              className="group inline-flex items-center gap-3 bg-gray-900 hover:bg-red-700 transition-all duration-300 text-white font-medium px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl w-full sm:w-auto justify-center sm:justify-start"
            >
              Zobacz produkt
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
