// CategoryList.js
"use client";
import Products from "./Products";
import { useAdmin } from "../context/adminContext";
import CategoryItemForm from "./CategoryItemForm"; // Import nowego komponentu

export default function CategoryList() {
  const {
    categories,
    selectedCategory,
    editingCategory,
    setEditingCategory,
    handleCategoryClick,
    handleEditCategory,
    setShowDeleteModal,
  } = useAdmin();

  const getBreadcrumbs = () => {
    if (!selectedCategory) return "Kategorie";

    const parentCategory = categories.find((cat) =>
      cat.subcategories?.some((sub) => sub.id === selectedCategory.id)
    );

    if (parentCategory) {
      return `${parentCategory.name} > ${selectedCategory.name}`;
    }

    return selectedCategory.name;
  };

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
            {/* Poprawiony wrapper dla responsywności */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              {editingCategory?.id === category.id ? (
                // Użycie nowego komponentu
                <CategoryItemForm
                  editingCategory={editingCategory}
                  setEditingCategory={setEditingCategory}
                  onSave={() => handleEditCategory(category)}
                  onCancel={() => setEditingCategory(null)}
                  itemType="kategorii"
                />
              ) : (
                <>
                  <div className="flex-1 flex items-center gap-4">
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <div>
                      <span
                        className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition duration-200"
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category.name}
                      </span>
                      {category.slug && (
                        <p className="text-gray-600 text-sm mt-1">
                          Slug: {category.slug}
                        </p>
                      )}
                      {category.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Poprawiony wrapper przycisków dla responsywności */}
                  <div className="flex flex-row gap-3 self-end sm:self-center">
                    <button
                      onClick={() =>
                        setEditingCategory({
                          id: category.id,
                          name: category.name,
                          description: category.description || "",
                          slug: category.slug || "",
                          image: category.image || null,
                          newImage: null,
                          imageToRemove: null,
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

            {/* Sekcja podkategorii */}
            {(selectedCategory?.id === category.id ||
              category.subcategories?.some(
                (sub) => sub.id === selectedCategory?.id
              )) && (
              <div className="ml-0 sm:ml-6 mt-6">
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
                        {/* Poprawiony wrapper dla responsywności */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          {editingCategory?.id === sub.id ? (
                            // Użycie nowego komponentu
                            <CategoryItemForm
                              editingCategory={editingCategory}
                              setEditingCategory={setEditingCategory}
                              onSave={() => handleEditCategory(sub)}
                              onCancel={() => setEditingCategory(null)}
                              itemType="podkategorii"
                            />
                          ) : (
                            <>
                              <div className="flex-1 flex items-center gap-4">
                                {sub.image && (
                                  <img
                                    src={sub.image}
                                    alt={sub.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                )}
                                <div>
                                  <span
                                    className="text-md font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition duration-200"
                                    onClick={() => handleCategoryClick(sub)}
                                  >
                                    {sub.name}
                                  </span>
                                  {sub.slug && (
                                    <p className="text-gray-600 text-sm mt-1">
                                      Slug: {sub.slug}
                                    </p>
                                  )}
                                  {sub.description && (
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                      {sub.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {/* Poprawiony wrapper przycisków dla responsywności */}
                              <div className="flex flex-row gap-3 self-end sm:self-center">
                                <button
                                  onClick={() =>
                                    setEditingCategory({
                                      id: sub.id,
                                      name: sub.name,
                                      description: sub.description || "",
                                      slug: sub.slug || "",
                                      image: sub.image || null,
                                      newImage: null,
                                      imageToRemove: null,
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

            {/* Sekcja produktów (logika bez zmian) */}
            {selectedCategory?.id === category.id ||
            category.subcategories?.some(
              (sub) => sub.id === selectedCategory?.id
            ) ? (
              <Products products={selectedCategory?.products || []} />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
