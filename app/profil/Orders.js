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

      // Dodajemy paymentUrl do zamówień PENDING + Stripe
      const enrichedOrders = await Promise.all(
        (data.orders || []).map(async (order) => {
          if (
            order.status === "PENDING" &&
            order.paymentMethod === "stripe" &&
            order.paymentId
          ) {
            try {
              const res = await fetch("/api/get-payment-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId: order.paymentId }),
              });
              if (res.ok) {
                const { url } = await res.json();
                if (url) return { ...order, paymentUrl: url };
              }
            } catch (err) {
              console.error("Błąd pobierania linku płatności", err);
            }
          }
          return order;
        })
      );

      setOrders(enrichedOrders);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const map = {
      PENDING: {
        text: "Oczekuje na płatność",
        styles: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
      PAID: {
        text: "Opłacone",
        styles: "bg-green-100 text-green-800 border-green-300",
      },
      SHIPPED: {
        text: "Wysłane",
        styles: "bg-blue-100 text-blue-800 border-blue-300",
      },
      CANCELLED: {
        text: "Anulowane",
        styles: "bg-red-100 text-red-800 border-red-300",
      },
      EXPIRED: {
        text: "Wygasłe",
        styles: "bg-gray-100 text-gray-600 border-gray-300",
      },
    };
    return (
      map[status] || {
        text: status || "Nieznany",
        styles: "bg-gray-100 text-gray-800",
      }
    );
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
              const showPayButton =
                order.paymentUrl && order.status === "PENDING";

              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Zamówienie #{order.id}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles}`}
                      >
                        {statusText}
                      </span>

                      {/* PRZYCISK DOKOŃCZ PŁATNOŚĆ */}
                      {showPayButton && (
                        <a
                          href={order.paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all shadow hover:shadow-lg"
                        >
                          Dokończ płatność
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Reszta danych – bez zmian */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
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
                      <p className="font-semibold text-lg">
                        Całkowita kwota: {order.totalAmount.toFixed(2)} zł
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 text-gray-600">
                    <p>
                      <span className="font-medium">Data złożenia:</span>{" "}
                      {new Date(order.createdAt).toLocaleString("pl-PL")}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Zamówione produkty
                    </h3>
                    {order.items?.length > 0 ? (
                      <ul className="space-y-2">
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <span>
                              {item.name}{" "}
                              <small className="text-gray-500">
                                (rozmiar {item.size})
                              </small>
                            </span>
                            <span className="font-medium">
                              {item.quantity} × {item.price} zł
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Brak produktów</p>
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
