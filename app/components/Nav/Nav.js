"use client";
import Image from "next/image";
import { ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react"; // Dodano ChevronDown
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
  const [openCategory, setOpenCategory] = useState(null); // Stan dla rozwijanych kategorii w menu mobilnym

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

  const baseMenuItemClasses = "p-2 hover:text-red-600 transition duration-300";
  const iconButtonClasses = `relative text-gray-700 ${baseMenuItemClasses}`;

  // Warianty animacji dla menu mobilnego
  const mobileMenuVariants = {
    closed: { x: "100%", opacity: 0, transition: { duration: 0.3 } },
    open: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  // Warianty animacji dla rozwijanych podkategorii
  const dropdownVariants = {
    closed: { height: 0, opacity: 0, transition: { duration: 0.2 } },
    open: { height: "auto", opacity: 1, transition: { duration: 0.2 } },
  };

  // Funkcja do przełączania kategorii w menu mobilnym
  const toggleCategory = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  return (
    <nav className="bg-white py-3 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6">
        {/* Logo (mniejsze) */}
        <Link href="/">
          <div className="flex-shrink-0 w-1/2 md:w-1/1">
            <Image
              src={"/logo.png"}
              width={120} // Zmniejszone logo
              height={40}
              alt="Logo firmy"
              className="h-auto w-auto"
            />
          </div>
        </Link>

        {/* Ikona Hamburgera (mobilne) */}
        <button
          className="md:hidden text-gray-700 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Menu Desktopowe */}
        <div className="hidden md:flex items-center space-x-4">
          <ul className="flex space-x-3 text-lg font-medium items-center">
            <li className={baseMenuItemClasses}>
              <Link href="/">Strona Główna</Link>
            </li>
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
                      <ChevronDown className="w-4 h-4 ml-1" />
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
            <li className={baseMenuItemClasses}>
              <Link href="/kontakt">Kontakt</Link>
            </li>
          </ul>

          {/* Ikony Akcji */}
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
            <Link
              href="/koszyk"
              className={iconButtonClasses}
              aria-label="Koszyk"
            >
              <ShoppingCart className="w-6 h-6" />
              <span
                className={`absolute -top-1 -right-1 text-base bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center transition-transform duration-300 ${
                  animateCart ? "scale-125" : "scale-100"
                }`}
              >
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Menu Mobilne */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="md:hidden fixed top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-lg z-50 p-4"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Zamknij menu"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              <ul className="flex flex-col space-y-2 text-base font-medium mt-4">
                <li className={baseMenuItemClasses}>
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    Strona Główna
                  </Link>
                </li>
                {isLoading ? (
                  <li className={baseMenuItemClasses}>Ładowanie...</li>
                ) : (
                  categories.map((category) => (
                    <li key={category.id}>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/kategoria/${category.slug || category.name}`}
                          className={baseMenuItemClasses}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                        {category.subcategories.length > 0 && (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            aria-label={`Rozwiń ${category.name}`}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                openCategory === category.id ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {category.subcategories.length > 0 &&
                          openCategory === category.id && (
                            <motion.ul
                              initial="closed"
                              animate="open"
                              exit="closed"
                              variants={dropdownVariants}
                              className="pl-4 mt-1 space-y-1 overflow-hidden"
                            >
                              {category.subcategories.map((subcategory) => (
                                <li key={subcategory.id}>
                                  <Link
                                    href={`/kategoria/${category.slug}/${
                                      subcategory.slug || subcategory.id
                                    }`}
                                    className="block capitalize px-3 py-1 text-gray-700 hover:bg-gray-100 font-medium rounded"
                                    onClick={() => setIsMobileMenuOpen(false)}
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
                <li className={baseMenuItemClasses}>
                  <Link
                    href="/kontakt"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Kontakt
                  </Link>
                </li>
                <li className={baseMenuItemClasses}>
                  <Link
                    href="/profil"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                </li>
                <li className={baseMenuItemClasses}>
                  {session ? (
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left w-full"
                    >
                      Wyloguj
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        signIn();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left w-full"
                    >
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
