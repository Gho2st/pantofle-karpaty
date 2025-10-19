"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAdmin } from "../context/adminContext";

// Funkcja do generowania sluga z nazwy kategorii
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ź/g, "z")
    .replace(/ż/g, "z")
    .replace(/[^a-z0-9\s-]/g, "") // Usuwa znaki specjalne
    .replace(/\s+/g, "-") // Zamienia spacje na myślniki
    .replace(/-+/g, "-"); // Usuwa wielokrotne myślniki
};

export default function CategoryForm() {
  const {
    selectedCategory,
    newCategoryName,
    setNewCategoryName,
    newCategoryDescription,
    setNewCategoryDescription,
    editingCategory,
    setEditingCategory,
    handleAddCategory,
    handleEditCategory,
  } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);

  // Automatyczne generowanie sluga przy zmianie nazwy kategorii
  useEffect(() => {
    if (newCategoryName) {
      const generatedSlug = generateSlug(newCategoryName);
      setNewCategorySlug(generatedSlug);
    } else {
      setNewCategorySlug("");
    }
  }, [newCategoryName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Nazwa kategorii jest wymagana");
      return;
    }
    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.append("name", newCategoryName);
      formData.append("description", newCategoryDescription || "");
      formData.append("slug", newCategorySlug || "");
      if (selectedCategory) {
        formData.append("parentId", selectedCategory.id);
      }
      if (newCategoryImage) {
        formData.append("image", newCategoryImage);
      }

      console.log("Submitting category:", {
        name: newCategoryName,
        description: newCategoryDescription,
        slug: newCategorySlug,
        image: newCategoryImage?.name,
        parentId: selectedCategory?.id,
      });

      if (editingCategory) {
        await handleEditCategory(editingCategory);
      } else {
        await handleAddCategory(e, formData);
      }
      setNewCategorySlug("");
      setNewCategoryImage(null);
      setNewCategoryName("");
      setNewCategoryDescription("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 p-6 bg-gray-50 rounded-lg shadow-md"
      encType="multipart/form-data"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {editingCategory
          ? `Edytuj kategorię ${editingCategory.name}`
          : selectedCategory
          ? `Dodaj podkategorię dla ${selectedCategory.name}`
          : "Dodaj nową kategorię"}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa kategorii
          </label>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder={
              selectedCategory
                ? `Nowa podkategoria dla ${selectedCategory.name}`
                : "Nazwa nowej kategorii"
            }
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (automatycznie generowany, można edytować)
          </label>
          <input
            type="text"
            value={newCategorySlug}
            onChange={(e) => setNewCategorySlug(e.target.value)}
            placeholder="np. nowa-kategoria"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Obraz kategorii (opcjonalny)
          </label>
          {editingCategory?.image && !editingCategory?.imageToRemove && (
            <div className="mb-2">
              <p className="text-gray-600">Aktualne zdjęcie:</p>
              <a
                href={editingCategory.image}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Zobacz zdjęcie
              </a>
              <button
                type="button"
                onClick={() =>
                  setEditingCategory({
                    ...editingCategory,
                    imageToRemove: editingCategory.image,
                    image: null,
                  })
                }
                className="ml-2 text-red-500 hover:text-red-700"
              >
                Usuń zdjęcie
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewCategoryImage(e.target.files[0])}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          {(editingCategory?.newImage || newCategoryImage) && (
            <p className="text-gray-600 mt-1">
              Wybrano: {(editingCategory?.newImage || newCategoryImage)?.name}
              <button
                type="button"
                onClick={() => {
                  if (editingCategory) {
                    setEditingCategory({ ...editingCategory, newImage: null });
                  }
                  setNewCategoryImage(null);
                }}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                Usuń
              </button>
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis kategorii (opcjonalny)
          </label>
          <textarea
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            placeholder="Wpisz opis kategorii, np. 'Pantofle damskie to idealne...'"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            rows="4"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
          <span>
            {isAdding
              ? "Zapisywanie..."
              : editingCategory
              ? "Zapisz zmiany"
              : "Dodaj kategorię"}
          </span>
        </button>
      </div>
    </form>
  );
}
