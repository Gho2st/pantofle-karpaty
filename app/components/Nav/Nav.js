"use client";
import Image from "next/image";
import { ShoppingCart, User } from "lucide-react";
import Link from "next/link"; // Upewnij się, że jest zaimportowany
import { useSession, signIn, signOut } from "next-auth/react";

export default function Nav() {
  const { data: session } = useSession();

  const baseMenuItemClasses = "p-2 hover:text-red-600 transition duration-300";
  const iconButtonClasses = `relative text-gray-700 ${baseMenuItemClasses}`;

  return (
    <nav className="bg-white p-4">
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
              <a href="/">Strona Główna</a>
            </li>

            {/* Dla Kobiet (Rozwijane) */}
            <li className="group relative">
              <Link
                href="/kategoria/dla-kobiet"
                className={`flex items-center ${baseMenuItemClasses}`}
              >
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
              </Link>
              <div className="absolute left-0 pt-2 z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition duration-300">
                <div className="w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <Link
                    href="/dla-kobiet/kapcie"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-medium"
                  >
                    Kapcie damskie
                  </Link>
                  <Link
                    href="/dla-kobiet/inne"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-medium"
                  >
                    Inne
                  </Link>
                </div>
              </div>
            </li>

            {/* Dla Mężczyzn (Rozwijane) */}
            <li className="group relative">
              <Link
                href="/kategoria/dla-mezczyzn"
                className={`flex items-center ${baseMenuItemClasses}`}
              >
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
              </Link>
              <div className="absolute left-0 pt-2 z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition duration-300">
                {/* Tutaj podmenu dla Mężczyzn */}
              </div>
            </li>

            {/* Dla Dzieci (Rozwijane) */}
            <li className="group relative">
              <Link
                href="/kategoria/dla-dzieci"
                className={`flex items-center ${baseMenuItemClasses}`}
              >
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
              </Link>
              <div className="absolute left-0 pt-2 z-10 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition duration-300">
                {/* Tutaj podmenu dla Dzieci */}
              </div>
            </li>

            {/* Kontakt */}
            <li className={baseMenuItemClasses}>
              <a href="/kontakt">Kontakt</a>
            </li>
          </ul>

          {/* Ikony Akcji ( Profil, Koszyk) */}
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
                      onClick={() => {
                        signOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 font-medium"
                    >
                      Wyloguj
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        signIn();
                      }}
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
              <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
