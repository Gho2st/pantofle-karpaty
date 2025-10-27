// app/components/AnimatedLock.js
"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";

export default function AnimatedLock() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    // Używamy onMouseEnter i onMouseLeave do śledzenia najechania myszką
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // `relative` jest kluczowe dla pozycjonowania ikon jedna na drugiej
      className="relative flex justify-center items-center bg-blue-600/10 text-blue-600 p-3 rounded-full cursor-pointer transition-all duration-300"
      // Możemy też dodać subtelny efekt "powiększenia" na hover dla całego tła
      style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
    >
      {/* Ikona kłódki (domyślna) */}
      <Lock
        className={`w-8 h-8 transition-all duration-300 ease-in-out ${
          isHovered ? "opacity-0 scale-90" : "opacity-100 scale-100"
        }`}
      />

      {/* Ikona otwartej kłódki (pojawia się na hover) */}
      <Unlock
        className={`w-8 h-8 absolute transition-all duration-300 ease-in-out ${
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      />
    </div>
  );
}
