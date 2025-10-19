"use client";
import { useState } from "react";
import { useAdmin } from "../context/adminContext";

export default function DeleteModal() {
  const { showDeleteModal, setShowDeleteModal, handleDelete } = useAdmin();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDelete(showDeleteModal.type, showDeleteModal.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    showDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Potwierdź Usunięcie
          </h3>
          <p className="text-gray-600 mb-6">
            Czy na pewno chcesz usunąć{" "}
            {showDeleteModal.type === "category" ? "kategorię" : "produkt"}?
            {showDeleteModal.type === "category" &&
              " (Wszystkie podkategorie zostaną również usunięte, jeśli nie zawierają produktów)"}
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowDeleteModal(null)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
              disabled={isDeleting}
            >
              Anuluj
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isDeleting}
            >
              {isDeleting && (
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
              <span>{isDeleting ? "Usuwanie..." : "Usuń"}</span>
            </button>
          </div>
        </div>
      </div>
    )
  );
}
