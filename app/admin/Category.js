"use client";
import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";
import DeleteModal from "./DeleteModal";
import { useAdmin } from "../context/adminContext";

export default function Category() {
  const { isLoading, error, selectedCategory } = useAdmin();

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
      <CategoryForm />
      <CategoryList />
      <DeleteModal />
    </div>
  );
}
