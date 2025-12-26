"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Orders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Stany dla modala anulowania
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Fetch orders for admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/orders");
          if (!response.ok) {
            throw new Error("Nie udało się pobrać zamówień");
          }
          const data = await response.json();
          setOrders(data.orders);
          setFilteredOrders(data.orders);
        } catch (err) {
          setError(err.message);
          toast.error(err.message, {
            position: "top-right",
            autoClose: 3000,
          });
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [status, session]);

  // Połączone filtrowanie po metodzie płatności i statusie
  useEffect(() => {
    let result = orders;

    if (paymentMethodFilter !== "all") {
      result = result.filter(
        (order) => order.paymentMethod === paymentMethodFilter
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [orders, paymentMethodFilter, statusFilter]);

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Nie udało się zaktualizować statusu"
        );
      }
      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? updatedOrder.order : order
        )
      );
      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? updatedOrder.order : order
        )
      );

      // Wysyłka emaila przy zmianie na SHIPPED lub CANCELLED
      if (newStatus === "SHIPPED" || newStatus === "CANCELLED") {
        const order = updatedOrder.order;
        await fetch("/api/orders/status-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            status: newStatus === "SHIPPED" ? "wysłane" : "anulowane",
            customerName: `${order.firstName} ${order.lastName}`,
            customerEmail: order.email,
          }),
        });
      }

      const statusText = {
        PENDING: "Oczekujące",
        PAID: "Opłacone",
        SHIPPED: "Wysłane",
        CANCELLED: "Anulowane",
        EXPIRED: "Wygasłe",
      };
      toast.success(
        `Status zamówienia #${orderId} zmieniony na ${
          statusText[newStatus] || newStatus
        }`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    } catch (err) {
      toast.error(err.message || "Błąd podczas zmiany statusu", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Otwarcie modala anulowania
  const handleCancelOrder = (orderId) => {
    setOrderToCancel(orderId);
    setCancelModalOpen(true);
  };

  // Potwierdzenie anulowania
  const confirmCancelOrder = async () => {
    if (orderToCancel) {
      await handleStatusChange(orderToCancel, "CANCELLED");
      setCancelModalOpen(false);
      setOrderToCancel(null);
    }
  };

  // Zamknięcie modala
  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setOrderToCancel(null);
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
      case "EXPIRED":
        return {
          text: "Wygasłe",
          styles: "bg-gray-100 text-gray-800 border-gray-300",
        };
      default:
        return {
          text: status || "Nieznany",
          styles: "bg-gray-100 text-gray-800 border-gray-300",
        };
    }
  };

  // Map payment method to Polish translations
  const getPaymentMethodText = (method) => {
    switch (method) {
      case "traditional":
        return "Przelew tradycyjny";
      case "stripe":
        return "Stripe";
      default:
        return method || "Nieznana";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    router.push("/");
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
        <ToastContainer position="bottom-right" autoClose={3000} />
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Zarządzanie zamówieniami
        </h1>

        {/* Filtry */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="payment-method-filter"
              className="block text-gray-700 font-medium mb-2"
            >
              Filtruj według metody płatności:
            </label>
            <select
              id="payment-method-filter"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white"
            >
              <option value="all">Wszystkie</option>
              <option value="traditional">Przelew tradycyjny</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status-filter"
              className="block text-gray-700 font-medium mb-2"
            >
              Filtruj według statusu:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="PENDING">Oczekujące</option>
              <option value="PAID">Opłacone</option>
              <option value="SHIPPED">Wysłane</option>
              <option value="CANCELLED">Anulowane</option>
              <option value="EXPIRED">Wygasłe</option>
            </select>
          </div>
        </div>

        {/* Lista zamówień */}
        {filteredOrders.length === 0 ? (
          <p className="text-gray-600 text-center text-lg py-12">
            Brak zamówień pasujących do wybranych filtrów
          </p>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => {
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
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles}`}
                    >
                      {statusText}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {order.email}
                      </p>
                      <p>
                        <span className="font-medium">Imię i nazwisko:</span>{" "}
                        {order.firstName} {order.lastName}
                      </p>
                      <p>
                        <span className="font-medium">Adres:</span>{" "}
                        {order.street}, {order.city}, {order.postalCode}
                      </p>
                      <p>
                        <span className="font-medium">Telefon:</span>{" "}
                        {order.phone}
                      </p>
                      {order.companyName && (
                        <p>
                          <span className="font-medium">Nazwa firmy:</span>{" "}
                          {order.companyName}
                        </p>
                      )}
                      {order.nip && (
                        <p>
                          <span className="font-medium">NIP:</span> {order.nip}
                        </p>
                      )}
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Metoda dostawy:</span>{" "}
                        {order.deliveryMethod}
                      </p>
                      <p>
                        <span className="font-medium">Metoda płatności:</span>{" "}
                        {getPaymentMethodText(order.paymentMethod)}
                      </p>
                      <p>
                        <span className="font-medium">Koszt dostawy:</span>{" "}
                        {order.deliveryCost.toFixed(2)} zł
                      </p>
                      <p>
                        <span className="font-medium">Całkowita kwota:</span>{" "}
                        {order.totalAmount.toFixed(2)} zł
                      </p>
                      <p>
                        <span className="font-medium">Data utworzenia:</span>{" "}
                        {new Date(order.createdAt).toLocaleString("pl-PL")}
                      </p>
                      {order.paczkomat && (
                        <p>
                          <span className="font-medium">Paczkomat:</span>{" "}
                          {order.paczkomat}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor={`status-${order.id}`}
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Zmień status:
                    </label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className={`w-full md:w-1/2 border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                        order.status === "CANCELLED" ||
                        order.status === "EXPIRED"
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-white"
                      }`}
                      disabled={
                        order.status === "CANCELLED" ||
                        order.status === "EXPIRED"
                      }
                    >
                      <option value="PAID">Opłacone</option>
                      <option value="SHIPPED">Wysłane</option>
                    </select>
                  </div>

                  {order.status !== "CANCELLED" &&
                    order.status !== "EXPIRED" && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                      >
                        Anuluj zamówienie
                      </button>
                    )}

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
                              {item.quantity} szt. x {item.price.toFixed(2)} zł
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

        {/* Modal potwierdzenia anulowania */}
        {cancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Czy na pewno anulować zamówienie?
              </h3>
              <p className="text-gray-600 mb-8">
                Zamówienie{" "}
                <span className="font-semibold">#{orderToCancel}</span> zostanie
                oznaczone jako{" "}
                <span className="text-red-600 font-medium">Anulowane</span>. Tej
                operacji nie można cofnąć.
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={closeCancelModal}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Cofnij
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Tak, anuluj zamówienie
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
