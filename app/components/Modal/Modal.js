"use client";
import { useState, useEffect } from "react";

export default function Modal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem("promoModalShown");
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        sessionStorage.setItem("promoModalShown", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeModal = () => setIsModalOpen(false);

  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {isModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={handleOutsideClick}
        >
          <div className="relative bg-[#fdfaf5] border-t-4 border-[#8b5a2b] rounded-lg shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100 ring-1 ring-black/5">
            <button
              onClick={closeModal}
              className="absolute cursor-pointer top-2 right-3 text-[#5d4037] hover:text-[#8b5a2b] text-3xl font-light transition-colors duration-200"
              aria-label="Zamknij"
            >
              &times;
            </button>

            <div className="text-center">
              <div className="mb-4 flex justify-center text-[#8b5a2b]">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M12 3L2 12h3v8h14v-8h3L12 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-serif font-bold text-[#5d4037] mb-4 uppercase tracking-wider">
                Ważna informacja
              </h2>

              <div className="h-px bg-[#e0d7c7] w-1/2 mx-auto mb-6"></div>

              <p className="text-[#4a3728] mb-6 leading-relaxed font-medium">
                W dniach 23-26 lutego trwa przerwa w wysyłkach. Wszystkie
                zamówienia złożone w tym czasie zostaną wysłane po 26 lutego.
                Dziękujemy za wyrozumiałość!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
