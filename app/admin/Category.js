"use client";
import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";
import DeleteModal from "./DeleteModal";
import { useAdmin } from "../context/adminContext";
import { Loader2 } from "lucide-react";

export default function Category() {
  const { isLoading, error } = useAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
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
