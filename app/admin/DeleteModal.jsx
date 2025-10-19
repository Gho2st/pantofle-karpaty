"use client";
import { useAdmin } from "../context/adminContext";
import { AlertTriangle, X } from "lucide-react";

export default function DeleteModal() {
  const { showDeleteModal, setShowDeleteModal, handleDelete } = useAdmin();

  if (!showDeleteModal) return null;

  const handleConfirmDelete = () => {
    handleDelete(showDeleteModal.type, showDeleteModal.id);
    setShowDeleteModal(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-bold text-gray-800">
            Potwierdź usuwanie
          </h3>
        </div>
        <p className="text-gray-600 mb-6">
          Czy na pewno chcesz usunąć ten element? Operacja jest nieodwracalna.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(null)}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Anuluj
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
}
