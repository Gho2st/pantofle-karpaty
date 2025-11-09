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
      {/* Nagłówek */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Kody Rabatowe
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm sm:text-base"
        >
          <Plus className="w-5 h-5" />
          Dodaj kod
        </button>
      </div>

      {/* Formularz */}
      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {editingCode ? "Edytuj kod" : "Nowy kod rabatowy"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kod
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="BLACKFRIDAY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ rabatu
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min. kwota zamówienia
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm({ ...form, minOrderValue: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="Opcjonalne"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maks. użycia
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({ ...form, maxUses: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
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
                  className="h-4 w-4 text-red-600 rounded border-gray-300"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Aktywny
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition text-sm"
              >
                {editingCode ? "Zapisz" : "Dodaj"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-400 transition text-sm"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista kodów – RESPONSIVE: Karty na mobile, tabela na desktop */}
      <div className="space-y-4 md:space-y-0">
        {codes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
            Brak kodów rabatowych
          </div>
        ) : (
          <>
            {/* Desktop: Tabela */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kod
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rabat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Min. kwota
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Użycia
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ważność
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {codes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {code.code}
                      </td>
                      <td className="px-4 py-3">
                        {code.type === "percentage"
                          ? `${code.value}%`
                          : `${code.value} PLN`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {code.minOrderValue ? `${code.minOrderValue} PLN` : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {code.maxUses
                          ? `${code.usedCount}/${code.maxUses}`
                          : "∞"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
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
                      <td className="px-4 py-3">
                        {code.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" /> Aktywny
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-500 text-sm">
                            <XCircle className="w-4 h-4" /> Nieaktywny
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => startEdit(code)}
                          className="text-blue-600 hover:text-blue-800"
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: Karty */}
            <div className="md:hidden space-y-3">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className="bg-white p-4 rounded-lg shadow border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg text-gray-900">
                      {code.code}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(code)}
                        className="text-blue-600"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(code.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Rabat:</span>
                      <div>
                        {code.type === "percentage"
                          ? `${code.value}%`
                          : `${code.value} PLN`}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Min. kwota:</span>
                      <div>
                        {code.minOrderValue ? `${code.minOrderValue} PLN` : "—"}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Użycia:</span>
                      <div>
                        {code.maxUses
                          ? `${code.usedCount}/${code.maxUses}`
                          : "∞"}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Ważność:</span>
                      <div className="text-xs">
                        {code.validFrom || code.validTo
                          ? `${code.validFrom?.split("T")[0] || "..."} → ${
                              code.validTo?.split("T")[0] || "..."
                            }`
                          : "Bezterminowy"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`flex items-center gap-1 text-sm ${
                        code.isActive ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {code.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Aktywny
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Nieaktywny
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
