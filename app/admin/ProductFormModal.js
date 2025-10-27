"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { useAdmin } from "../context/adminContext";
import { generateSlug } from "../utils/slugify";

export default function ProductFormModal() {
  const { editingProduct, setEditingProduct, handleEditProduct } = useAdmin();
  const [productData, setProductData] = useState(null);
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");

  useEffect(() => {
    console.log("editingProduct zmienione:", editingProduct);
    if (editingProduct) {
      setProductData({
        ...editingProduct,
        imagesToAdd: [],
        imagesToRemove: [],
      });
    } else {
      setProductData(null);
    }
  }, [editingProduct]);

  if (!productData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || "" : value,
      ...(name === "name" && { slug: generateSlug(value) }),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductData((prev) => ({
      ...prev,
      imagesToAdd: [...(prev.imagesToAdd || []), ...files],
    }));
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      setProductData((prev) => {
        const imageToRemove = prev.images[index];
        return {
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
          imagesToRemove: [...(prev.imagesToRemove || []), imageToRemove],
        };
      });
    } else {
      setProductData((prev) => ({
        ...prev,
        imagesToAdd: prev.imagesToAdd.filter((_, i) => i !== index),
      }));
    }
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
    setProductData((prev) => {
      const updatedSizes = prev.sizes.map((item) =>
        item.size === size ? { ...item, stock: item.stock + adjustment } : item
      );
      return { ...prev, sizes: updatedSizes };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Wysyłanie danych z formularza:", productData);
    if (!productData.name || !productData.price) {
      toast.error("Nazwa i cena produktu są wymagane");
      return;
    }
    if (
      isNaN(parseFloat(productData.price)) ||
      parseFloat(productData.price) <= 0
    ) {
      toast.error("Cena musi być dodatnią liczbą");
      return;
    }
    if (!productData.id || isNaN(parseInt(productData.id))) {
      console.error("Nieprawidłowe ID produktu:", productData.id);
      toast.error("Błąd: Nieprawidłowe ID produktu");
      return;
    }
    if (!productData.categoryId || isNaN(parseInt(productData.categoryId))) {
      console.error("Nieprawidłowe ID kategorii:", productData.categoryId);
      toast.error("Błąd: Nieprawidłowe ID kategorii");
      return;
    }
    handleEditProduct(productData);
    setEditingProduct(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Edytuj produkt: {productData.name}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nazwa produktu
            </label>
            <input
              type="text"
              name="name"
              value={productData.name || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (opcjonalny)
            </label>
            <input
              type="text"
              name="slug"
              value={productData.slug || ""}
              onChange={handleChange}
              placeholder="np. nowy-produkt"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cena (PLN)
            </label>
            <input
              type="number"
              name="price"
              value={productData.price || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opis produktu (opcjonalny)
            </label>
            <textarea
              name="description"
              value={productData?.description || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dodatkowy opis (opcjonalny)
            </label>
            <textarea
              name="description2"
              value={productData?.description2 || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dodatkowe informacje (opcjonalne)
            </label>
            <textarea
              name="additionalInfo"
              value={productData?.additionalInfo || ""}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zdjęcia produktu
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            {(productData.images?.length > 0 ||
              productData.imagesToAdd?.length > 0) && (
              <ul className="mt-2 list-disc pl-5">
                {productData.images?.map((url, index) => (
                  <li key={`existing-${index}`} className="text-gray-600">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Zdjęcie {index + 1}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, true)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Usuń
                    </button>
                  </li>
                ))}
                {productData.imagesToAdd?.map((file, index) => (
                  <li key={`new-${index}`} className="text-gray-600">
                    {file.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, false)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Usuń
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rozmiary i stany magazynowe
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="Rozmiar (np. 38)"
                className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Stan magazynowy"
                className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Dodaj
              </button>
            </div>
            <div className="mt-2">
              {productData.sizes?.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {productData.sizes.map((item) => (
                    <li
                      key={item.size}
                      className="flex flex-wrap items-center gap-2 text-gray-600"
                    >
                      <span>
                        Rozmiar: {item.size}, Stan: {item.stock}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(item.size, 1)}
                        className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(item.size, -1)}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                        disabled={item.stock <= 0}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(item.size)}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        Usuń
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">Brak dodanych rozmiarów</p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Zapisz zmiany
            </button>
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
