import React, { useEffect, useState } from "react";

function InpostMap() {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);

  //   const inpostToken = process.env.NEXT_PUBLIC_INPOST_SANDBOX_TOKEN;
  const inpostToken = process.env.NEXT_PUBLIC_INPOST_TOKEN;

  // Load CSS and JS for InPost GeoWidget
  useEffect(() => {
    if (document.querySelector('script[src*="inpost-geowidget.js"]')) {
      setIsWidgetLoaded(true);
      return;
    }

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://geowidget.inpost.pl/inpost-geowidget.css";
    document.head.appendChild(css);

    const js = document.createElement("script");
    js.defer = true;
    js.src = "https://geowidget.inpost.pl/inpost-geowidget.js";
    js.onload = () => setIsWidgetLoaded(true);
    document.body.appendChild(js);

    return () => {
      document.head.removeChild(css);
      document.body.removeChild(js);
    };
  }, []);

  // Set token programmatically
  useEffect(() => {
    if (isWidgetLoaded && inpostToken) {
      const widget = document.querySelector("inpost-geowidget");
      if (widget) {
        widget.setAttribute("token", inpostToken);
      }
    }
  }, [isWidgetLoaded, inpostToken]);

  // Define global callback for onPoint
  useEffect(() => {
    window.onPoint = (point) => {
      setSelectedPoint(point);
      console.log("Wybrany paczkomat:", point);
    };

    return () => {
      delete window.onPoint;
    };
  }, []);

  // Confirm selection handler
  const handleConfirmSelection = () => {
    if (selectedPoint) {
      alert(
        `Wybrano paczkomat: ${selectedPoint.name} (${selectedPoint.address_details.street} ${selectedPoint.address_details.building_number}, ${selectedPoint.address_details.city})`
      );
    } else {
      alert("Proszę wybrać paczkomat!");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="h-[500px] w-full">
        {isWidgetLoaded ? (
          <inpost-geowidget
            onPoint="onPoint"
            language="pl"
            config="parcelCollect"
          />
        ) : (
          <div>Loading InPost GeoWidget...</div>
        )}
      </div>

      {selectedPoint && (
        <div className="mt-4 p-4 border rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-lg font-bold">Wybrany paczkomat:</h2>
          <p>
            <strong>Nazwa:</strong> {selectedPoint.name}
          </p>
          <p>
            <strong>Adres:</strong> {selectedPoint.address_details.street}{" "}
            {selectedPoint.address_details.building_number},{" "}
            {selectedPoint.address_details.city}
          </p>
          <p>
            <strong>Typ:</strong> {selectedPoint.type}
          </p>
          <p>
            <strong>Godziny otwarcia:</strong>{" "}
            {selectedPoint.opening_hours || "Brak danych"}
          </p>
          <button
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={handleConfirmSelection}
          >
            Potwierdź wybór
          </button>
        </div>
      )}
    </div>
  );
}

export default InpostMap;
