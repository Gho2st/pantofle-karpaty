// components/InpostMap.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";

const InPostGeowidget = ({
  onPointSelect,
  token,
  language = "pl",
  config = "parcelCollect",
}) => {
  const widgetContainerRef = useRef(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showMap, setShowMap] = useState(true); // Nowy stan do kontroli widoczności mapy

  // 1. Dynamiczne ładowanie skryptów i stylów (wykonywane tylko raz)
  useEffect(() => {
    const scriptId = "inpost-geowidget-script";
    if (document.getElementById(scriptId)) return;

    // Ładowanie CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://geowidget.inpost.pl/inpost-geowidget.css";
    document.head.appendChild(link);

    // Ładowanie JS
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://geowidget.inpost.pl/inpost-geowidget.js";
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // 2. Montowanie geowidgetu i obsługa zdarzeń
  useEffect(() => {
    const container = widgetContainerRef.current;
    if (!container || !token || !showMap) return; // Nie montuj jeśli mapa ukryta

    const handlePointSelect = (point) => {
      if (!point) {
        console.error("Błąd: Otrzymany obiekt punktu jest pusty.");
        return;
      }

      console.log("✅ Punkt InPost odebrany pomyślnie:", point);
      setSelectedPoint(point);

      // UKRYJ MAPĘ po wybraniu punktu
      setShowMap(false);

      onPointSelect({
        name: point.name,
        fullData: point,
      });
    };

    window.handleInpostPointSelect = handlePointSelect;

    const timer = setTimeout(() => {
      const geowidgetElement = document.createElement("inpost-geowidget");

      geowidgetElement.setAttribute("token", token);
      geowidgetElement.setAttribute("language", language);
      geowidgetElement.setAttribute("config", config);
      geowidgetElement.setAttribute("onpoint", "handleInpostPointSelect");

      container.innerHTML = "";
      container.appendChild(geowidgetElement);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (container) {
        container.innerHTML = "";
      }
      delete window.handleInpostPointSelect;
    };
  }, [token, language, config, onPointSelect, showMap]); // Dodano showMap do zależności

  // FUNKCJA DO PONOWNEGO POKAZANIA MAPY
  const handleChangePoint = () => {
    setSelectedPoint(null);
    setShowMap(true);
  };

  return (
    <div>
      {/* MAPA - WYŚWIETLANA TYLKO JEŚLI showMap = true */}
      {showMap ? (
        <div>
          <div
            ref={widgetContainerRef}
            style={{
              width: "100%",
              height: "600px",
              border: "1px solid #ccc",
              marginBottom: "20px",
            }}
          />
        </div>
      ) : null}

      {/* WYBRANY PUNKT LUB PRZYCISK ZMIANY */}
      <div className="space-y-4">
        {showMap ? (
          // Stan początkowy - brak wybranego punktu
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600">Proszę wybrać paczkomat na mapie</p>
          </div>
        ) : (
          // Wybrany punkt + przycisk zmiany
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800">
                  ✓ Wybrany Paczkomat
                </h4>
                <button
                  onClick={handleChangePoint}
                  className="px-4 py-2 bg-green-200 text-black rounded-lg cursor-pointer hover:bg-green-300 transition-colors text-sm font-medium"
                >
                  Zmień paczkomat
                </button>
              </div>

              <div className="bg-white p-3 rounded border">
                <p className="font-medium">{selectedPoint.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedPoint.address_details.street}{" "}
                  {selectedPoint.address_details.building_number},{" "}
                  {selectedPoint.address_details.post_code}{" "}
                  {selectedPoint.address_details.city}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InPostGeowidget;
