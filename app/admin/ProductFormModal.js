"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { useAdmin } from "../context/adminContext";
import { generateSlug } from "../utils/slugify";
import ImageProcessor from "./ImageProcessor";

export default function ProductFormModal() {
  const { editingProduct, setEditingProduct, handleEditProduct } = useAdmin();
  const [productData, setProductData] = useState(null);
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    if (editingProduct) {
      setProductData({
        ...editingProduct,
        promoPrice: editingProduct.promoPrice || null,
        slug: editingProduct.slug || generateSlug(editingProduct.name),
        featured: editingProduct.featured || false,
        colorHex: editingProduct.colorHex || "",
        colorGroup: editingProduct.colorGroup || "",
      });

      const existingItems = (editingProduct.images || []).map((url) => ({
        id: crypto.randomUUID(),
        kind: "existing",
        url,
        removed: false,
      }));
      setMediaItems(existingItems);
    } else {
      setProductData(null);
      setMediaItems([]);
    }
  }, [editingProduct]);

  if (!productData) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProductData((prev) => ({
      ...prev,
      // Po prostu zapisujemy wartość. Nie parsujemy jej podczas wpisywania.
      [name]: type === "checkbox" ? checked : value,
      // Automatyczne generowanie sluga przy zmianie nazwy
      ...(name === "name" && { slug: generateSlug(value) }),
    }));
  };

  const handleAddSize = () => {
    if (!newSize || !newStock || newStock < 0) {
      toast.error("Podaj prawidłowy rozmiar i dodatni stan");
      return;
    }
    setProductData((prev) => ({
      ...prev,
      sizes: [
        ...(prev.sizes || []),
        { size: newSize, stock: parseInt(newStock) },
      ],
    }));
    setNewSize("");
    setNewStock("");
  };

  const handleRemoveSize = (sizeToRemove) => {
    setProductData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((item) => item.size !== sizeToRemove),
    }));
  };

  const handleAdjustStock = (size, adjustment) => {
    const sizeData = productData?.sizes?.find((s) => s.size === size);
    if (adjustment === -1 && (!sizeData || sizeData.stock <= 0)) {
      toast.error("Stan magazynowy nie może być mniejszy niż 0");
      return;
    }
    setProductData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((item) =>
        item.size === size ? { ...item, stock: item.stock + adjustment } : item,
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productData.name || !productData.price) {
      toast.error("Nazwa i cena produktu są wymagane");
      return;
    }
    if (
      isNaN(parseFloat(productData.price)) ||
      parseFloat(productData.price) <= 0
    ) {
      toast.error("Cena regularna musi być dodatnią liczbą");
      return;
    }
    if (productData.promoPrice !== null) {
      const promo = parseFloat(productData.promoPrice);
      if (isNaN(promo) || promo <= 0) {
        toast.error("Cena promocyjna musi być dodatnią liczbą");
        return;
      }
      if (promo >= parseFloat(productData.price)) {
        toast.error("Cena promocyjna musi być niższa niż regularna");
        return;
      }
    }
    if (!productData.id || isNaN(parseInt(productData.id))) {
      toast.error("Błąd: Nieprawidłowe ID produktu");
      return;
    }
    if (!productData.categoryId || isNaN(parseInt(productData.categoryId))) {
      toast.error("Błąd: Nieprawidłowe ID kategorii");
      return;
    }

    if (
      mediaItems.some(
        (item) =>
          (item.kind === "new" && item.processing) ||
          (item.kind === "existing" && item.converting),
      )
    ) {
      toast.error("Poczekaj aż wszystkie zdjęcia zostaną przetworzone");
      return;
    }

    const remainingExisting = mediaItems.filter(
      (i) => i.kind === "existing" && !i.removed,
    );
    const newOnes = mediaItems.filter((i) => i.kind === "new");

    if (remainingExisting.length === 0 && newOnes.length === 0) {
      toast.error("Produkt musi mieć przynajmniej jedno zdjęcie");
      return;
    }

    // === NOWA LOGIKA KOLEJNOŚCI ===
    const imagesToRemove = [
      ...mediaItems
        .filter((i) => i.kind === "existing" && i.removed)
        .map((i) => i.url),
      ...mediaItems
        .filter((i) => i.kind === "new" && i.replacesUrl)
        .map((i) => i.replacesUrl),
    ];

    const imagesToAdd = newOnes.map((i) => i.file);

    const newIndexMap = new Map(newOnes.map((item, index) => [item.id, index]));

    const imageOrder = mediaItems
      .filter((i) => !(i.kind === "existing" && i.removed))
      .map((item) => {
        if (item.kind === "existing") {
          return { type: "existing", url: item.url };
        } else {
          return { type: "new", index: newIndexMap.get(item.id) };
        }
      });

    handleEditProduct({
      ...productData,
      imagesToAdd,
      imagesToRemove,
      imageOrder,
      sortOrder: productData.sortOrder ? parseInt(productData.sortOrder) : null,
      colorHex: productData.colorHex || null,
      colorGroup: productData.colorGroup || null,
    });

    setEditingProduct(null);
  };

  const inputClass =
    "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            Edytuj: {productData.name}
          </h3>
          <button
            onClick={() => setEditingProduct(null)}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nazwa produktu</label>
            <input
              type="text"
              name="name"
              value={productData.name || ""}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              type="text"
              name="slug"
              value={productData.slug || ""}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Cena regularna (PLN)</label>
            <input
              type="number"
              name="price"
              value={productData.price || ""}
              onChange={handleChange}
              className={inputClass}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enablePromo"
              checked={
                productData.promoPrice !== null &&
                productData.promoPrice !== undefined
              }
              onChange={(e) =>
                setProductData((prev) => ({
                  ...prev,
                  promoPrice: e.target.checked ? "" : null,
                }))
              }
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label
              htmlFor="enablePromo"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Włącz cenę promocyjną
            </label>
          </div>

          {productData.promoPrice !== null && (
            <>
              <div>
                <label className={labelClass}>Cena promocyjna (PLN)</label>
                <input
                  type="number"
                  name="promoPrice"
                  value={productData.promoPrice || ""}
                  onChange={handleChange}
                  className={`${inputClass} ${productData.promoPrice >= productData.price ? "border-red-500" : ""}`}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Promocja od</label>
                  <input
                    type="datetime-local"
                    name="promoStartDate"
                    value={
                      productData.promoStartDate
                        ? productData.promoStartDate.slice(0, 16)
                        : ""
                    }
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Promocja do</label>
                  <input
                    type="datetime-local"
                    name="promoEndDate"
                    value={
                      productData.promoEndDate
                        ? productData.promoEndDate.slice(0, 16)
                        : ""
                    }
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
            <h4 className="text-sm font-semibold text-amber-800 uppercase tracking-wide">
              Wyróżnienie i warianty
            </h4>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={productData.featured || false}
                onChange={handleChange}
                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                ⭐ Produkt polecany (Featured)
                <span className="block text-xs font-normal text-gray-500">
                  Pojawi się w sliderze „Wybrane dla Ciebie" na stronie głównej
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Kolor (hex)
                  <span className="block text-xs font-normal text-gray-500">
                    np. #3b2314
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="colorHex"
                    value={productData.colorHex || "#ffffff"}
                    onChange={handleChange}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    name="colorHex"
                    value={productData.colorHex || ""}
                    onChange={handleChange}
                    placeholder="#3b2314"
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Grupa kolorystyczna
                  <span className="block text-xs font-normal text-gray-500">
                    np. klapki-zamszowe
                  </span>
                </label>
                <input
                  type="text"
                  name="colorGroup"
                  value={productData.colorGroup || ""}
                  onChange={handleChange}
                  placeholder="np. klapki-zamszowe"
                  className={inputClass}
                />
              </div>
            </div>
            {productData.colorHex && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div
                  className="w-5 h-5 rounded-full border border-gray-300"
                  style={{ background: productData.colorHex }}
                />
                Podgląd koloru
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <label className={labelClass}>
              Kolejność w kategorii
              <span className="block text-xs font-normal text-gray-500">
                Im mniejsza liczba → tym wyżej (np. 1, 2, 3...)
              </span>
            </label>
            <input
              type="number"
              name="sortOrder"
              value={productData.sortOrder ?? ""}
              onChange={handleChange}
              placeholder="opcjonalne"
              className={inputClass}
              min="1"
              step="1"
            />
          </div>

          <div>
            <label className={labelClass}>Opis produktu</label>
            <textarea
              name="description"
              value={productData?.description || ""}
              onChange={handleChange}
              className={inputClass}
              rows="4"
            />
          </div>
          <div>
            <label className={labelClass}>Dodatkowy opis</label>
            <textarea
              name="description2"
              value={productData?.description2 || ""}
              onChange={handleChange}
              className={inputClass}
              rows="4"
            />
          </div>
          <div>
            <label className={labelClass}>Dodatkowe informacje</label>
            <textarea
              name="additionalInfo"
              value={productData?.additionalInfo || ""}
              onChange={handleChange}
              className={inputClass}
              rows="4"
            />
          </div>

          {/* === ZDJĘCIA === */}
          <ImageProcessor images={mediaItems} onChange={setMediaItems} />

          {/* Rozmiary */}
          <div>
            <label className={labelClass}>Rozmiary i stany magazynowe</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="Rozmiar"
                className="flex-1 p-3 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Stan"
                className="flex-1 p-3 border border-gray-300 rounded-md"
                min="0"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Dodaj
              </button>
            </div>
            {productData.sizes?.length > 0 ? (
              <ul className="space-y-1">
                {productData.sizes.map((item) => (
                  <li
                    key={item.size}
                    className="flex flex-wrap items-center gap-2 text-sm text-gray-600 py-1"
                  >
                    <span className="font-medium">
                      Rozmiar {item.size}: {item.stock} szt.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(item.size, 1)}
                      className="px-2 py-0.5 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(item.size, -1)}
                      disabled={item.stock <= 0}
                      className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(item.size)}
                      className="ml-auto text-red-500 hover:text-red-700 text-xs"
                    >
                      Usuń
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Brak rozmiarów</p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
              Zapisz zmiany
            </button>
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-6 py-2.5 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
