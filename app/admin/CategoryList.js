"use client";
import Products from "./Products";

export default function CategoryList({
  categories,
  selectedCategory,
  editingCategory,
  setEditingCategory,
  editingProduct,
  setEditingProduct,
  handleCategoryClick,
  handleEditCategory,
  handleEditProduct,
  setShowDeleteModal,
  handleAddProduct,
}) {
  const getBreadcrumbs = () => {
    if (!selectedCategory) return "Kategorie";

    // Uproszczona logika dla maksymalnie dwóch poziomów (Kategoria > Podkategoria)
    const parentCategory = categories.find((cat) =>
      cat.subcategories?.some((sub) => sub.id === selectedCategory.id)
    );

    if (parentCategory) {
      return `${parentCategory.name} > ${selectedCategory.name}`;
    }

    return selectedCategory.name;
  };

  console.log("Categories:", categories); // Debug: log wszystkich kategorii
  console.log("Selected Category:", selectedCategory); // Debug: log wybranej kategorii

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{getBreadcrumbs()}</h2>
      </div>
      <ul className="space-y-4">
        {categories.map((category) => (
          <li
            key={category.id}
            className={`p-6 bg-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg ${
              selectedCategory?.id === category.id
                ? "border-l-4 border-blue-500"
                : ""
            }`}
          >
            <div className="flex justify-between items-center">
              {editingCategory?.id === category.id ? (
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nazwa kategorii
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
                      placeholder="Nazwa kategorii"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opis kategorii (opcjonalny)
                    </label>
                    <textarea
                      value={editingCategory?.description || ""}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          description: e.target.value,
                        })
                      }
                      placeholder="Opis kategorii"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                      rows="4"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      Zapisz
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                    >
                      Anuluj
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <span
                      className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition duration-200"
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category.name}
                    </span>
                    {category.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setEditingCategory({
                          id: category.id,
                          name: category.name,
                          description: category.description || "",
                        })
                      }
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-200"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() =>
                        setShowDeleteModal({
                          type: "category",
                          id: category.id,
                        })
                      }
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                    >
                      Usuń
                    </button>
                  </div>
                </>
              )}
            </div>
            {(selectedCategory?.id === category.id ||
              category.subcategories.some(
                (sub) => sub.id === selectedCategory?.id
              )) && (
              <div className="ml-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Podkategorie
                </h3>
                {!category.subcategories ||
                category.subcategories.length === 0 ? (
                  <div className="text-gray-600">Brak podkategorii</div>
                ) : (
                  <ul className="space-y-3">
                    {category.subcategories.map((sub) => (
                      <li
                        key={sub.id}
                        className={`p-4 bg-gray-50 rounded-md transition-all duration-200 hover:shadow-sm ${
                          selectedCategory?.id === sub.id
                            ? "border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          {editingCategory?.id === sub.id ? (
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Nazwa podkategorii
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
                                  placeholder="Nazwa podkategorii"
                                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Opis podkategorii (opcjonalny)
                                </label>
                                <textarea
                                  value={editingCategory?.description || ""}
                                  onChange={(e) =>
                                    setEditingCategory({
                                      ...editingCategory,
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Opis podkategorii"
                                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                  rows="4"
                                />
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleEditCategory(sub)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                                >
                                  Zapisz
                                </button>
                                <button
                                  onClick={() => setEditingCategory(null)}
                                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                                >
                                  Anuluj
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <span
                                  className="text-md font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCategoryClick(sub);
                                  }}
                                >
                                  {sub.name}
                                </span>
                                {sub.description && (
                                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                    {sub.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() =>
                                    setEditingCategory({
                                      id: sub.id,
                                      name: sub.name,
                                      description: sub.description || "",
                                    })
                                  }
                                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-200"
                                >
                                  Edytuj
                                </button>
                                <button
                                  onClick={() =>
                                    setShowDeleteModal({
                                      type: "category",
                                      id: sub.id,
                                    })
                                  }
                                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                                >
                                  Usuń
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {selectedCategory?.id === category.id ||
            category.subcategories.some(
              (sub) => sub.id === selectedCategory?.id
            ) ? (
              <Products
                products={selectedCategory?.products || []}
                selectedCategory={selectedCategory}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                handleEditProduct={handleEditProduct}
                handleAddProduct={handleAddProduct}
                setShowDeleteModal={setShowDeleteModal}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
