"use client";
import Image from "next/image";
import { ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/cartContext";
import { useCategories } from "@/app/context/categoriesContext"; // <-- IMPORT KONTEKSTU KATEGORII

export default function Nav() {
  const { data: session } = useSession();
  const { cartItems, fetchCart } = useCart(); // fetchCart może tu zostać, jeśli jest potrzebny
  const { categories, isLoading } = useCategories(); // <-- POBIERANIE DANYCH Z KONTEKSTU
  const [animateCart, setAnimateCart] = useState(false);

  // Oblicz liczbę elementów w koszyku
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Pobierz koszyk przy montowaniu (jeśli to nadal potrzebne)
  // Logika dla kategorii została przeniesiona do CategoriesProvider
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Animacja przy zmianie liczby elementów w koszyku
  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const baseMenuItemClasses = "p-2 hover:text-red-600 transition duration-300";
  const iconButtonClasses = `relative text-gray-700 ${baseMenuItemClasses}`;

  return (
    <nav className="bg-white py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* 1. Logo */}
        <Link href="/">
          <div className="flex-shrink-0">
            <Image
              src={"/logo.png"}
              width={150}
              height={50}
              alt="Logo firmy"
              className="h-auto w-auto"
            />
          </div>
        </Link>
        {/* 2. Menu Główne i Ikony */}
        <div className="flex items-center space-x-6">
          {/* Menu Główne (Linki) */}
          <ul className="flex space-x-4 text-lg font-medium items-center">
            {/* Strona Główna */}
            <li className={baseMenuItemClasses}>
              <Link href="/">Strona Główna</Link>
            </li>

            {/* Dynamiczne Kategorie (z kontekstu) */}
            {isLoading ? (
              <li className={baseMenuItemClasses}>Ładowanie...</li>
            ) : (
              categories.map((category) => (
                <li key={category.id} className="group relative">
                  <Link
                    href={`/kategoria/${category.slug || category.name}`}
                    className={`flex items-center ${baseMenuItemClasses}`}
                  >
                    {category.name}
                    {category.subcategories.length > 0 && (
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    )}
                  </Link>
                  {category.subcategories.length > 0 && (
                    <div className="absolute left-0 pt-2 z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition duration-300">
                      <div className="w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            href={`/kategoria/${category.slug}/${
                              subcategory.slug || subcategory.id
                            }`}
                            className="block capitalize px-4 py-2 text-gray-800 hover:bg-gray-100 font-medium"
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))
            )}

            {/* Kontakt */}
            <li className={baseMenuItemClasses}>
              <Link href="/kontakt">Kontakt</Link>
            </li>
          </ul>

          {/* Ikony Akcji (Profil, Koszyk) */}
          <div className="flex items-center space-x-2">
            <div className="group relative">
              <button
                className={iconButtonClasses}
                aria-label="Profil użytkownika"
              >
                <User className="w-6 h-6" />
              </button>
              <div className="absolute right-0 pt-2 z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition duration-300">
                <div className="w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <Link
                    href="/profil"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-medium"
                  >
                    Profil
                  </Link>
                  {session ? (
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 font-medium"
                    >
                      Wyloguj
                    </button>
                  ) : (
                    <button
                      onClick={() => signIn()}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 font-medium"
                    >
                      Zaloguj
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Koszyk */}
            <Link
              href="/koszyk"
              className={iconButtonClasses}
              aria-label="Koszyk"
            >
              <ShoppingCart className="w-6 h-6" />
              <span
                className={`absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center transition-transform duration-300 ${
                  animateCart ? "scale-125" : "scale-100"
                }`}
              >
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
