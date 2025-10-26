"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Category from "./Category";
import { ToastContainer } from "react-toastify";
import Users from "./Users";
import Orders from "./Orders";
import "react-toastify/dist/ReactToastify.css";

export default function Admin() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("categories"); // Domyślny widok

  // Funkcja do renderowania aktywnego widoku
  const renderActiveView = () => {
    switch (activeView) {
      case "categories":
        return <Category />;
      case "users":
        return <Users />;
      case "orders":
        return <Orders />;
      default:
        return <Category />;
    }
  };

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
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 z-20`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Panel Admina</h2>
          <nav className="mt-6">
            <ul>
              <li>
                <button
                  onClick={() => {
                    setActiveView("orders");
                    setSidebarOpen(false); // Zamknij sidebar na mobilce po kliknięciu
                  }}
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
                >
                  Zamówienia
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView("users");
                    setSidebarOpen(false); // Zamknij sidebar na mobilce po kliknięciu
                  }}
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
                >
                  Uzytkownicy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView("categories");
                    setSidebarOpen(false); // Zamknij sidebar na mobilce po kliknięciu
                  }}
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
                >
                  Kategorie
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="text-gray-600">
            Admin: {session?.user?.name || "Admin"}
          </div>
        </header>

        <div className="my-10 px-[6%]">{renderActiveView()}</div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
