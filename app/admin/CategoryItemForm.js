"use client";

export default function CategoryItemForm({
  editingCategory,
  setEditingCategory,
  onSave,
  onCancel,
  itemType = "kategorii", // "kategorii" lub "podkategorii"
}) {
  return (
    <div className="flex-1 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nazwa {itemType}
        </label>
        <input
          type="text"
          value={editingCategory?.name || ""}
          onChange={(e) =>
            setEditingCategory({
              ...editingCategory,
              name: e.target.value,
            })
          }
          placeholder={`Nazwa ${itemType}`}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug (opcjonalny)
        </label>
        <input
          type="text"
          value={editingCategory?.slug || ""}
          onChange={(e) =>
            setEditingCategory({
              ...editingCategory,
              slug: e.target.value,
            })
          }
          placeholder={`np. nowa-${itemType}`}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Obraz {itemType} (opcjonalny)
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
          onChange={(e) =>
            setEditingCategory({
              ...editingCategory,
              newImage: e.target.files[0],
            })
          }
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
        {editingCategory?.newImage && (
          <p className="text-gray-600 mt-1">
            Wybrano: {editingCategory.newImage.name}
            <button
              type="button"
              onClick={() =>
                setEditingCategory({
                  ...editingCategory,
                  newImage: null,
                })
              }
              className="ml-2 text-red-500 hover:text-red-700"
            >
              Usuń
            </button>
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Opis {itemType} (opcjonalny)
        </label>
        <textarea
          value={editingCategory?.description || ""}
          onChange={(e) =>
            setEditingCategory({
              ...editingCategory,
              description: e.target.value,
            })
          }
          placeholder={`Opis ${itemType}`}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          rows="4"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          Zapisz
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
        >
          Anuluj
        </button>
      </div>
    </div>
  );
}
