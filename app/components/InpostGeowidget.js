import { useState } from "react";
import InpostGeowidget from "@majlxrd/inpost-geowidget-next";

export default function InpostMap() {
  const INPOST_TOKEN = process.env.NEXT_PUBLIC_INPOST_TOKEN;

  const [selectedPoint, setSelectedPoint] = useState(null);

  const handlePointSelect = (point) => {
    console.log("Parcel locker selected:", point);
    setSelectedPoint(point);
  };

  const handleApiReady = (api) => {
    console.log("GeoWidget API is ready:", api);
    // You can now use the API, for example: api.openMap();
  };

  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Select an InPost Parcel Locker</h1>

      {/* The container MUST have a defined width and height for the widget to be visible. */}
      <div
        style={{
          width: "800px",
          height: "500px",
          margin: "2rem auto",
          border: "1px solid #ccc",
        }}
      >
        <InpostGeowidget
          token={INPOST_TOKEN}
          sandbox={true} // Use true for testing, false for production
          onPointSelect={handlePointSelect}
          onApiReady={handleApiReady}
          language="pl"
        />
      </div>

      {selectedPoint && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#f0f0f0",
          }}
        >
          <h3>Selected Point Details:</h3>
          <p>
            <strong>Name:</strong> {selectedPoint.name}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {`${selectedPoint.address_details.street}, ${selectedPoint.address_details.city}`}
          </p>
        </div>
      )}
    </main>
  );
}
