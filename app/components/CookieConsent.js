"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState({
    analytics_storage: "denied",
  });

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

  const applyConsent = (consentState) => {
    if (typeof window === "undefined") return;
    if (consentState.analytics_storage === "granted") {
      loadGTM();
    } else {
      removeGTM();
    }
  };

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

  const removeGTM = () => {
    const script = document.getElementById("gtm-script");
    if (script) script.remove();
    if (window.dataLayer) window.dataLayer = [];
  };

  const saveConsent = (newConsent) => {
    setConsent(newConsent);
    localStorage.setItem("cookie-consent", JSON.stringify(newConsent));
    applyConsent(newConsent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => saveConsent({ analytics_storage: "granted" });
  const handleRejectAll = () => saveConsent({ analytics_storage: "denied" });
  const toggleConsent = () =>
    setConsent((prev) => ({
      analytics_storage:
        prev.analytics_storage === "granted" ? "denied" : "granted",
    }));

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8">
        {/* Nagłówek */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
            Pantofle Karpaty
          </p>
          <h2 className="text-lg font-medium text-gray-900">
            Ta strona używa ciasteczek
          </h2>
        </div>

        {/* Opis */}
        <p className="text-sm text-gray-500 leading-relaxed mb-4">
          Używamy{" "}
          <span className="text-gray-700 font-medium">Google Analytics 4</span>,
          by lepiej rozumieć, jak korzystasz ze sklepu i poprawiać jego
          działanie.{" "}
          <Link
            href="/polityka-prywatnosci"
            className="text-red-700 hover:text-red-800 underline underline-offset-2 transition-colors"
          >
            Polityka prywatności
          </Link>
        </p>

        {/* Panel ustawień */}
        {showSettings && (
          <div className="mb-5 p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
              Ustawienia
            </p>
            <label className="flex items-center justify-between cursor-pointer gap-4">
              <span className="text-sm text-gray-700">
                Analityka (Google Analytics 4)
              </span>
              {/* Toggle switch */}
              <div
                onClick={toggleConsent}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${
                  consent.analytics_storage === "granted"
                    ? "bg-red-600"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    consent.analytics_storage === "granted"
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </div>
            </label>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => saveConsent(consent)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium uppercase tracking-wide rounded-lg transition-colors"
              >
                Zapisz
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium uppercase tracking-wide rounded-lg transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        {/* Przyciski główne */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAcceptAll}
            className="flex-1 min-w-[100px] py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Akceptuj
          </button>
          <button
            onClick={handleRejectAll}
            className="flex-1 min-w-[100px] py-2.5 px-5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            Odrzuć
          </button>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="py-2.5 px-5 border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm font-medium rounded-lg transition-colors"
          >
            {showSettings ? "Ukryj" : "Ustawienia"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
