"use client";
import { useEffect, useState } from "react";

export default function Modal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Modal pokazuje się tylko do końca dnia 31 maja 2026
    const now = new Date();
    const endDate = new Date("2026-05-31T00:00:00");

    if (now < endDate) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="restaurant-modal-title"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors text-2xl leading-none"
          aria-label="Zamknij"
        >
          ×
        </button>

        <div className="text-center">
          <div className="text-5xl mb-4">!</div>
          <h2
            id="restaurant-modal-title"
            className="text-2xl font-semibold text-gray-900 mb-3"
          >
            Informacja
          </h2>
          <p className="text-gray-600 mb-2 leading-relaxed">
            Prace techniczne. Obsługa zamowień chwilowo utrudniona.
          </p>

          <button
            onClick={handleClose}
            className="w-full cursor-pointer bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Rozumiem
          </button>
        </div>
      </div>
    </div>
  );
}
