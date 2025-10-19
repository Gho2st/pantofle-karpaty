"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAdmin } from "../context/adminContext";

const generateSlug = (name) => {
  if (!name) return "";
  const polishToAscii = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
    Ą: "A",
    Ć: "C",
    Ę: "E",
    Ł: "L",
    Ń: "N",
    Ó: "O",
    Ś: "S",
    Ź: "Z",
    Ż: "Z",
  };

  return name
    .toLowerCase()
    .trim()
    .replace(/[ąćęłńóśźż]/g, (match) => polishToAscii[match] || match)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export default function Products() {
  const {
    selectedCategory,
    editingProduct,
    setEditingProduct,
    handleEditProduct,
    handleAddProduct,
    setShowDeleteModal,
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

  // Aktualizuj slug automatycznie podczas zmiany nazwy produktu
  useEffect(() => {
    if (newProduct.name && !newProduct.slug) {
      setNewProduct((prev) => ({
        ...prev,
        slug: generateSlug(newProduct.name),
      }));
    }
  }, [newProduct.name]);

  // Obsługa zmian w formularzu dodawania produktu
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || "" : value,
      ...(name === "name" && { slug: generateSlug(value) }), // Aktualizuj slug przy zmianie nazwy
    }));
  };

  // Obsługa wyboru zdjęć dla nowego produktu
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewProductImages((prev) => [...prev, ...files]);
  };

  // Usuwanie zdjęcia dla nowego produktu
  const handleRemoveImage = (index) => {
    setNewProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Dodawanie rozmiaru dla nowego produktu
  const handleAddSize = () => {
    if (!newSize || !newStock || newStock < 0) {
      toast.error("Podaj prawidłowy rozmiar i dodatni stan magazynowy");
      return;
    }
    setNewProduct((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: newSize, stock: parseInt(newStock) }],
    }));
    setNewSize("");
    setNewStock("");
  };

  // Usuwanie rozmiaru dla nowego produktu
  const handleRemoveSize = (sizeToRemove) => {
    setNewProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((item) => item.size !== sizeToRemove),
    }));
  };

  // Submit nowego produktu
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      toast.error("Wybierz kategorię lub podkategorię przed dodaniem produktu");
      return;
    }
    if (!newProduct.name || !newProduct.price || newProduct.price <= 0) {
      toast.error("Nazwa i dodatnia cena produktu są wymagane");
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
      newProductImages.forEach((file) => {
        formData.append("files", file);
      });

      await handleAddProduct(selectedCategory.id, formData);
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
      toast.success("Produkt dodany pomyślnie!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Obsługa zmian w formularzu edycji produktu
  const handleEditProductChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || "" : value,
      ...(name === "name" && { slug: generateSlug(value) }), // Aktualizuj slug przy zmianie nazwy
    }));
  };

  // Obsługa wyboru nowych zdjęć podczas edycji
  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files);
    setEditingProduct((prev) => ({
      ...prev,
      imagesToAdd: [...(prev.imagesToAdd || []), ...files],
    }));
  };

  // Usuwanie zdjęcia podczas edycji
  const handleEditRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      setEditingProduct((prev) => {
        const imageToRemove = prev.images[index];
        return {
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
          imagesToRemove: [...(prev.imagesToRemove || []), imageToRemove],
        };
      });
    } else {
      setEditingProduct((prev) => ({
        ...prev,
        imagesToAdd: prev.imagesToAdd.filter((_, i) => i !== index),
      }));
    }
  };

  // Dodawanie rozmiaru podczas edycji
  const handleEditAddSize = () => {
    if (!newSize || !newStock || newStock < 0) {
      toast.error("Podaj prawidłowy rozmiar i dodatni stan");
      return;
    }
    setEditingProduct((prev) => ({
      ...prev,
      sizes: [
        ...(prev.sizes || []),
        { size: newSize, stock: parseInt(newStock) },
      ],
    }));
    setNewSize("");
    setNewStock("");
  };

  // Usuwanie rozmiaru podczas edycji
  const handleEditRemoveSize = (sizeToRemove) => {
    setEditingProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((item) => item.size !== sizeToRemove),
    }));
  };

  // Lokalna aktualizacja stanu magazynowego (+1 lub -1)
  const handleAdjustStock = (size, adjustment) => {
    const sizeData = editingProduct?.sizes?.find((s) => s.size === size);
    if (adjustment === -1 && (!sizeData || sizeData.stock <= 0)) {
      toast.error("Stan magazynowy nie może być mniejszy niż 0");
      return;
    }

    setEditingProduct((prev) => {
      const updatedSizes = prev.sizes.map((item) =>
        item.size === size ? { ...item, stock: item.stock + adjustment } : item
      );
      return { ...prev, sizes: updatedSizes };
    });
  };

  // Pokazywanie formularza
  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  // Anulowanie formularza dodawania
  const handleCancelAddForm = () => {
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
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Produkty w {selectedCategory ? selectedCategory.name : "Kategorii"}
      </h2>
      {selectedCategory?.description && (
        <p className="text-gray-600 mb-4">{selectedCategory.description}</p>
      )}

      {/* Przycisk do pokazywania formularza */}
      {!showAddForm && (
        <button
          onClick={handleShowAddForm}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          Dodaj nowy produkt
        </button>
      )}

      {/* Formularz dodawania produktu */}
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
                value={newProduct.slug}
                onChange={handleNewProductChange}
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
                value={newProduct.price}
                onChange={handleNewProductChange}
                placeholder="Cena (PLN)"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis produktu (opcjonalny)
              </label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleNewProductChange}
                placeholder="Opis produktu"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                rows="4"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dodatkowy opis (opcjonalny)
              </label>
              <textarea
                name="description2"
                value={newProduct.description2}
                onChange={handleNewProductChange}
                placeholder="Dodatkowy opis produktu"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                rows="4"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dodatkowe informacje (opcjonalne)
              </label>
              <textarea
                name="additionalInfo"
                value={newProduct.additionalInfo}
                onChange={handleNewProductChange}
                placeholder="Dodatkowe informacje (np. materiał, instrukcje pielęgnacji)"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                rows="4"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zdjęcia produktu (opcjonalne, możesz dodać wiele)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                name="files"
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
              {newProductImages.length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {newProductImages.map((file, index) => (
                    <li key={index} className="text-gray-600">
                      {file.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
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
                Rozmiary i stany magazynowe
              </label>
              <div className="flex gap-4 mb-2">
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
                  Dodaj rozmiar
                </button>
              </div>
              <div className="mt-2">
                {newProduct.sizes.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {newProduct.sizes.map((item) => (
                      <li key={item.size} className="text-gray-600">
                        Rozmiar: {item.size}, Stan: {item.stock}
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
                  <p className="text-gray-600">Brak dodanych rozmiarów</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isAdding}
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
              onClick={handleCancelAddForm}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Anuluj
            </button>
          </div>
        </form>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-4">Produkty</h3>
      {!selectedCategory?.products || selectedCategory.products.length === 0 ? (
        <div className="text-gray-600">Brak produktów</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedCategory.products.map((product) => (
            <div
              key={product.id}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              {editingProduct?.id === product.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nazwa produktu
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editingProduct?.name || ""}
                      onChange={handleEditProductChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (opcjonalny)
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={editingProduct?.slug || ""}
                      onChange={handleEditProductChange}
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
                      value={editingProduct?.price || ""}
                      onChange={handleEditProductChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opis produktu (opcjonalny)
                    </label>
                    <textarea
                      name="description"
                      value={editingProduct?.description || ""}
                      onChange={handleEditProductChange}
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
                      value={editingProduct?.description2 || ""}
                      onChange={handleEditProductChange}
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
                      value={editingProduct?.additionalInfo || ""}
                      onChange={handleEditProductChange}
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
                      onChange={handleEditImageChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                    {(editingProduct?.images?.length > 0 ||
                      editingProduct?.imagesToAdd?.length > 0) && (
                      <ul className="mt-2 list-disc pl-5">
                        {editingProduct.images?.map((url, index) => (
                          <li
                            key={`existing-${index}`}
                            className="text-gray-600"
                          >
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
                              onClick={() => handleEditRemoveImage(index, true)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              Usuń
                            </button>
                          </li>
                        ))}
                        {editingProduct.imagesToAdd?.map((file, index) => (
                          <li key={`new-${index}`} className="text-gray-600">
                            {file.name}
                            <button
                              type="button"
                              onClick={() =>
                                handleEditRemoveImage(index, false)
                              }
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
                    <div className="flex gap-4 mb-2">
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
                        onClick={handleEditAddSize}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                      >
                        Dodaj rozmiar
                      </button>
                    </div>
                    <div className="mt-2">
                      {editingProduct?.sizes?.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {editingProduct.sizes.map((item) => (
                            <li
                              key={item.size}
                              className="flex items-center gap-2 text-gray-600"
                            >
                              Rozmiar: {item.size}, Stan: {item.stock}
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item.size, 1)}
                                className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item.size, -1)}
                                className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                                disabled={item.stock <= 0}
                              >
                                −
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditRemoveSize(item.size)}
                                className="ml-2 text-red-500 hover:text-red-700"
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
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      Zapisz
                    </button>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                    >
                      Anuluj
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {product.images && product.images.length > 0 && (
                    <div className="mb-2">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      {product.images.length > 1 && (
                        <p className="text-sm text-gray-500 mt-1">
                          +{product.images.length - 1} dodatkowych zdjęć
                        </p>
                      )}
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-gray-800">
                    {product.name}
                  </h4>
                  <p className="text-gray-600">
                    Slug: {product.slug || "Brak slug"}
                  </p>
                  <p className="text-gray-600">
                    Cena:{" "}
                    {product.price != null
                      ? product.price.toFixed(2)
                      : "Brak ceny"}{" "}
                    PLN
                  </p>
                  <p className="text-gray-600 line-clamp-2">
                    {product.description || "Brak opisu"}
                  </p>
                  <p className="text-gray-600 line-clamp-2">
                    {product.description2 || "Brak dodatkowego opisu"}
                  </p>
                  <p className="text-gray-600 line-clamp-2">
                    {product.additionalInfo || "Brak dodatkowych informacji"}
                  </p>
                  <div className="text-gray-600">
                    <p>Rozmiary i stany:</p>
                    {product.sizes?.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {product.sizes.map((item) => (
                          <li key={item.size}>
                            Rozmiar: {item.size}, Stan: {item.stock}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Brak rozmiarów</p>
                    )}
                  </div>
                  {product.images && product.images.length > 0 && (
                    <div className="text-gray-600 text-sm">
                      <details>
                        <summary className="cursor-pointer text-blue-500 hover:underline">
                          Zobacz wszystkie zdjęcia
                        </summary>
                        <ul className="list-disc pl-5 mt-1">
                          {product.images.map((url, index) => (
                            <li key={index}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Zdjęcie {index + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() =>
                        setEditingProduct({
                          id: product.id,
                          name: product.name,
                          slug: product.slug || "",
                          price: product.price ?? "",
                          description: product.description ?? "",
                          description2: product.description2 ?? "",
                          additionalInfo: product.additionalInfo ?? "",
                          sizes: product.sizes ?? [],
                          images: product.images ?? [],
                          imagesToAdd: [],
                          imagesToRemove: [],
                        })
                      }
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-200"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() =>
                        setShowDeleteModal({
                          type: "product",
                          id: product.id,
                        })
                      }
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
