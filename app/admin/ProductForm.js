export default function ProductForm({
  newProductName,
  setNewProductName,
  selectedCategory,
  handleAddProduct,
}) {
  return (
    <form onSubmit={handleAddProduct} className="mb-6 flex gap-4">
      <input
        type="text"
        value={newProductName}
        onChange={(e) => setNewProductName(e.target.value)}
        placeholder={`Nowy produkt w ${selectedCategory.name}`}
        className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Dodaj Produkt
      </button>
    </form>
  );
}
