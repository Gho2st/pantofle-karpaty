"use client";
import { useState, useEffect } from "react";

export default function AddressForm() {
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    postalCode: "",
    phone: "",
    paczkomat: "",
    isPrimary: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (!response.ok) throw new Error("Błąd pobierania adresów");
      const data = await response.json();
      setAddresses(data.addresses);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = editingId ? `/api/addresses/${editingId}` : "/api/addresses";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd podczas zapisywania adresu");
      }

      setFormData({
        street: "",
        city: "",
        postalCode: "",
        phone: "",
        paczkomat: "",
        isPrimary: false,
      });
      setEditingId(null);
      await fetchAddresses();
    } catch (err) {
      setError(err.message);
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
      paczkomat: address.paczkomat || "",
      isPrimary: address.isPrimary || false,
    });
    setEditingId(address.id);
  };

  const handleDelete = (id) => {
    setAddressToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;

    try {
      const response = await fetch(`/api/addresses/${addressToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd podczas usuwania adresu");
      }

      await fetchAddresses();
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteModal(false);
      setAddressToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAddressToDelete(null);
  };

  const handleSetPrimary = async (id) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || "Błąd podczas ustawiania głównego adresu"
        );
      }

      await fetchAddresses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl mb-4">Adresy</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Formularz dodawania/edytowania adresu */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block text-gray-700 font-medium">
            Ulica i numer
          </label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Miasto</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            Kod pocztowy
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">Telefon</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium">
            Paczkomat (opcjonalne)
          </label>
          <input
            type="text"
            name="paczkomat"
            value={formData.paczkomat}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPrimary"
              checked={formData.isPrimary}
              onChange={handleInputChange}
              className="h-4 w-4 text-red-600"
            />
            <span className="text-gray-700 font-medium">
              Ustaw jako główny adres
            </span>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading
            ? "Zapisywanie..."
            : editingId
            ? "Zaktualizuj adres"
            : "Dodaj adres"}
        </button>
      </form>

      {/* Lista adresów */}
      {addresses.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Zapisane adresy</h2>
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border border-gray-200 rounded-md p-4 flex justify-between items-center ${
                address.isPrimary ? "bg-green-50" : ""
              }`}
            >
              <div>
                <p className="font-medium">
                  {address.street}
                  {address.isPrimary && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Główny
                    </span>
                  )}
                </p>
                <p>
                  {address.city}, {address.postalCode}
                </p>
                <p>Telefon: {address.phone}</p>
                {address.paczkomat && <p>Paczkomat: {address.paczkomat}</p>}
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
                {!address.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(address.id)}
                    className="text-green-600 hover:underline"
                  >
                    Ustaw jako główny
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700">Brak zapisanych adresów.</p>
      )}

      {/* Modal potwierdzający usunięcie */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900">
              Potwierdź usunięcie
            </h3>
            <p className="mt-2 text-gray-600">
              Czy na pewno chcesz usunąć ten adres? Tej operacji nie można
              cofnąć.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
