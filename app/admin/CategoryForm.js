"use client";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CategoryForm({
  newCategoryName,
  setNewCategoryName,
  newCategoryDescription,
  setNewCategoryDescription,
  selectedCategory,
  handleAddCategory,
}) {
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Nazwa kategorii jest wymagana");
      return;
    }
    setIsAdding(true);
    try {
      console.log("Submitting category:", {
        name: newCategoryName,
        description: newCategoryDescription,
      }); // Debug: log danych formularza
      await handleAddCategory(e, {
        name: newCategoryName,
        description: newCategoryDescription,
      });
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
          <span>{isAdding ? "Dodawanie..." : "Dodaj kategorię"}</span>
        </button>
      </div>
    </form>
  );
}
