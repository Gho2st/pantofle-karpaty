// Admin.js
"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Category from "./Category";
import { ToastContainer } from "react-toastify";
import Users from "./Users";
import Orders from "./Orders";
import "react-toastify/dist/ReactToastify.css";
import { Menu, X } from "lucide-react";
import DiscountCodes from "./DiscountCodes";

export default function Admin() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState(null); // ← ŻADEN domyślny widok

  // Funkcja do renderowania aktywnego widoku
  const renderActiveView = () => {
    if (!activeView) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Witaj w Panelu Admina
          </h1>
          <p className="text-gray-600 max-w-md">
            Wybierz jedną z opcji z menu po lewej, aby rozpocząć zarządzanie.
          </p>
        </div>
      );
    }

    switch (activeView) {
      case "categories":
        return <Category />;
      case "users":
        return <Users />;
      case "orders":
        return <Orders />;
      case "discounts":
        return <DiscountCodes />;
      default:
        return null;
    }
  };

  // Klasa dla aktywnych przycisków w menu
  const menuItemClass = (view) =>
    `block py-2 px-4 rounded transition-colors w-full text-left ${
      activeView === view
        ? "bg-blue-100 text-blue-700 font-medium"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium text-gray-600">
            Ładowanie...
          </span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-red-600">
          Nie jesteś administratorem
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Overlay dla mobilnego sidebara */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 z-20`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Panel Admina</h2>
            {/* Przycisk zamykania na mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-600 hover:text-gray-800"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="mt-6 space-y-1">
            <button
              onClick={() => {
                setActiveView("orders");
                setSidebarOpen(false);
              }}
              className={menuItemClass("orders")}
            >
              Zamówienia
            </button>

            <button
              onClick={() => {
                setActiveView("users");
                setSidebarOpen(false);
              }}
              className={menuItemClass("users")}
            >
              Użytkownicy
            </button>

            <button
              onClick={() => {
                setActiveView("categories");
                setSidebarOpen(false);
              }}
              className={menuItemClass("categories")}
            >
              Kategorie
            </button>

            <button
              onClick={() => {
                setActiveView("discounts");
                setSidebarOpen(false);
              }}
              className={menuItemClass("discounts")}
            >
              Kody rabatowe
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          {/* Przycisk otwierania (Hamburger) na mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-700 p-2 rounded-md hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <div className="text-gray-600 ml-auto">
            Admin: {session?.user?.name || "Admin"}
          </div>
        </header>

        {/* Treść główna */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
