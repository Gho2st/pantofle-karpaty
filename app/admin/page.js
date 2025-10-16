"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Category from "./Category";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Admin() {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchCategories = async (parentId = null) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/get-category${parentId ? `?parentId=${parentId}` : ""}`,
        { cache: "no-store" } // Wyłącz cache
      );
      if (!res.ok) {
        throw new Error("Nie udało się pobrać kategorii");
      }
      const data = await res.json();
      console.log("Fetched categories:", data.categories); // Debug: log pobranych kategorii
      setCategories(data.categories || []);
      setIsLoading(false);
      return data.categories; // Zwróć dane do użycia w Category.js
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setIsLoading(false);
      return null;
    }
  };

  const handleCategoryUpdate = (updatedCategories) => {
    console.log("Updating categories:", updatedCategories); // Debug: log aktualizacji
    setCategories(updatedCategories);
    toast.success("Operacja zakończona pomyślnie!");
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchCategories();
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6 animate-spin text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
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
          You are not an admin
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
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <nav className="mt-6">
            <ul>
              <li>
                <a
                  href="#"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
                >
                  Users
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
                >
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="md:hidden text-gray-600 focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>
          <div className="text-gray-600">Admin: {session?.user?.name || "Admin"}</div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Category
            categories={categories}
            isLoading={isLoading}
            error={error}
            fetchCategories={fetchCategories}
            onCategoryUpdate={handleCategoryUpdate}
          />
        </main>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
