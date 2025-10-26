"use client";

import CollectionTitle from "../CollectionTitle";
import { useCategories } from "@/app/context/categoriesContext";

export default function Collection() {
  const { categories, isLoading } = useCategories();

  const displayedCategories = categories.slice(0, 3);
  return (
    <>
      <div className="grid md:grid-cols-3 gap-10 mt-16">
        {isLoading ? (
          // prosty stan ładowania by uniknąc pustego miejsca
          <>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </>
        ) : (
          // mapujemy po kategoriach z kontekstu
          displayedCategories.map((category) => (
            <CollectionTitle
              key={category.id}
              src={category.image || "/pantofle/pantofle.jpg"}
              alt={category.name}
              label={category.name}
              href={`/kategoria/${category.slug || category.name}`}
            />
          ))
        )}
      </div>
    </>
  );
}
