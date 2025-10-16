"use client";
import { useState, useCallback, useEffect } from "react";
import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";

export default function Category({
  categories,
  isLoading,
  error,
  fetchCategories,
  onCategoryUpdate,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
    console.log("Selected Category:", category);
  }, []);

  const handleEditCategory = useCallback(
    async (category) => {
      try {
        const res = await fetch(`/api/update-category/${category.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingCategory),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error || "Nie udało się zaktualizować kategorii"
          );
        }
        const updatedCategories = await fetchCategories();
        setEditingCategory(null);
        toast.success("Kategoria zaktualizowana pomyślnie");
        onCategoryUpdate(updatedCategories || categories);
        if (selectedCategory?.id === category.id) {
          const updatedCategory =
            updatedCategories?.find((cat) => cat.id === category.id) ||
            category;
          setSelectedCategory(updatedCategory);
        }
      } catch (err) {
        console.error("Error editing category:", err);
        toast.error(err.message);
      }
    },
    [fetchCategories, onCategoryUpdate, selectedCategory]
  );

  const handleEditProduct = useCallback(
    async (product) => {
      try {
        const res = await fetch(`/api/update-product/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingProduct),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Nie udało się zaktualizować produktu");
        }
        const updatedCategories = await fetchCategories();
        onCategoryUpdate(updatedCategories || categories);
        if (selectedCategory) {
          const findCategoryById = (categories, id) => {
            for (const cat of categories) {
              if (cat.id === id) return cat;
              if (cat.subcategories) {
                const found = cat.subcategories.find((sub) => sub.id === id);
                if (found) return found;
              }
            }
            return null;
          };
          const updatedCategory = findCategoryById(
            updatedCategories,
            selectedCategory.id
          );
          setSelectedCategory(updatedCategory || selectedCategory);
        }
        setEditingProduct(null);
        toast.success("Produkt zaktualizowany pomyślnie");
      } catch (err) {
        console.error("Error editing product:", err);
        toast.error(err.message);
      }
    },
    [fetchCategories, onCategoryUpdate, selectedCategory]
  );

  const handleAddProduct = useCallback(
    async (categoryId, newProduct) => {
      try {
        const res = await fetch("/api/add-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newProduct, categoryId }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Nie udało się dodać produktu");
        }

        // Pobierz zaktualizowane kategorie
        const updatedCategories = await fetchCategories();
        console.log(
          "Full updatedCategories:",
          JSON.stringify(updatedCategories, null, 2)
        );

        // Znajdź kategorię lub podkategorię
        const findCategoryById = (categories, id) => {
          for (const cat of categories) {
            if (cat.id === id) return cat;
            if (cat.subcategories) {
              const found = cat.subcategories.find((sub) => sub.id === id);
              if (found) return found;
            }
          }
          return null;
        };
        const updatedCategory = findCategoryById(updatedCategories, categoryId);
        console.log("Found updatedCategory:", updatedCategory);
        console.log("Products in updatedCategory:", updatedCategory?.products);

        // Aktualizuj stan nadrzędny
        onCategoryUpdate(updatedCategories || categories);

        // Ustaw zaktualizowaną kategorię
        if (updatedCategory) {
          setSelectedCategory(updatedCategory);
        } else {
          console.warn(
            "Updated category not found for categoryId:",
            categoryId
          );
        }

        toast.success("Produkt dodany pomyślnie");
      } catch (err) {
        console.error("Error adding product:", err);
        toast.error(err.message);
      }
    },
    [fetchCategories, onCategoryUpdate]
  );

  const handleAddCategory = useCallback(
    async (e, { name, description }) => {
      e.preventDefault();
      if (!name.trim()) {
        toast.error("Nazwa kategorii jest wymagana");
        return;
      }
      try {
        const res = await fetch("/api/add-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description: description || null,
            parentId: selectedCategory ? selectedCategory.id : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Nie udało się dodać kategorii");
        }
        const updatedCategories = await fetchCategories();
        setNewCategoryName("");
        setNewCategoryDescription("");
        toast.success(
          selectedCategory
            ? "Podkategoria dodana pomyślnie"
            : "Kategoria dodana pomyślnie"
        );
        onCategoryUpdate(updatedCategories || categories);
        if (selectedCategory) {
          const findCategoryById = (categories, id) => {
            for (const cat of categories) {
              if (cat.id === id) return cat;
              if (cat.subcategories) {
                const found = cat.subcategories.find((sub) => sub.id === id);
                if (found) return found;
              }
            }
            return null;
          };
          const updatedCategory = findCategoryById(
            updatedCategories,
            selectedCategory.id
          );
          setSelectedCategory(updatedCategory || selectedCategory);
        }
      } catch (err) {
        console.error("Error adding category:", err);
        toast.error(err.message);
      }
    },
    [fetchCategories, onCategoryUpdate, selectedCategory]
  );

  const handleDelete = useCallback(
    async (type, id) => {
      try {
        const res = await fetch(
          type === "category"
            ? `/api/delete-category/${id}`
            : `/api/delete-product/${id}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error ||
              `Nie udało się usunąć ${
                type === "category" ? "kategorii" : "produktu"
              }`
          );
        }
        const updatedCategories = await fetchCategories();
        onCategoryUpdate(updatedCategories || categories);
        if (type === "category" && selectedCategory?.id === id) {
          setSelectedCategory(null);
        } else if (selectedCategory) {
          const findCategoryById = (categories, id) => {
            for (const cat of categories) {
              if (cat.id === id) return cat;
              if (cat.subcategories) {
                const found = cat.subcategories.find((sub) => sub.id === id);
                if (found) return found;
              }
            }
            return null;
          };
          const updatedCategory = findCategoryById(
            updatedCategories,
            selectedCategory.id
          );
          setSelectedCategory(updatedCategory || selectedCategory);
        }
        setShowDeleteModal(null);
        toast.success(
          data.message ||
            `${
              type === "category" ? "Kategoria" : "Produkt"
            } usunięty pomyślnie`
        );
      } catch (err) {
        console.error("Error deleting:", err);
        toast.error(err.message);
      }
    },
    [fetchCategories, onCategoryUpdate, selectedCategory]
  );

  useEffect(() => {
    console.log("selectedCategory updated:", selectedCategory);
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6 animate-spin text-blue-500"
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
          <span className="text-lg font-medium text-gray-600">
            Ładowanie...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Błąd</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <CategoryForm
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        newCategoryDescription={newCategoryDescription}
        setNewCategoryDescription={setNewCategoryDescription}
        selectedCategory={selectedCategory}
        handleAddCategory={handleAddCategory}
      />
      <CategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        handleCategoryClick={handleCategoryClick}
        handleEditCategory={handleEditCategory}
        handleEditProduct={handleEditProduct}
        setShowDeleteModal={setShowDeleteModal}
        handleAddProduct={handleAddProduct}
      />
      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDelete={handleDelete}
      />
    </div>
  );
}
