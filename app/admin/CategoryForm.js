// CategoryForm.js
"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAdmin } from "../context/adminContext";
import { generateSlug } from "../utils/slugify"; // Import funkcji z nowego pliku

export default function CategoryForm() {
  const { selectedCategory, handleAddCategory } = useAdmin();

  // Lokalny stan dla formularza dodawania
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  // Automatyczne generowanie sluga
  useEffect(() => {
    if (name) {
      setSlug(generateSlug(name));
    } else {
      setSlug("");
    }
  }, [name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nazwa kategorii jest wymagana");
      return;
    }
    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description || "");
      formData.append("slug", slug || "");
      if (selectedCategory) {
        formData.append("parentId", selectedCategory.id);
      }
      if (image) {
        formData.append("image", image);
      }

      await handleAddCategory(formData); // Przekazujemy tylko formData

      // Resetowanie formularza
      setName("");
      setSlug("");
      setDescription("");
      setImage(null);
      // Resetowanie inputu typu 'file'
      e.target.reset();
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
        {selectedCategory
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="np. nowa-kategoria"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Obraz kategorii (opcjonalny)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            // Klucz do resetowania inputu po wysłaniu
            key={image?.name || "file-input"}
          />
          {image && (
            <p className="text-gray-600 mt-1">
              Wybrano: {image.name}
              <button
                type="button"
                onClick={() => setImage(null)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          <span>{isAdding ? "Dodawanie..." : "Dodaj kategorię"}</span>
        </button>
      </div>
    </form>
  );
}
