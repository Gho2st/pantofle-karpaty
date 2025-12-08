"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState({
    analytics_storage: "denied", // Tylko GA4
  });

  // === Inicjalizacja po załadowaniu strony ===
  useEffect(() => {
    const stored = localStorage.getItem("cookie-consent");
    if (stored) {
      const parsed = JSON.parse(stored);
      setConsent(parsed);
      applyConsent(parsed);
    } else {
      setShowBanner(true);
    }
  }, []);

  // === Zastosuj zgodę (tylko GTM / GA4) ===
  const applyConsent = (consentState) => {
    if (typeof window === "undefined") return;

    if (consentState.analytics_storage === "granted") {
      loadGTM();
    } else {
      removeGTM();
    }
  };

  // === Wczytaj GTM (GA4) ===
  const loadGTM = () => {
    if (document.getElementById("gtm-script")) return;

    const script = document.createElement("script");
    script.id = "gtm-script";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=GTM-M7C454G3";
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });
  };

  // === Usuń GTM ===
  const removeGTM = () => {
    const script = document.getElementById("gtm-script");
    if (script) script.remove();
    if (window.dataLayer) window.dataLayer = [];
  };

  // === Zapisz zgodę ===
  const saveConsent = (newConsent) => {
    setConsent(newConsent);
    localStorage.setItem("cookie-consent", JSON.stringify(newConsent));
    applyConsent(newConsent);
    setShowBanner(false);
    setShowSettings(false);
  };

  // === Akceptuj wszystko ===
  const handleAcceptAll = () => {
    saveConsent({ analytics_storage: "granted" });
  };

  // === Odrzuć wszystko ===
  const handleRejectAll = () => {
    saveConsent({ analytics_storage: "denied" });
  };

  // === Przełącz zgodę ===
  const toggleConsent = () => {
    setConsent((prev) => ({
      analytics_storage:
        prev.analytics_storage === "granted" ? "denied" : "granted",
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-linear-to-t from-gray-900 to-gray-800 text-white p-4 md:p-6 shadow-2xl z-50 animate-fadeIn">
      <div className="max-w-5xl mx-auto">
        <div className="text-center ">
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            Ciasteczka w sklepie KARPATY
          </h2>
          <p className="text-xs md:text-sm text-gray-300 mb-3 leading-relaxed">
            Używamy <strong>Google Analytics 4</strong>, by lepiej rozumieć, jak
            korzystasz ze sklepu.
            <br className="hidden md:block" />
            To pomaga nam poprawiać działanie strony.
          </p>

          <Link
            href="/polityka-prywatnosci"
            className="text-blue-400 hover:text-blue-300 underline text-xs md:text-sm"
          >
            Polityka prywatności
          </Link>
        </div>

        {/* Ustawienia – tylko jedna opcja */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-sm md:text-base mb-3">
              Twoje ustawienia
            </h3>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs md:text-sm">
                Analityka (Google Analytics 4)
              </span>
              <input
                type="checkbox"
                checked={consent.analytics_storage === "granted"}
                onChange={toggleConsent}
                className="w-5 h-5 text-blue-500 rounded focus:ring-blue-400"
              />
            </label>
            <div className="flex gap-2 mt-4 justify-center">
              <button
                onClick={() => saveConsent(consent)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition"
              >
                Zapisz
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        {/* Przyciski akcji */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
          <button
            onClick={handleAcceptAll}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition shadow-md"
          >
            Akceptuj
          </button>
          <button
            onClick={handleRejectAll}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition shadow-md"
          >
            Odrzuć
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition shadow-md"
          >
            {showSettings ? "Ukryj" : "Ustawienia"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
