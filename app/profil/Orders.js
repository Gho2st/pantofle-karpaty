"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Orders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/get-orders");
      if (!response.ok) throw new Error("Błąd pobierania zamówień");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Map status to colors and Polish translations
  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING":
        return {
          text: "Oczekujące",
          styles: "bg-yellow-100 text-yellow-800 border-yellow-300",
        };
      case "PAID":
        return {
          text: "Opłacone",
          styles: "bg-green-100 text-green-800 border-green-300",
        };
      case "SHIPPED":
        return {
          text: "Wysłane",
          styles: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case "CANCELLED":
        return {
          text: "Anulowane",
          styles: "bg-red-100 text-red-800 border-red-300",
        };
      default:
        return {
          text: status || "Nieznany",
          styles: "bg-gray-100 text-gray-800 border-gray-300",
        };
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-red-600 text-center font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Twoje zamówienia
        </h1>
        {orders.length === 0 ? (
          <p className="text-gray-600 text-center text-lg">
            Brak zamówień do wyświetlenia
          </p>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => {
              const { text: statusText, styles: statusStyles } = getStatusInfo(
                order.status
              );
              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Zamówienie #{order.id}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles}`}
                    >
                      {statusText}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <p>
                        <span className="font-medium">Imię i nazwisko:</span>{" "}
                        {order.firstName} {order.lastName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {order.email}
                      </p>
                      <p>
                        <span className="font-medium">Adres:</span>{" "}
                        {order.street}, {order.city}, {order.postalCode}
                      </p>
                      <p>
                        <span className="font-medium">Telefon:</span>{" "}
                        {order.phone}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Metoda dostawy:</span>{" "}
                        {order.deliveryMethod}
                      </p>
                      <p>
                        <span className="font-medium">Paczkomat:</span>{" "}
                        {order.paczkomat || "Brak"}
                      </p>
                      <p>
                        <span className="font-medium">Koszt dostawy:</span>{" "}
                        {order.deliveryCost} zł
                      </p>
                      <p>
                        <span className="font-medium">Całkowita kwota:</span>{" "}
                        {order.totalAmount} zł
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-gray-700">
                      <span className="font-medium">Data utworzenia:</span>{" "}
                      {new Date(order.createdAt).toLocaleString("pl-PL")}
                    </p>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Pozycje zamówienia
                    </h3>
                    {order.items &&
                    Array.isArray(order.items) &&
                    order.items.length > 0 ? (
                      <ul className="mt-2 divide-y divide-gray-200">
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className="py-2 text-gray-700 flex justify-between"
                          >
                            <span>
                              {item.name} ({item.size})
                            </span>
                            <span>
                              {item.quantity} szt. x {item.price} zł
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 mt-2">
                        Brak pozycji zamówienia
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
