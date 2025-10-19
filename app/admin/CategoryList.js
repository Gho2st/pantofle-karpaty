"use client";
import Products from "./Products";
import { useAdmin } from "../context/adminContext";

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

  console.log("Kategorie:", categories);
  console.log("Wybrana kategoria:", selectedCategory);

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
                      placeholder="np. nowa-kategoria"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Obraz kategorii (opcjonalny)
                    </label>
                    {editingCategory?.image &&
                      !editingCategory?.imageToRemove && (
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
                  <div className="flex gap-3">
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
            {(selectedCategory?.id === category.id ||
              category.subcategories?.some(
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
                                  placeholder="np. nowa-podkategoria"
                                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Obraz podkategorii (opcjonalny)
                                </label>
                                {editingCategory?.image &&
                                  !editingCategory?.imageToRemove && (
                                    <div className="mb-2">
                                      <p className="text-gray-600">
                                        Aktualne zdjęcie:
                                      </p>
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
                                            imageToRemove:
                                              editingCategory.image,
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
                              <div className="flex gap-3">
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
