"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

export default function AddressForm() {
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    postalCode: "",
    phone: "",
    paczkomat: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const geowidgetRef = useRef(null);

  const INPOST_TOKEN = process.env.NEXT_PUBLIC_INPOST_TOKEN;

  useEffect(() => {
    // Ładuj skrypty i CSS Geowidget dynamicznie
    const loadGeowidget = () => {
      if (document.getElementById("inpost-geowidget-css")) return; // Już załadowane

      // CSS
      const cssLink = document.createElement("link");
      cssLink.id = "inpost-geowidget-css";
      cssLink.rel = "stylesheet";
      cssLink.href = "https://geowidget.inpost.pl/inpost-geowidget.css";
      document.head.appendChild(cssLink);

      // JS
      const script = document.createElement("script");
      script.src = "https://geowidget.inpost.pl/inpost-geowidget.js";
      script.defer = true;
      script.onload = () => {
        // Inicjalizuj widget po załadowaniu skryptu
        initGeowidget();
      };
      document.head.appendChild(script);
    };

    loadGeowidget();

    // Listener na wybór paczkomatu
    const handlePointSelect = (event) => {
      if (event.detail && event.detail.name) {
        setFormData((prev) => ({ ...prev, paczkomat: event.detail.name })); // Kod paczkomatu, np. "KRA02APP"
        toast.success(`Wybrano paczkomat: ${event.detail.name}`);
      }
    };

    document.addEventListener("onpointselect", handlePointSelect);
    return () =>
      document.removeEventListener("onpointselect", handlePointSelect);
  }, []);

  // Inicjalizuj widget po załadowaniu skryptu
  const initGeowidget = () => {
    if (geowidgetRef.current && INPOST_TOKEN !== "YOUR_INPOST_TOKEN_HERE") {
      // Utwórz custom tag
      geowidgetRef.current.innerHTML = `
        <inpost-geowidget 
          id="geowidget" 
          onpoint="onpointselect" 
          token="${INPOST_TOKEN}" 
          language="pl" 
          config="parcelcollect"
          ${
            formData.postalCode
              ? `postal_code="${formData.postalCode.replace("-", "")}"`
              : ""
          }
        ></inpost-geowidget>
      `;
    } else if (INPOST_TOKEN === "YOUR_INPOST_TOKEN_HERE") {
      toast.error("Dodaj swój token InPost w kodzie, aby widget działał!");
    }
  };

  // Ponowne inicjalizowanie po zmianie kodu pocztowego
  useEffect(() => {
    if (geowidgetRef.current) {
      initGeowidget();
    }
  }, [formData.postalCode]);

  // Pobierz adresy użytkownika
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/addresses");
        const data = await response.json();
        if (response.ok) {
          setAddresses(data.addresses || []);
        } else {
          toast.error(data.error || "Błąd podczas pobierania adresów");
        }
      } catch (error) {
        console.error("Błąd podczas pobierania adresów:", error);
        toast.error("Błąd serwera");
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.paczkomat) {
      toast.error("Wybierz paczkomat na mapie!");
      return;
    }
    setLoading(true);

    try {
      const url = isEditing
        ? `/api/addresses/${editingAddressId}`
        : "/api/addresses";
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        if (isEditing) {
          setAddresses(
            addresses.map((addr) =>
              addr.id === editingAddressId ? { ...addr, ...formData } : addr
            )
          );
          toast.success("Adres zaktualizowany");
        } else {
          setAddresses([...addresses, { id: data.id, ...formData }]);
          toast.success("Adres dodany");
        }
        setFormData({
          street: "",
          city: "",
          postalCode: "",
          phone: "",
          paczkomat: "",
        });
        setIsEditing(false);
        setEditingAddressId(null);
      } else {
        toast.error(data.error || "Błąd podczas zapisywania adresu");
      }
    } catch (error) {
      console.error("Błąd podczas zapisywania adresu:", error);
      toast.error("Błąd serwera");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      phone: address.phone,
      paczkomat: address.paczkomat,
    });
    setIsEditing(true);
    setEditingAddressId(address.id);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        setAddresses(addresses.filter((addr) => addr.id !== id));
        toast.success("Adres usunięty");
      } else {
        toast.error(data.error || "Błąd podczas usuwania adresu");
      }
    } catch (error) {
      console.error("Błąd podczas usuwania adresu:", error);
      toast.error("Błąd serwera");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl mb-4">Adresy</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="street" className="block text-gray-700 font-medium">
            Ulica i numer
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            className="border p-2 rounded-md w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-gray-700 font-medium">
            Miasto
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="border p-2 rounded-md w-full"
            required
          />
        </div>
        <div>
          <label
            htmlFor="postalCode"
            className="block text-gray-700 font-medium"
          >
            Kod pocztowy
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            className="border p-2 rounded-md w-full"
            placeholder="np. 30-001"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-gray-700 font-medium">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="border p-2 rounded-md w-full"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            Paczkomat InPost (wybierz na mapie)
          </label>
          <div
            ref={geowidgetRef}
            className="border rounded-md p-4 h-96 w-full bg-gray-100 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: "" }} // Dynamicznie wstawiany tag
          />
          {formData.paczkomat && (
            <p className="text-sm text-green-600 mt-2">
              Wybrany paczkomat: {formData.paczkomat}
            </p>
          )}
          {!INPOST_TOKEN || INPOST_TOKEN === "YOUR_INPOST_TOKEN_HERE" ? (
            <p className="text-sm text-red-500 mt-1">
              Dodaj token InPost, aby mapa działała!
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={loading || !formData.paczkomat}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading
            ? "Zapisywanie..."
            : isEditing
            ? "Zaktualizuj adres"
            : "Dodaj adres"}
        </button>
      </form>

      {/* Lista zapisanych adresów */}
      {loading ? (
        <p>Ładowanie...</p>
      ) : addresses.length === 0 ? (
        <p className="text-gray-700">Brak zapisanych adresów.</p>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border p-4 rounded-md flex justify-between items-center"
            >
              <div>
                <p>
                  {address.street}, {address.postalCode} {address.city}
                </p>
                <p>Telefon: {address.phone}</p>
                <p>Paczkomat: {address.paczkomat}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(address)}
                  className="text-blue-600 hover:underline"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="text-red-600 hover:underline"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
