"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Tworzymy kontekst
const CategoriesContext = createContext(undefined);

// Tworzymy Providera
export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/categories?parentId=null");
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania kategorii:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pobierz kategorie tylko raz, przy załadowaniu providera
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Nasłuchuj na zdarzenie, aby odświeżyć kategorie
  useEffect(() => {
    const handleCategoriesUpdate = () => fetchCategories();
    window.addEventListener("categoriesUpdated", handleCategoriesUpdate);
    return () => {
      window.removeEventListener("categoriesUpdated", handleCategoriesUpdate);
    };
  }, [fetchCategories]);

  return (
    <CategoriesContext.Provider
      value={{ categories, fetchCategories, isLoading }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

// Tworzymy custom hook do używania kontekstu
export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error(
      "useCategories musi być używane wewnątrz CategoriesProvider"
    );
  }
  return context;
}
