"use client";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/regulamin", label: "Regulamin" },
  { href: "/polityka-zwrotow", label: "Polityka zwrotów" },
  { href: "/polityka-prywatnosci", label: "Polityka Prywatności" },
  { href: "/profil", label: "Moje konto" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Footer() {
  const [showArrow, setShowArrow] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isAtBottom =
        currentScrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 10;
      const isScrollingUp = currentScrollY < lastScrollY && currentScrollY > 50;
      setShowArrow(isScrollingUp || isAtBottom);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <footer className="bg-red-800 text-white relative">
      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-1/4 right-0 z-50 p-3 rounded-l-xl bg-red-900 border border-red-700 border-r-0 shadow-lg hover:bg-white hover:border-white [hover:bg-red-700 hover:border-red-700>svg]:hover:text-red-800 transition-all duration-300 ${
          showArrow ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-label="Wróć na górę strony"
      >
        <ArrowUp className="w-5 h-5 text-white" />
      </button>

      {/* Górna sekcja */}
      <div className="border-b border-red-700 px-6 lg:px-20 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Logo / nazwa */}
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40 mb-1">
              Polski producent
            </p>
            <span className="text-xl font-medium text-white">
              Pantofle Karpaty
            </span>
          </div>

          {/* Linki */}
          <nav>
            <ul className="flex flex-wrap gap-x-8 gap-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Dolna sekcja */}
      <div className="px-6 lg:px-20 py-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30 tracking-wide">
            &copy; {new Date().getFullYear()} Karpaty. Wszelkie prawa
            zastrzeżone.
          </p>
          <p className="text-xs text-white/20">
            Pantofle Karpaty — Kapcie Skórzane i Wełniane | Producent
          </p>
        </div>
      </div>
    </footer>
  );
}
