// components/admin/Products.jsx
"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAdmin } from "../context/adminContext";
import { generateSlug } from "../utils/slugify";
import ProductFormModal from "./ProductFormModal";
import ImageProcessor from "./ImageProcessor";

export default function Products() {
  const {
    selectedCategory,
    setEditingProduct,
    handleAddProduct,
    setShowDeleteModal,
    fetchCategories,
    refreshSelectedCategory,
  } = useAdmin();

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    price: "",
    description: "",
    description2: "",
    additionalInfo: "",
    sizes: [],
    featured: false,
    colorHex: "",
    colorGroup: "",
  });
  // Lista zawiera tylko obiekty kind: "new" (przy dodawaniu nowego produktu nie ma istniejących)
  const [newProductImages, setNewProductImages] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    if (newProduct.name) {
      setNewProduct((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [newProduct.name]);

  const handleNewProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price"
            ? parseFloat(value) || ""
            : value,
    }));
  };

  const handleAddSize = () => {
    if (!newSize || !newStock || newStock < 0) {
      toast.error("Podaj prawidłowy rozmiar i stan magazynowy");
      return;
    }
    setNewProduct((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: newSize, stock: parseInt(newStock) }],
    }));
    setNewSize("");
    setNewStock("");
  };

  const handleRemoveSize = (size) => {
    setNewProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s.size !== size),
    }));
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      slug: "",
      price: "",
      description: "",
      description2: "",
      additionalInfo: "",
      sizes: [],
      featured: false,
      colorHex: "",
      colorGroup: "",
    });
    setNewProductImages([]);
    setShowAddForm(false);
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return toast.error("Wybierz kategorię");
    if (!newProduct.name || !newProduct.price)
      return toast.error("Nazwa i cena wymagane");

    // Wszystkie obrazy w formularzu dodawania to "new"
    const newOnes = newProductImages.filter((i) => i.kind === "new");

    if (newOnes.length === 0) {
      toast.error("Dodaj przynajmniej jedno zdjęcie produktu");
      return;
    }

    if (newOnes.some((img) => img.processing)) {
      toast.error("Poczekaj aż wszystkie zdjęcia zostaną przetworzone");
      return;
    }

    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("slug", newProduct.slug || generateSlug(newProduct.name));
      formData.append("price", newProduct.price);
      formData.append("description", newProduct.description || "");
      formData.append("description2", newProduct.description2 || "");
      formData.append("additionalInfo", newProduct.additionalInfo || "");
      formData.append("sizes", JSON.stringify(newProduct.sizes));
      formData.append("categoryId", selectedCategory.id);
      formData.append("featured", newProduct.featured ? "true" : "false");
      formData.append("colorHex", newProduct.colorHex || "");
      formData.append("colorGroup", newProduct.colorGroup || "");

      newOnes.forEach((item) => formData.append("files", item.file));

      await handleAddProduct(selectedCategory.id, formData);

      resetForm();
      toast.success("Produkt dodany!");
    } catch (err) {
      toast.error(err.message || "Błąd podczas dodawania");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRestoreProduct = async (productId) => {
    if (!confirm("Przywrócić produkt?")) return;
    try {
      const res = await fetch(`/api/restore-product/${productId}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const updatedCategories = await fetchCategories();
      refreshSelectedCategory(updatedCategories);
      toast.success("Produkt przywrócony!");
    } catch (err) {
      toast.error(err.message || "Błąd przywracania");
    }
  };

  const filteredProducts =
    selectedCategory?.products?.filter((p) =>
      showDeleted ? p.deletedAt : !p.deletedAt,
    ) || [];

  const renderPrice = (product) => {
    const hasPromo =
      product.promoPrice != null && product.promoPrice < product.price;
    const displayPrice = hasPromo ? product.promoPrice : product.price;
    const hasLowestPrice =
      product.lowestPrice != null && product.lowestPrice < displayPrice;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {hasPromo && (
            <span className="text-sm line-through text-gray-500">
              {product.price.toFixed(2)} PLN
            </span>
          )}
          <span
            className={`font-semibold ${
              hasPromo ? "text-red-600" : "text-gray-800"
            }`}
          >
            {displayPrice.toFixed(2)} PLN
          </span>
          {hasPromo && (
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">
              PROMOCJA
            </span>
          )}
        </div>
        {hasLowestPrice && (
          <div className="text-xs text-gray-500">
            Najniższa z 30 dni:{" "}
            <span className="font-bold text-red-600">
              {product.lowestPrice.toFixed(2)} PLN
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          Produkty w {selectedCategory?.name || "Kategorii"}
          {showDeleted && (
            <span className="ml-2 text-sm text-red-600 font-normal">
              (tryb: usunięte)
            </span>
          )}
        </h2>

        <button
          onClick={() => setShowDeleted((prev) => !prev)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            showDeleted
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {showDeleted ? "Ukryj usunięte" : "Pokaż usunięte"}
        </button>
      </div>

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Dodaj nowy produkt
        </button>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAddProductSubmit}
          className="mb-6 p-6 bg-gray-50 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Dodaj nowy produkt
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa produktu
              </label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
                placeholder="Nazwa produktu"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (automatycznie)
              </label>
              <input
                type="text"
                name="slug"
                value={newProduct.slug}
                onChange={handleNewProductChange}
                placeholder="np. nowy-produkt"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cena (PLN)
              </label>
              <input
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleNewProductChange}
                placeholder="Cena (PLN)"
                className="w-full p-3 border border-gray-300 rounded-md"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis produktu
              </label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleNewProductChange}
                placeholder="Opis produktu"
                className="w-full p-3 border border-gray-300 rounded-md"
                rows="4"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dodatkowy opis
              </label>
              <textarea
                name="description2"
                value={newProduct.description2}
                onChange={handleNewProductChange}
                placeholder="Dodatkowy opis"
                className="w-full p-3 border border-gray-300 rounded-md"
                rows="4"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dodatkowe informacje
              </label>
              <textarea
                name="additionalInfo"
                value={newProduct.additionalInfo}
                onChange={handleNewProductChange}
                placeholder="Materiały, pielęgnacja..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows="4"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageProcessor
                images={newProductImages}
                onChange={setNewProductImages}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rozmiary i stany
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Rozmiar (np. 38)"
                  className="flex-1 p-3 border rounded-md"
                />
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Stan"
                  className="flex-1 p-3 border rounded-md"
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
              {newProduct.sizes.length > 0 ? (
                <ul className="list-disc pl-5">
                  {newProduct.sizes.map((item) => (
                    <li
                      key={item.size}
                      className="text-gray-600 flex justify-between items-center"
                    >
                      <span>
                        {item.size}: {item.stock}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(item.size)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Usuń
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">Brak rozmiarów</p>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
            <h4 className="text-sm font-semibold text-amber-800 uppercase tracking-wide">
              Wyróżnienie i warianty
            </h4>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="new-featured"
                name="featured"
                checked={newProduct.featured}
                onChange={handleNewProductChange}
                className="w-5 h-5 text-amber-600 rounded"
              />
              <label
                htmlFor="new-featured"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                ⭐ Produkt polecany (Featured)
                <span className="block text-xs font-normal text-gray-500">
                  Pojawi się w sliderze na stronie głównej
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kolor (hex)
                  <span className="block text-xs font-normal text-gray-500">
                    np. #3b2314
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="colorHex"
                    value={newProduct.colorHex || "#ffffff"}
                    onChange={handleNewProductChange}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    name="colorHex"
                    value={newProduct.colorHex}
                    onChange={handleNewProductChange}
                    placeholder="#3b2314"
                    className="flex-1 p-3 border border-gray-300 rounded-md font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupa kolorystyczna
                  <span className="block text-xs font-normal text-gray-500">
                    np. klapki-zamszowe
                  </span>
                </label>
                <input
                  type="text"
                  name="colorGroup"
                  value={newProduct.colorGroup}
                  onChange={handleNewProductChange}
                  placeholder="np. klapki-zamszowe"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {newProduct.colorHex && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div
                  className="w-5 h-5 rounded-full border border-gray-300"
                  style={{ background: newProduct.colorHex }}
                />
                Podgląd koloru
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isAdding}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2 transition"
            >
              {isAdding && (
                <svg
                  className="w-5 h-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              )}
              <span>{isAdding ? "Dodawanie..." : "Dodaj produkt"}</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
            >
              Anuluj
            </button>
          </div>
        </form>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Produkty ({filteredProducts.length})
      </h3>

      {filteredProducts.length === 0 ? (
        <div className="text-gray-600 p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          {showDeleted
            ? "Brak usuniętych produktów w tej kategorii."
            : "Brak produktów w tej kategorii. Dodaj pierwszy!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`relative p-6 bg-white rounded-lg shadow-md transition-all duration-200 ${
                product.deletedAt
                  ? "opacity-70 border-2 border-red-400"
                  : "hover:shadow-xl"
              }`}
            >
              {product.deletedAt && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
                  USUNIĘTY
                </div>
              )}

              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-md w-full h-48 mb-3 flex items-center justify-center text-gray-500 text-sm">
                  Brak zdjęcia
                </div>
              )}

              <h4 className="text-lg font-semibold text-gray-800 line-clamp-2">
                {product.name}
              </h4>

              <div className="text-gray-600 mt-1">{renderPrice(product)}</div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() =>
                    setEditingProduct({
                      ...product,
                      imagesToAdd: [],
                      imagesToRemove: [],
                    })
                  }
                  className="flex-1 px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium transition"
                  disabled={product.deletedAt}
                >
                  Edytuj
                </button>
                {product.deletedAt ? (
                  <button
                    onClick={() => handleRestoreProduct(product.id)}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition"
                  >
                    Przywróć
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setShowDeleteModal({ type: "product", id: product.id })
                    }
                    className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium transition"
                  >
                    Usuń
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductFormModal />
    </div>
  );
}
