export default function CategoryNavigation({
  selectedCategory,
  parentCategoryId,
  handleBackToParent,
  fetchCategories,
  setSelectedCategory,
}) {
  return (
    selectedCategory && (
      <div className="mb-4 flex gap-4">
        <button
          onClick={handleBackToParent}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
        >
          {parentCategoryId
            ? "Wróć do kategorii nadrzędnej"
            : "Wróć do głównych kategorii"}
        </button>
        {!parentCategoryId && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              fetchCategories();
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Wróć do głównych kategorii
          </button>
        )}
      </div>
    )
  );
}
