"use client";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const [showArrow, setShowArrow] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Warunek 1: Czy jesteśmy na samym dole strony (margin błędu 10px)
      const isAtBottom = currentScrollY + windowHeight >= documentHeight - 10;

      // Warunek 2: Czy przewijamy w górę (i jesteśmy poniżej 50px od góry)
      const isScrollingUp = currentScrollY < lastScrollY && currentScrollY > 50;

      // Pokazuj strzałkę, gdy przewijamy w górę LUB jesteśmy na dole strony
      if (isScrollingUp || isAtBottom) {
        setShowArrow(true);
      } else {
        setShowArrow(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    // Czyszczenie listenera przy odmontowaniu komponentu
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <footer className="bg-red-800 text-white relative">
      {/* Dynamiczna strzałka "Wróć na górę" */}
      <button
        onClick={scrollToTop}
        className={`
          fixed bottom-1/4 right-0 transform -translate-y-1/2 z-50 
          p-3 rounded-l-lg bg-gray-600 shadow-xl 
          hover:bg-gray-500 transition duration-300
          ${
            showArrow ? "translate-x-0" : "translate-x-full pointer-events-none"
          } 
        `}
        aria-label="Wróć na górę strony"
      >
        <ArrowUp className="w-6 h-6 text-white" />
      </button>

      {/* Kontent stopki */}
      <div className="flex justify-between items-center px-6 lg:px-20 py-5">
        {/* Lewa strona: Linki */}
        <ul className="uppercase flex gap-6 md:gap-10 text-xs md:text-sm">
          <li>
            <a href="/regulamin" className="hover:text-primary transition">
              Regulamin
            </a>
          </li>
          <li>
            <a
              href="/polityka-zwrotow"
              className="hover:text-primary transition"
            >
              Polityka zwrotów
            </a>
          </li>
          <li>
            <a href="/rodo" className="hover:text-primary transition">
              RODO
            </a>
          </li>
          <li>
            <a href="/konto" className="hover:text-primary transition">
              Moje konto
            </a>
          </li>
          <li>
            <a href="/kontakt" className="hover:text-primary transition">
              Kontakt
            </a>
          </li>
        </ul>

        {/* Prawa strona: Info o prawach autorskich */}
        <p className="text-xs opacity-70 hidden sm:block">
          &copy; {new Date().getFullYear()} Karpaty. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
}
