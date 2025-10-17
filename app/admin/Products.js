"use client";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Products({
  products,
  selectedCategory,
  editingProduct,
  setEditingProduct,
  handleEditProduct,
  handleAddProduct,
  setShowDeleteModal,
}) {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    description2: "",
    additionalInfo: "",
    sizes: [], // Inicjalizujemy jako pustą tablicę
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("");
  const [stockUpdate, setStockUpdate] = useState({
    productId: null,
    size: "",
    stock: "",
  });

  // Obsługa zmian w formularzu dodawania produktu
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || "" : value,
    }));
  };

  // Dodawanie nowego rozmiaru do newProduct.sizes
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

  // Usuwanie rozmiaru z newProduct.sizes
  const handleRemoveSize = (sizeToRemove) => {
    setNewProduct((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((item) => item.size !== sizeToRemove),
    }));
  };

  // Obsługa wysyłania nowego produktu
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
      await handleAddProduct(selectedCategory.id, newProduct);
      setNewProduct({
        name: "",
        price: "",
        description: "",
        description2: "",
        additionalInfo: "",
        sizes: [],
      });
      toast.success("Produkt dodany pomyślnie!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Obsługa aktualizacji stanu magazynowego
  const handleUpdateStock = async (productId) => {
    if (!stockUpdate.size || stockUpdate.stock < 0) {
      toast.error("Podaj prawidłowy rozmiar i dodatni stan magazynowy");
      return;
    }
    try {
      const res = await fetch("/api/update-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          size: stockUpdate.size,
          newStock: parseInt(stockUpdate.stock),
        }),
      });
      if (!res.ok) {
        throw new Error("Nie udało się zaktualizować stanu");
      }
      toast.success(`Stan dla rozmiaru ${stockUpdate.size} zaktualizowany!`);
      setStockUpdate({ productId: null, size: "", stock: "" });
      // Odśwież listę produktów (możesz użyć np. SWR lub refetch)
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Produkty w {selectedCategory ? selectedCategory.name : "Kategorii"}
      </h2>
      {selectedCategory?.description && (
        <p className="text-gray-600 mb-4">{selectedCategory.description}</p>
      )}
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
        <button
          type="submit"
          className="mt-4 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
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
      </form>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">Produkty</h3>
      {!products || products.length === 0 ? (
        <div className="text-gray-600">Brak produktów</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
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
                      value={editingProduct?.name || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cena (PLN)
                    </label>
                    <input
                      type="number"
                      value={editingProduct?.price || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: parseFloat(e.target.value) || "",
                        })
                      }
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
                      value={editingProduct?.description || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dodatkowy opis (opcjonalny)
                    </label>
                    <textarea
                      value={editingProduct?.description2 || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description2: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dodatkowe informacje (opcjonalne)
                    </label>
                    <textarea
                      value={editingProduct?.additionalInfo || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          additionalInfo: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                      rows="4"
                    />
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
                        onClick={() => {
                          if (!newSize || !newStock || newStock < 0) {
                            toast.error(
                              "Podaj prawidłowy rozmiar i dodatni stan"
                            );
                            return;
                          }
                          setEditingProduct({
                            ...editingProduct,
                            sizes: [
                              ...(editingProduct.sizes || []),
                              { size: newSize, stock: parseInt(newStock) },
                            ],
                          });
                          setNewSize("");
                          setNewStock("");
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                      >
                        Dodaj rozmiar
                      </button>
                    </div>
                    <div className="mt-2">
                      {editingProduct?.sizes?.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {editingProduct.sizes.map((item) => (
                            <li key={item.size} className="text-gray-600">
                              Rozmiar: {item.size}, Stan: {item.stock}
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    sizes: editingProduct.sizes.filter(
                                      (s) => s.size !== item.size
                                    ),
                                  })
                                }
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
                  <h4 className="text-lg font-semibold text-gray-800">
                    {product.name}
                  </h4>
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

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() =>
                        setEditingProduct({
                          id: product.id,
                          name: product.name,
                          price: product.price ?? "",
                          description: product.description ?? "",
                          description2: product.description2 ?? "",
                          additionalInfo: product.additionalInfo ?? "",
                          sizes: product.sizes ?? [],
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
