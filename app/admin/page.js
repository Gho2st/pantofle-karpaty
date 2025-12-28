// app/admin/page.js
"use client";
import { useState } from "react";
import Category from "./Category";
import Users from "./Users";
import Orders from "./Orders";
import DiscountCodes from "./DiscountCodes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, X } from "lucide-react";

export default function Admin({ session }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const renderView = () => {
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
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Witaj w Panelu Admina
            </h1>
            <p className="text-gray-600 max-w-md">
              Wybierz opcję z menu, aby rozpocząć.
            </p>
          </div>
        );
    }
  };

  const menuItem = (view, label) => (
    <button
      onClick={() => {
        setActiveView(view);
        setSidebarOpen(false);
      }}
      className={`block w-full text-left px-4 py-2 rounded transition-colors ${
        activeView === view
          ? "bg-blue-100 text-blue-700 font-medium"
          : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 z-10 md:relative md:translate-x-0`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Panel Admina</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 space-y-1">
            {menuItem("dashboard", "Dashboard")}
            {menuItem("orders", "Zamówienia")}
            {menuItem("users", "Użytkownicy")}
            {menuItem("categories", "Kategorie")}
            {menuItem("discounts", "Kody rabatowe")}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-700 p-2 rounded hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <div className="text-gray-600 ml-auto">
            Admin: {session?.user?.name || "Admin"}
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50">
          {renderView()}
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
