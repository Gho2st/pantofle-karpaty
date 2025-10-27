"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

  const fetchCategories = useCallback(async (parentId = null) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/get-category${parentId ? `?parentId=${parentId}` : ""}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        throw new Error("Nie udało się pobrać kategorii");
      }
      const data = await res.json();
      console.log("Fetched categories:", data.categories);
      setCategories(data.categories || []);
      setIsLoading(false);
      return data.categories;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setIsLoading(false);
      return null;
    }
  }, []);

  const handleCategoryUpdate = useCallback((updatedCategories) => {
    console.log("Updating categories:", updatedCategories);
    setCategories(updatedCategories);
    toast.success("Operacja zakończona pomyślnie!");
  }, []);

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
    console.log("Wybrana kategoria:", category);
  }, []);

  const handleEditCategory = useCallback(
    async (category) => {
      try {
        const formData = new FormData();
        formData.append("name", editingCategory.name);
        formData.append("description", editingCategory.description || "");
        formData.append("slug", editingCategory.slug || "");
        if (editingCategory.imageToRemove) {
          formData.append("imageToRemove", editingCategory.imageToRemove);
        }
        if (editingCategory.newImage instanceof File) {
          formData.append("image", editingCategory.newImage);
        }

        const res = await fetch(`/api/update-category/${category.id}`, {
          method: "PUT",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error || "Nie udało się zaktualizować kategorii"
          );
        }
        const updatedCategories = await fetchCategories();
        setEditingCategory(null);
        setNewCategoryName("");
        setNewCategoryDescription("");
        toast.success("Kategoria zaktualizowana pomyślnie");
        handleCategoryUpdate(updatedCategories || categories);
        if (selectedCategory?.id === category.id) {
          const updatedCategory =
            updatedCategories?.find((cat) => cat.id === category.id) ||
            category;
          setSelectedCategory(updatedCategory);
        }
        window.dispatchEvent(new Event("categoriesUpdated"));
      } catch (err) {
        console.error("Błąd podczas edytowania kategorii:", err);
        toast.error(err.message);
      }
    },
    [fetchCategories, handleCategoryUpdate, selectedCategory, editingCategory]
  );
  // w pliku AdminContext.js

  const handleEditProduct = useCallback(
    async (product) => {
      // 'product' to są nowe dane z formularza (productData)
      console.log("Rozpoczęcie handleEditProduct dla produktu:", product);
      try {
        if (!product || !product.id) {
          // Użyj 'product'
          console.error("Błąd: Brak danych produktu lub ID produktu");
          toast.error("Błąd: Brak danych produktu");
          return;
        }

        const formData = new FormData();
        console.log("Tworzenie FormData z nowych danych...");

        // UŻYWAJ DANYCH Z ARGUMENTU 'product'
        formData.append("name", product.name || "");
        formData.append("slug", product.slug || "");
        formData.append("price", product.price?.toString() || "");
        formData.append("description", product.description || "");
        formData.append("description2", product.description2 || "");
        formData.append("additionalInfo", product.additionalInfo || "");

        if (product.sizes) {
          try {
            console.log("Parsowanie sizes:", product.sizes);
            formData.append("sizes", JSON.stringify(product.sizes));
          } catch (e) {
            console.error("Błąd parsowania sizes:", e);
            toast.error("Nieprawidłowy format rozmiarów");
            return;
          }
        }

        formData.append("categoryId", parseInt(product.categoryId));

        if (product.imagesToRemove?.length > 0) {
          try {
            console.log("Parsowanie imagesToRemove:", product.imagesToRemove);
            formData.append(
              "imagesToRemove",
              JSON.stringify(product.imagesToRemove)
            );
          } catch (e) {
            console.error("Błąd parsowania imagesToRemove:", e);
            toast.error("Nieprawidłowy format imagesToRemove");
            return;
          }
        }

        if (product.imagesToAdd?.length > 0) {
          console.log("Dodawanie imagesToAdd:", product.imagesToAdd);
          product.imagesToAdd.forEach((file) => {
            formData.append("imagesToAdd", file);
          });
        }

        console.log("Wysyłane FormData:", [...formData.entries()]); // Sprawdź czy cena jest nowa

        console.log(
          "Wysyłanie żądania PUT do:",
          `/api/update-product/${product.id}`
        );
        const res = await fetch(`/api/update-product/${product.id}`, {
          // Użyj 'product.id'
          method: "PUT",
          body: formData,
        });
        console.log("Odpowiedź z API:", res.status, res.statusText);
        const data = await res.json();
        console.log("Dane odpowiedzi:", data);

        if (!res.ok) {
          throw new Error(data.error || "Nie udało się zaktualizować produktu");
        }

        console.log("Pobieranie zaktualizowanych kategorii...");
        const updatedCategories = await fetchCategories();
        handleCategoryUpdate(updatedCategories || categories);
        if (selectedCategory) {
          const findCategoryById = (categories, id) => {
            for (const cat of categories) {
              if (cat.id === id) return cat;
              if (cat.subcategories) {
                const found = cat.subcategories.find((sub) => sub.id === id);
                if (found) return found;
              }
            }
            return null;
          };
          const updatedCategory = findCategoryById(
            updatedCategories,
            selectedCategory.id
          );
          console.log("Zaktualizowana kategoria:", updatedCategory);
          setSelectedCategory(updatedCategory || selectedCategory);
        }
        setEditingProduct(null);
        toast.success("Produkt zaktualizowany pomyślnie");
        window.dispatchEvent(new Event("categoriesUpdated"));
        await fetchCart();
      } catch (err) {
        console.error("Błąd w handleEditProduct:", err);
        toast.error(err.message || "Błąd podczas edytowania produktu");
      }
    },
    [fetchCategories, handleCategoryUpdate, selectedCategory, fetchCart]
  );

  const handleAddProduct = useCallback(
    async (categoryId, formData) => {
      try {
        const res = await fetch("/api/add-product", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Nie udało się dodać produktu");
        }

        const updatedCategories = await fetchCategories();
        console.log(
          "Pełna lista zaktualizowanych kategorii:",
          JSON.stringify(updatedCategories, null, 2)
        );

        const findCategoryById = (categories, id) => {
          for (const cat of categories) {
            if (cat.id === id) return cat;
            if (cat.subcategories) {
              const found = cat.subcategories.find((sub) => sub.id === id);
              if (found) return found;
            }
          }
          return null;
        };
        const updatedCategory = findCategoryById(updatedCategories, categoryId);
        console.log("Znaleziono zaktualizowaną kategorię:", updatedCategory);
        console.log(
          "Produkty w zaktualizowanej kategorii:",
          updatedCategory?.products
        );

        handleCategoryUpdate(updatedCategories || categories);

        if (updatedCategory) {
          setSelectedCategory(updatedCategory);
        } else {
          console.warn(
            "Nie znaleziono zaktualizowanej kategorii dla categoryId:",
            categoryId
          );
        }

        toast.success("Produkt dodany pomyślnie");
        window.dispatchEvent(new Event("categoriesUpdated"));
        await fetchCart();
      } catch (err) {
        console.error("Błąd podczas dodawania produktu:", err);
        toast.error(err.message);
      }
    },
    [fetchCategories, handleCategoryUpdate, fetchCart]
  );

  const handleAddCategory = useCallback(
    async (formData) => {
      try {
        const res = await fetch("/api/add-category", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Nie udało się dodać kategorii");
        }
        const updatedCategories = await fetchCategories();
        setNewCategoryName("");
        setNewCategoryDescription("");
        toast.success(
          selectedCategory
            ? "Podkategoria dodana pomyślnie"
            : "Kategoria dodana pomyślnie"
        );
        handleCategoryUpdate(updatedCategories || categories);
        if (selectedCategory) {
          const findCategoryById = (categories, id) => {
            for (const cat of categories) {
              if (cat.id === id) return cat;
              if (cat.subcategories) {
                const found = cat.subcategories.find((sub) => sub.id === id);
                if (found) return found;
              }
            }
            return null;
          };
          const updatedCategory = findCategoryById(
            updatedCategories,
            selectedCategory.id
          );
          setSelectedCategory(updatedCategory || selectedCategory);
        }
        window.dispatchEvent(new Event("categoriesUpdated"));
      } catch (err) {
        console.error("Błąd podczas dodawania kategorii:", err);
        toast.error(err.message);
      }
    },
    [fetchCategories, handleCategoryUpdate, selectedCategory]
  );

  const handleDelete = useCallback(
    async (type, id) => {
      try {
        const res = await fetch(
          type === "category"
            ? `/api/delete-category/${id}`
            : `/api/delete-product/${id}`,
          { method: "DELETE" }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error ||
              `Nie udało się usunąć ${
                type === "category" ? "kategorii" : "produktu"
              }`
          );
        }
        const updatedCategories = await fetchCategories();
        handleCategoryUpdate(updatedCategories || categories);
        if (type === "category" && selectedCategory?.id === id) {
          setSelectedCategory(null);
        } else if (selectedCategory) {
          const findCategoryById = (categories, id) => {
            for (const cat of categories) {
              if (cat.id === id) return cat;
              if (cat.subcategories) {
                const found = cat.subcategories.find((sub) => sub.id === id);
                if (found) return found;
              }
            }
            return null;
          };
          const updatedCategory = findCategoryById(
            updatedCategories,
            selectedCategory.id
          );
          setSelectedCategory(updatedCategory || selectedCategory);
        }
        setShowDeleteModal(null);
        toast.success(
          data.message ||
            `${
              type === "category" ? "Kategoria" : "Produkt"
            } usunięty pomyślnie`
        );
        window.dispatchEvent(new Event("categoriesUpdated"));
        if (type === "product") {
          await fetchCart();
        }
      } catch (err) {
        console.error("Błąd podczas usuwania:", err);
        toast.error(err.message);
      }
    },
    [fetchCategories, handleCategoryUpdate, selectedCategory, fetchCart]
  );

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchCategories();
    }
  }, [status, session, fetchCategories]);

  return (
    <AdminContext.Provider
      value={{
        categories,
        isLoading,
        error,
        fetchCategories,
        handleCategoryUpdate,
        selectedCategory,
        setSelectedCategory,
        editingCategory,
        setEditingCategory,
        editingProduct,
        setEditingProduct,
        showDeleteModal,
        setShowDeleteModal,
        handleCategoryClick,
        handleEditCategory,
        handleEditProduct,
        handleAddProduct,
        handleAddCategory,
        handleDelete,
        newCategoryName,
        setNewCategoryName,
        newCategoryDescription,
        setNewCategoryDescription,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
