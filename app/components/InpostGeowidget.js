// app/components/InpostGeowidget.jsx
"use client"; // Dla Next.js App Router
import { useState, useEffect, useRef } from "react";

export default function InpostGeowidget({
  token = process.env.NEXT_PUBLIC_INPOST_TOKEN,
  config = "parcelCollect", // Opcje: parcelCollect, parcelCollectPayment, parcelCollect247, parcelSend
  language = "pl", // pl, en, uk
  onPointSelect, // Callback: (point) => {} – point zawiera name, code, address itp.
  initialPosition = { lat: 52.2297, lng: 21.0122 }, // Domyślnie Warszawa; użyj z formData.city/postalCode
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const widgetRef = useRef(null);
  const apiRef = useRef(null); // Do metod API, np. changePosition

  useEffect(() => {
    // Ładuj CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://geowidget.inpost.pl/inpost-geowidget.css";
    document.head.appendChild(link);

    // Ładuj JS dynamicznie
    const script = document.createElement("script");
    script.src = "https://geowidget.inpost.pl/inpost-geowidget.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
      initWidget();
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.head.removeChild(link);
      if (script.parentNode) document.body.removeChild(script);
    };
  }, []);

  const initWidget = () => {
    if (!widgetRef.current || typeof customElements === "undefined") return;

    // Utwórz custom element programowo (dla React)
    const widget = document.createElement("inpost-geowidget");
    widget.setAttribute("token", token);
    widget.setAttribute("language", language);
    widget.setAttribute("config", config);
    widget.setAttribute("id", "geowidget"); // Dla API

    // Event listener dla wyboru punktu
    widget.addEventListener("onpointselect", (event) => {
      const point = event.detail; // { name, code, address, type, ... }
      console.log("Wybrany punkt:", point);
      if (onPointSelect) onPointSelect(point);
    });

    // Listener dla inicjalizacji API
    widget.addEventListener("inpost.geowidget.init", (event) => {
      apiRef.current = event.detail.api;
      // Przykład: Zmień pozycję na podstawie adresu dostawy
      if (initialPosition.lat && initialPosition.lng) {
        apiRef.current.changePosition(initialPosition, 12); // Zoom 12
      }
    });

    widgetRef.current.appendChild(widget);
  };

  if (!isLoaded) {
    return (
      <div className="p-4 border rounded-md">Ładowanie mapy InPost...</div>
    );
  }

  return (
    <div
      ref={widgetRef}
      className="w-full h-[500px] border rounded-md" // Dostosuj wysokość
      dangerouslySetInnerHTML={{ __html: "" }} // Pusty kontener dla widgetu
    />
  );
}
