"use client";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddressForm from "./AddressForm";
import Orders from "./Orders";
import Name from "./Name";

export default function Profil() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("orders");
  const router = useRouter();

  // Przekierowanie dla admina
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      router.push("/admin");
    }
  }, [status, session, router]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const tabButtonClasses = (isActive) =>
    `block w-full text-left px-4 py-3 text-lg font-medium transition duration-300 ${
      isActive
        ? "bg-red-50 text-red-600 border-l-4 border-red-600"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <p>Ładowanie...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-7xl mx-auto p-4 my-16">
        <h1 className="text-3xl">Nie jesteś zalogowany</h1>
        <p>
          <button
            onClick={() => signIn()}
            className="text-red-600 hover:underline"
          >
            Zaloguj się
          </button>{" "}
          aby zobaczyć swój profil.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Menu boczne (po lewej) */}
        <div className="w-full md:w-1/4">
          <h2>Twoje konto</h2>
          <div className="bg-white border border-gray-200 rounded-md shadow-sm mt-4">
            <button
              className={tabButtonClasses(activeTab === "orders")}
              onClick={() => handleTabChange("orders")}
            >
              Zamówienia
            </button>
            <button
              className={tabButtonClasses(activeTab === "personal")}
              onClick={() => handleTabChange("personal")}
            >
              Dane osobowe
            </button>
            <button
              className={tabButtonClasses(activeTab === "address")}
              onClick={() => handleTabChange("address")}
            >
              Adresy
            </button>
          </div>
          <button
            onClick={() => signOut()}
            className="mt-4 w-full text-left px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-100"
          >
            Wyloguj
          </button>
        </div>

        {/* Zawartość (po prawej) */}
        <div className="w-full md:w-3/4 bg-white border border-gray-200 rounded-md p-6 shadow-sm">
          {activeTab === "orders" && <Orders />}

          {activeTab === "personal" && <Name />}

          {activeTab === "address" && <AddressForm />}
        </div>
      </div>
    </div>
  );
}
