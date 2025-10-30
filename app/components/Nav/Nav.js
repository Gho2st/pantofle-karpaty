"use client";
import Image from "next/image";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Home,
  Mail,
  LogIn,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/cartContext";
import { useCategories } from "@/app/context/categoriesContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Nav() {
  const { data: session } = useSession();
  const { cartItems, fetchCart } = useCart();
  const { categories, isLoading } = useCategories();
  const [animateCart, setAnimateCart] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  // Klasy wspólne
  const baseMenuItemClasses =
    "p-3 hover:text-red-600 hover:bg-gray-50 transition duration-300 flex items-center w-full text-left rounded-md font-medium";
  const iconButtonClasses =
    "relative text-gray-700 p-3 hover:bg-gray-100 rounded-md transition duration-300 min-h-11 min-w-11 flex items-center justify-center";

  const mobileMenuVariants = {
    closed: { x: "100%", opacity: 0, transition: { duration: 0.3 } },
    open: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  const dropdownVariants = {
    closed: { height: 0, opacity: 0, transition: { duration: 0.2 } },
    open: { height: "auto", opacity: 1, transition: { duration: 0.2 } },
  };

  return (
    <nav className="bg-white py-3 shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="w-32 md:w-40 2xl:w-48">
            <Image
              src="/logo.png"
              width={120}
              height={40}
              alt="Logo firmy"
              className="h-auto w-auto"
            />
          </div>
        </Link>

        {/* Mobile: Hamburger + Koszyk */}
        <div className="flex items-center space-x-2 md:hidden">
          <Link
            href="/koszyk"
            className={iconButtonClasses}
            aria-label="Koszyk"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center transition-transform duration-300 ${
                  animateCart ? "scale-125" : "scale-100"
                }`}
              >
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Otwórz menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <ul className="flex space-x-1 text-lg font-medium items-center">
            <li>
              <Link href="/" className={baseMenuItemClasses}>
                Strona Główna
              </Link>
            </li>

            {isLoading ? (
              <li className="px-3 py-1 text-gray-500">Ładowanie...</li>
            ) : (
              categories.map((category) => (
                <li key={category.id} className="group relative">
                  <Link
                    href={`/kategoria/${category.slug || category.name}`}
                    className={`flex items-center ${baseMenuItemClasses} pr-1`}
                  >
                    {category.name}
                    {category.subcategories.length > 0 && (
                      <ChevronDown
                        className={`w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180`}
                      />
                    )}
                  </Link>

                  {/* Dropdown Desktop */}
                  {category.subcategories.length > 0 && (
                    <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                      <div className="w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            href={`/kategoria/${category.slug}/${
                              subcategory.slug || subcategory.id
                            }`}
                            className="block px-4 py-3 text-gray-800 hover:bg-gray-100 font-medium transition-colors"
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

            <li>
              <Link href="/kontakt" className={baseMenuItemClasses}>
                Kontakt
              </Link>
            </li>
          </ul>

          {/* Ikony akcji */}
          <div className="flex items-center space-x-2">
            {/* Profil */}
            <div className="group relative">
              <button
                className={iconButtonClasses}
                aria-label="Profil użytkownika"
              >
                <User className="w-6 h-6" />
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                <div className="w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                  <Link
                    href="/profil"
                    className="block px-4 py-3 text-gray-800 hover:bg-gray-100 font-medium transition-colors"
                  >
                    Profil
                  </Link>
                  {session ? (
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 font-medium transition-colors"
                    >
                      Wyloguj
                    </button>
                  ) : (
                    <button
                      onClick={() => signIn()}
                      className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 font-medium transition-colors"
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
              {cartCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center transition-transform duration-300 ${
                    animateCart ? "scale-125" : "scale-100"
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden fixed top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-xl z-50 p-6 overflow-y-auto"
            >
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Zamknij menu"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <ul className="space-y-1">
                {/* Strona Główna */}
                <li>
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${baseMenuItemClasses} text-gray-800`}
                  >
                    <Home className="w-5 h-5 mr-3" />
                    Strona Główna
                  </Link>
                </li>

                {/* Kategorie */}
                {isLoading ? (
                  <li className="p-3 text-gray-500">Ładowanie kategorii...</li>
                ) : (
                  categories.map((category) => (
                    <li key={category.id}>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/kategoria/${category.slug || category.name}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`${baseMenuItemClasses} flex-1 mr-2 text-gray-800`}
                        >
                          {category.name}
                        </Link>
                        {category.subcategories.length > 0 && (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            aria-label="Rozwiń podkategorie"
                          >
                            <ChevronDown
                              className={`w-5 h-5 transition-transform duration-200 ${
                                openCategory === category.id ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {openCategory === category.id && (
                          <motion.ul
                            variants={dropdownVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="pl-6 mt-2 space-y-1 overflow-hidden"
                          >
                            {category.subcategories.map((subcategory) => (
                              <li key={subcategory.id}>
                                <Link
                                  href={`/kategoria/${category.slug}/${
                                    subcategory.slug || subcategory.id
                                  }`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 font-medium rounded-md transition-colors"
                                >
                                  {subcategory.name}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  ))
                )}

                {/* Kontakt */}
                <li>
                  <Link
                    href="/kontakt"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${baseMenuItemClasses} text-gray-800`}
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    Kontakt
                  </Link>
                </li>

                {/* Profil */}
                <li>
                  <Link
                    href="/profil"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${baseMenuItemClasses} text-gray-800`}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profil
                  </Link>
                </li>

                {/* Logowanie / Wylogowanie */}
                <li>
                  {session ? (
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${baseMenuItemClasses} text-red-600`}
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Wyloguj
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        signIn();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${baseMenuItemClasses} text-green-600`}
                    >
                      <LogIn className="w-5 h-5 mr-3" />
                      Zaloguj
                    </button>
                  )}
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
