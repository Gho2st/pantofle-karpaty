// app/admin/DiscountCodes.js
"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";

export default function DiscountCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState(null);

  // Formularz
  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrderValue: "",
    maxUses: "",
    validFrom: "",
    validTo: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/discounts");
      const data = await res.json();
      setCodes(data);
    } catch (err) {
      toast.error("Błąd ładowania kodów");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingCode
      ? `/api/discounts/${editingCode.id}`
      : "/api/discounts";
    const method = editingCode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value),
          minOrderValue: form.minOrderValue
            ? parseFloat(form.minOrderValue)
            : null,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          validFrom: form.validFrom || null,
          validTo: form.validTo || null,
        }),
      });

      if (res.ok) {
        toast.success(editingCode ? "Kod zaktualizowany" : "Kod dodany");
        resetForm();
        fetchCodes();
      } else {
        const error = await res.json();
        toast.error(error.error || "Błąd");
      }
    } catch (err) {
      toast.error("Błąd połączenia");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Na pewno usunąć kod?")) return;

    try {
      await fetch(`/api/discounts/${id}`, { method: "DELETE" });
      toast.success("Kod usunięty");
      fetchCodes();
    } catch (err) {
      toast.error("Błąd usuwania");
    }
  };

  const startEdit = (code) => {
    setEditingCode(code);
    setForm({
      code: code.code,
      type: code.type,
      value: code.value,
      minOrderValue: code.minOrderValue || "",
      maxUses: code.maxUses || "",
      validFrom: code.validFrom ? code.validFrom.split("T")[0] : "",
      validTo: code.validTo ? code.validTo.split("T")[0] : "",
      isActive: code.isActive,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingCode(null);
    setForm({
      code: "",
      type: "percentage",
      value: "",
      minOrderValue: "",
      maxUses: "",
      validFrom: "",
      validTo: "",
      isActive: true,
    });
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Ładowanie kodów...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Kody Rabatowe</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          <Plus className="w-5 h-5" />
          Dodaj kod
        </button>
      </div>

      {/* Formularz */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {editingCode ? "Edytuj kod" : "Nowy kod rabatowy"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kod (np. BLACKFRIDAY)
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="WIELKIE LITERY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ rabatu
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="percentage">Procentowy (%)</option>
                  <option value="fixed">Kwotowy (PLN)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wartość {form.type === "percentage" ? "(%)" : "(PLN)"}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step={form.type === "percentage" ? "1" : "0.01"}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min. wartość zamówienia (PLN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm({ ...form, minOrderValue: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Opcjonalne"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maks. liczba użyć
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({ ...form, maxUses: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Opcjonalne"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ważny od
                </label>
                <input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) =>
                    setForm({ ...form, validFrom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ważny do
                </label>
                <input
                  type="date"
                  value={form.validTo}
                  onChange={(e) =>
                    setForm({ ...form, validTo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Aktywny
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition"
              >
                {editingCode ? "Zapisz zmiany" : "Dodaj kod"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-400 transition"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista kodów */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kod
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rabat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min. kwota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Użycia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ważność
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {codes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Brak kodów rabatowych
                </td>
              </tr>
            ) : (
              codes.map((code) => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {code.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.type === "percentage"
                      ? `${code.value}%`
                      : `${code.value} PLN`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {code.minOrderValue ? `${code.minOrderValue} PLN` : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {code.maxUses ? `${code.usedCount}/${code.maxUses}` : "∞"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {code.validFrom || code.validTo ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-4 h-4" />
                        {code.validFrom?.split("T")[0] || "..."} →{" "}
                        {code.validTo?.split("T")[0] || "..."}
                      </div>
                    ) : (
                      "Bezterminowy"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.isActive ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Aktywny
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <XCircle className="w-4 h-4" />
                        Nieaktywny
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => startEdit(code)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
