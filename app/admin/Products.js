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
      toast.error(err.message);
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

      // 1. Pobierz nowe dane
      const updatedCategories = await fetchCategories();
      handleCategoryUpdate(updatedCategories);

      // 2. ZAKTUALIZUJ selectedCategory (KLUCZOWE!)
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
        if (newSelected) {
          setSelectedCategory(newSelected); // To odświeży UI!
        }
      }

      toast.success("Produkt przywrócony!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Produkty w {selectedCategory?.name || "Kategorii"}
      </h2>

      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Dodaj nowy produkt
        </button>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAddProductSubmit}
          className="mb-6 p-6 bg-gray-50 rounded-lg shadow-md"
        >
          {/* Twój formularz – bez zmian */}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={isAdding}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {isAdding ? "Dodawanie..." : "Dodaj produkt"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Anuluj
            </button>
          </div>
        </form>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-4">Produkty</h3>

      {!selectedCategory?.products?.length ? (
        <div className="text-gray-600">Brak produktów</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedCategory.products.map((product) => (
            <div
              key={product.id}
              className={`p-6 bg-white rounded-lg shadow-md transition-all ${
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
              <p className="text-gray-600">
                Cena: {product.price?.toFixed(2)} PLN
              </p>

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

      <ProductFormModal />
    </div>
  );
}
