"use client";
import Image from "next/image";
import { ShoppingCart, Search, User } from "lucide-react";
import { signIn } from "next-auth/react";

export default function Nav() {
  const baseMenuItemClasses = "p-2 hover:text-red-600 transition duration-300";

  // Klasa dla spójnego wyglądu przycisków ikon
  const iconButtonClasses = `relative text-gray-700 ${baseMenuItemClasses}`;

  return (
    <nav className="bg-white p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* 1. Logo */}
        <div className="flex-shrink-0">
          <Image
            src={"/logo.png"}
            width={150}
            height={50}
            alt="Logo firmy"
            className="h-auto w-auto"
          />
        </div>

        {/* 2. Menu Główne i Ikony */}
        <div className="flex items-center space-x-6">
          {/* Menu Główne (Linki) */}
          <ul className="flex space-x-4 text-lg font-medium items-center">
            {/* Strona Główna */}
            <li className={baseMenuItemClasses}>
              <a href="/">Strona Główna</a>
            </li>

            {/* Dla Kobiet (Rozwijane) */}
            <li className="group relative">
              <button className={`flex items-center ${baseMenuItemClasses}`}>
                Dla Kobiet
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
              </button>
              <div className="absolute left-0 pt-2 z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition duration-300">
                <div className="w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <a
                    href="/kobiety/kapcie"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Kapcie damskie
                  </a>
                  <a
                    href="/kobiety/inne"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Inne
                  </a>
                </div>
              </div>
            </li>

            {/* Dla Mężczyzn (Rozwijane) */}
            <li className="group relative">
              <button className={`flex items-center ${baseMenuItemClasses}`}>
                Dla Mężczyzn
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
              </button>
              <div className="absolute left-0 pt-2 z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition duration-300">
                {/* Tutaj podmenu dla Mężczyzn */}
              </div>
            </li>

            {/* Dla Dzieci (Rozwijane) */}
            <li className="group relative">
              <button className={`flex items-center ${baseMenuItemClasses}`}>
                Dla Dzieci
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
              </button>
              <div className="absolute left-0 pt-2 z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition duration-300">
                {/* Tutaj podmenu dla Dzieci */}
              </div>
            </li>

            {/* Kontakt */}
            <li className={baseMenuItemClasses}>
              <a href="/kontakt">Kontakt</a>
            </li>
          </ul>

          {/* Ikony Akcji (Lupa, Logowanie, Koszyk) */}
          <div className="flex items-center space-x-2">
            {/* Lupa (Wyszukiwanie) - Dodajmy z powrotem! */}
            <button className={iconButtonClasses} aria-label="Wyszukaj">
              <Search className="w-6 h-6" />
            </button>

            {/* IKONA LOGOWANIA  */}
            <button
              className={iconButtonClasses}
              aria-label="Logowanie / Moje Konto"
              onClick={() => signIn()}
            >
              <User className="w-6 h-6" />
            </button>

            {/* Koszyk */}
            <button className={iconButtonClasses} aria-label="Koszyk">
              <ShoppingCart className="w-6 h-6" />
              {/* Licznik produktów w koszyku */}
              <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
