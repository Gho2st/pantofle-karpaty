// components/admin/Products.jsx
"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAdmin } from "../context/adminContext";
import { generateSlug } from "../utils/slugify";
import ProductFormModal from "./ProductFormModal";

export default function Products() {
  const {
    selectedCategory,
    setSelectedCategory,
    setEditingProduct,
    handleAddProduct,
    setShowDeleteModal,
    fetchCategories,
    handleCategoryUpdate,
  } = useAdmin();

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    price: "",
    description: "",
    description2: "",
    additionalInfo: "",
    sizes: [],
  });
  const [newProductImages, setNewProductImages] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false); // FILTR

  // Auto-slug
  useEffect(() => {
    if (newProduct.name) {
      setNewProduct((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [newProduct.name]);

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || "" : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewProductImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index) => {
    setNewProductImages((prev) => prev.filter((_, i) => i !== index));
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

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return toast.error("Wybierz kategorię");
    if (!newProduct.name || !newProduct.price)
      return toast.error("Nazwa i cena wymagane");

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
      newProductImages.forEach((file) => formData.append("files", file));

      await handleAddProduct(selectedCategory.id, formData);

      // Reset formularza
      setNewProduct({
        name: "",
        slug: "",
        price: "",
        description: "",
        description2: "",
        additionalInfo: "",
        sizes: [],
      });
      setNewProductImages([]);
      setShowAddForm(false);
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
      handleCategoryUpdate(updatedCategories);

      if (selectedCategory) {
        const findCategoryById = (cats, id) => {
          for (const cat of cats) {
            if (cat.id === id) return cat;
            if (cat.subcategories) {
              const found = cat.subcategories.find((sub) => sub.id === id);
              if (found) return found;
            }
          }
          return null;
        };
        const newSelected = findCategoryById(
          updatedCategories,
          selectedCategory.id
        );
        if (newSelected) setSelectedCategory(newSelected);
      }

      toast.success("Produkt przywrócony!");
    } catch (err) {
      toast.error(err.message || "Błąd przywracania");
    }
  };

  // === FILTROWANIE PRODUKTÓW ===
  const filteredProducts =
    selectedCategory?.products?.filter((p) =>
      showDeleted ? true : !p.deletedAt
    ) || [];

  // === KOMPONENT CENY Z PROMOCJĄ ===
  const renderPrice = (product) => {
    const hasPromo =
      product.promoPrice != null && product.promoPrice < product.price;
    const displayPrice = hasPromo ? product.promoPrice : product.price;
    const hasLowestPrice =
      product.lowestPrice != null && product.lowestPrice < displayPrice;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Przekreślona cena */}
          {hasPromo && (
            <span className="text-sm line-through text-gray-500">
              {product.price.toFixed(2)} PLN
            </span>
          )}

          {/* Aktualna cena */}
          <span
            className={`font-semibold ${
              hasPromo ? "text-red-600" : "text-gray-800"
            }`}
          >
            {displayPrice.toFixed(2)} PLN
          </span>

          {/* Badge PROMOCJA */}
          {hasPromo && (
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">
              PROMOCJA
            </span>
          )}
        </div>

        {/* Najniższa cena z 30 dni */}
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
      {/* NAGŁÓWEK + FILTR */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Produkty w {selectedCategory?.name || "Kategorii"}
        </h2>

        {/* <button
          onClick={() => setShowDeleted((prev) => !prev)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            showDeleted
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {showDeleted ? "Ukryj usunięte" : "Pokaż usunięte"}
        </button> */}
      </div>

      {/* PRZYCISK DODAJ */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Dodaj nowy produkt
        </button>
      )}

      {/* FORMULARZ DODAWANIA */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zdjęcia (wiele)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              {newProductImages.length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {newProductImages.map((file, i) => (
                    <li key={i} className="text-gray-600">
                      {file.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="ml-2 text-red-500"
                      >
                        Usuń
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Dodaj
                </button>
              </div>
              {newProduct.sizes.length > 0 ? (
                <ul className="list-disc pl-5">
                  {newProduct.sizes.map((item) => (
                    <li key={item.size} className="text-gray-600">
                      {item.size}: {item.stock}
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(item.size)}
                        className="ml-2 text-red-500"
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
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={isAdding}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
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
              onClick={() => {
                setNewProduct({
                  name: "",
                  slug: "",
                  price: "",
                  description: "",
                  description2: "",
                  additionalInfo: "",
                  sizes: [],
                });
                setNewProductImages([]);
                setShowAddForm(false);
              }}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Anuluj
            </button>
          </div>
        </form>
      )}

      {/* LISTA PRODUKTÓW */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Produkty</h3>

      {filteredProducts.length === 0 ? (
        <div className="text-gray-600">
          {showDeleted ? "Brak usuniętych produktów" : "Brak produktów"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`p-6 bg-white rounded-lg shadow-md transition-all duration-200 ${
                product.deletedAt
                  ? "opacity-60 border-2 border-red-300"
                  : "hover:shadow-lg"
              }`}
            >
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-2"
                />
              )}
              <h4 className="text-lg font-semibold text-gray-800">
                {product.name}
                {product.deletedAt && (
                  <span className="ml-2 text-sm text-red-600">[USUNIĘTY]</span>
                )}
              </h4>

              {/* CENA Z PROMOCJĄ */}
              <div className="text-gray-600 mt-1">{renderPrice(product)}</div>

              {/* AKCJE */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() =>
                    setEditingProduct({
                      ...product,
                      imagesToAdd: [],
                      imagesToRemove: [],
                    })
                  }
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                  Edytuj
                </button>
                {product.deletedAt ? (
                  <button
                    onClick={() => handleRestoreProduct(product.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Przywróć
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setShowDeleteModal({ type: "product", id: product.id })
                    }
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Usuń
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDYCJI */}
      <ProductFormModal />
    </div>
  );
}
