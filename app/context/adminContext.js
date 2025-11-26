"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useCart } from "./cartContext";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const { data: session, status } = useSession();
  const { fetchCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  // === Pomocnicza funkcja do wyszukiwania kategorii ===
  const findCategoryById = useCallback((categoriesList, id) => {
    for (const cat of categoriesList) {
      if (cat.id === id) return cat;
      if (cat.subcategories) {
        const found = cat.subcategories.find((sub) => sub.id === id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // === Pobieranie kategorii ===
  const fetchCategories = useCallback(async (parentId = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/get-category${parentId ? `?parentId=${parentId}` : ""}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Nie udało się pobrać kategorii");
      const { categories: data } = await res.json();
      setCategories(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // === Aktualizacja lokalnych kategorii po zmianie ===
  const updateCategoriesLocally = useCallback((updater) => {
    setCategories((prev) => {
      const newCats = typeof updater === "function" ? updater(prev) : updater;
      toast.success("Operacja zakończona pomyślnie!");
      window.dispatchEvent(new Event("categoriesUpdated"));
      return newCats;
    });
  }, []);

  // === Obsługa kliknięcia kategorii ===
  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // === Uniwersalna funkcja do aktualizacji selectedCategory po zmianach ===
  const refreshSelectedCategory = useCallback(
    (newCategories) => {
      if (!selectedCategory) return;
      const updated = findCategoryById(newCategories, selectedCategory.id);
      if (updated) setSelectedCategory(updated);
    },
    [selectedCategory, findCategoryById]
  );

  // === Edycja kategorii ===
  const handleEditCategory = useCallback(
    async (category) => {
      try {
        const formData = new FormData();
        formData.append("name", editingCategory.name);
        formData.append("description", editingCategory.description || "");
        formData.append("slug", editingCategory.slug || "");
        if (editingCategory.imageToRemove)
          formData.append("imageToRemove", editingCategory.imageToRemove);
        if (editingCategory.newImage instanceof File)
          formData.append("image", editingCategory.newImage);

        const res = await fetch(`/api/update-category/${category.id}`, {
          method: "PUT",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Błąd aktualizacji kategorii");

        const updated = await fetchCategories();
        refreshSelectedCategory(updated);
        setEditingCategory(null);
        setNewCategoryName("");
        setNewCategoryDescription("");
        window.dispatchEvent(new Event("menu-updated"));
      } catch (err) {
        toast.error(err.message);
      }
    },
    [editingCategory, fetchCategories, refreshSelectedCategory]
  );

  // === Edycja produktu ===
  const handleEditProduct = useCallback(
    async (productData) => {
      if (!productData?.id) {
        toast.error("Brak ID produktu");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("name", productData.name || "");
        formData.append("slug", productData.slug || "");
        formData.append("price", productData.price?.toString() || "");
        if (productData.promoPrice != null)
          formData.append("promoPrice", productData.promoPrice.toString());
        if (productData.promoStartDate)
          formData.append("promoStartDate", productData.promoStartDate);
        if (productData.promoEndDate)
          formData.append("promoEndDate", productData.promoEndDate);
        formData.append("description", productData.description || "");
        formData.append("description2", productData.description2 || "");
        formData.append("additionalInfo", productData.additionalInfo || "");
        formData.append("categoryId", parseInt(productData.categoryId, 10));

        if (
          productData.sortOrder !== null &&
          productData.sortOrder !== undefined &&
          productData.sortOrder !== ""
        ) {
          formData.append("sortOrder", productData.sortOrder.toString());
        }

        if (Array.isArray(productData.sizes))
          formData.append("sizes", JSON.stringify(productData.sizes));

        if (
          Array.isArray(productData.imagesToRemove) &&
          productData.imagesToRemove.length
        )
          formData.append(
            "imagesToRemove",
            JSON.stringify(productData.imagesToRemove)
          );

        if (Array.isArray(productData.imagesToAdd))
          productData.imagesToAdd.forEach((file) =>
            formData.append("imagesToAdd", file)
          );

        const res = await fetch(`/api/update-product/${productData.id}`, {
          method: "PUT",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Błąd aktualizacji produktu");

        const updated = await fetchCategories();
        refreshSelectedCategory(updated);
        setEditingProduct(null);
        await fetchCart();
      } catch (err) {
        toast.error(err.message);
      }
    },
    [fetchCategories, refreshSelectedCategory, fetchCart]
  );

  // === Dodawanie produktu ===
  const handleAddProduct = useCallback(
    async (categoryId, formData) => {
      try {
        const res = await fetch("/api/add-product", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Błąd dodawania produktu");

        const updated = await fetchCategories();
        const newCategory = findCategoryById(updated, categoryId);
        if (newCategory) setSelectedCategory(newCategory);
        await fetchCart();
      } catch (err) {
        toast.error(err.message);
      }
    },
    [fetchCategories, findCategoryById, fetchCart]
  );

  // === Dodawanie kategorii ===
  const handleAddCategory = useCallback(
    async (formData) => {
      try {
        const res = await fetch("/api/add-category", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Błąd dodawania kategorii");

        const updated = await fetchCategories();
        if (selectedCategory) {
          const refreshed = findCategoryById(updated, selectedCategory.id);
          if (refreshed) setSelectedCategory(refreshed);
        }
        setNewCategoryName("");
        setNewCategoryDescription("");
        window.dispatchEvent(new Event("menu-updated"));
      } catch (err) {
        toast.error(err.message);
      }
    },
    [fetchCategories, selectedCategory, findCategoryById]
  );

  // === Usuwanie ===
  const handleDelete = useCallback(
    async (type, id) => {
      try {
        const endpoint =
          type === "category"
            ? `/api/delete-category/${id}`
            : `/api/delete-product/${id}`;
        const res = await fetch(endpoint, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.error ||
              `Błąd usuwania ${type === "category" ? "kategorii" : "produktu"}`
          );

        const updated = await fetchCategories();
        if (type === "category" && selectedCategory?.id === id) {
          setSelectedCategory(null);
        } else {
          refreshSelectedCategory(updated);
        }
        setShowDeleteModal(null);
        if (type === "product") await fetchCart();
        //  TOAST PO USUNIĘCIU
        toast.success(
          type === "category" ? "Kategoria usunięta!" : "Produkt usunięty!"
        );
        window.dispatchEvent(new Event("menu-updated"));
      } catch (err) {
        toast.error(err.message);
      }
    },
    [fetchCategories, selectedCategory, refreshSelectedCategory, fetchCart]
  );

  // === Przywrócenie produktu ===
  const handleRestoreProduct = useCallback(
    async (productId) => {
      try {
        const res = await fetch(`/api/restore-product/${productId}`, {
          method: "PATCH",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const updated = await fetchCategories();
        refreshSelectedCategory(updated);
      } catch (err) {
        toast.error(err.message);
      }
    },
    [fetchCategories, refreshSelectedCategory]
  );

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.role === "ADMIN" &&
      categories.length === 0
    ) {
      fetchCategories();
    }
  }, [status, session, fetchCategories, categories.length]);

  // === Wartość kontekstu (memoizowana) ===
  const value = useMemo(
    () => ({
      categories,
      isLoading,
      error,
      selectedCategory,
      setSelectedCategory,
      editingCategory,
      setEditingCategory,
      editingProduct,
      setEditingProduct,
      showDeleteModal,
      setShowDeleteModal,
      newCategoryName,
      setNewCategoryName,
      newCategoryDescription,
      setNewCategoryDescription,

      // Akcje
      fetchCategories,
      handleCategoryClick,
      handleEditCategory,
      handleEditProduct,
      handleAddProduct,
      handleAddCategory,
      handleDelete,
      handleRestoreProduct,
      refreshSelectedCategory,
    }),
    [
      categories,
      isLoading,
      error,
      selectedCategory,
      editingCategory,
      editingProduct,
      showDeleteModal,
      newCategoryName,
      newCategoryDescription,

      fetchCategories,
      handleCategoryClick,
      handleEditCategory,
      handleEditProduct,
      handleAddProduct,
      handleAddCategory,
      handleDelete,
      handleRestoreProduct,
      refreshSelectedCategory,
    ]
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
