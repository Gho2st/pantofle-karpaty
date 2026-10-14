"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  TRANSFER_EXPIRY_BUSINESS_DAYS,
  businessDaysSince,
} from "@/app/lib/transferDeadline";

const PAGE_SIZE = 20;

const DELIVERY_LABELS = { paczkomat: "Paczkomat InPost", kurier: "Kurier" };

// Cena zapłacona: promoPrice jest zapisywane tylko, gdy promocja obowiązywała przy zakupie
const paidPrice = (item) => item.promoPrice || item.price;

function matchesSearch(order, query) {
  const q = query.trim().toLowerCase().replace(/^#/, "");
  if (!q) return true;
  if (String(order.id) === q) return true;
  return [
    `${order.firstName} ${order.lastName}`,
    order.email,
    order.phone,
    order.city,
    order.companyName,
  ].some((field) => field?.toLowerCase().includes(q));
}

// Dostępne akcje dla danego statusu (zamówienia anulowane/wygasłe są zamknięte)
const ACTIONS = {
  PENDING: ["PAID", "SHIPPED", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["CANCELLED"],
};

const ACTION_CONFIG = {
  PAID: {
    label: "Oznacz jako opłacone",
    title: "Oznaczyć zamówienie jako opłacone?",
    button: "bg-green-600 hover:bg-green-700",
  },
  SHIPPED: {
    label: "Oznacz jako wysłane",
    title: "Oznaczyć zamówienie jako wysłane?",
    button: "bg-blue-600 hover:bg-blue-700",
    // Domyślnie bez maila — etykiety z InPostu same powiadamiają klienta
    email: {
      default: false,
      hint: "Zostaw odznaczone, jeśli etykieta została wygenerowana w InPost — klient dostanie powiadomienie od InPostu.",
    },
  },
  CANCELLED: {
    label: "Anuluj zamówienie",
    title: "Czy na pewno anulować zamówienie?",
    button: "bg-red-600 hover:bg-red-700",
    email: { default: true },
    warning: "Towar wróci na stan. Tej operacji nie można cofnąć.",
  },
};

export default function Orders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  // Domyślnie tylko zamówienia wymagające działania
  const [statusFilter, setStatusFilter] = useState("todo");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const listTopRef = useRef(null);

  const goToPage = (next) => {
    setPage(next);
    listTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Modal potwierdzenia akcji: { orderId, status, notify }
  const [pendingAction, setPendingAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Filtrowanie: metoda płatności, status, wyszukiwarka
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (paymentMethodFilter === "all" ||
            order.paymentMethod === paymentMethodFilter) &&
          (statusFilter === "all" ||
            (statusFilter === "todo"
              ? ["PENDING", "PAID"].includes(order.status)
              : order.status === statusFilter)) &&
          matchesSearch(order, search)
      ),
    [orders, paymentMethodFilter, statusFilter, search]
  );

  // Zmiana filtrów wraca na pierwszą stronę
  useEffect(() => {
    setPage(1);
  }, [paymentMethodFilter, statusFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const visibleOrders = filteredOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Handle status change
  const handleStatusChange = async (orderId, newStatus, notify = false) => {
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
      // Podmieniamy tylko status — odpowiedź PATCH nie zawiera rabatu ani cen promocyjnych
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: updatedOrder.order.status }
            : order
        )
      );

      // Mail do klienta tylko, jeśli admin zaznaczył to w oknie potwierdzenia
      let emailFailed = false;
      if (notify && (newStatus === "SHIPPED" || newStatus === "CANCELLED")) {
        try {
          const emailRes = await fetch("/api/orders/status-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              status: newStatus === "SHIPPED" ? "wysłane" : "anulowane",
            }),
          });
          emailFailed = !emailRes.ok;
        } catch {
          emailFailed = true;
        }
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
        }${notify && !emailFailed ? " – mail wysłany do klienta" : ""}`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      if (emailFailed) {
        toast.warning(
          `Status zmieniony, ale nie udało się wysłać maila do klienta (#${orderId})`,
          { position: "top-right", autoClose: false }
        );
      }
    } catch (err) {
      toast.error(err.message || "Błąd podczas zmiany statusu", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const openAction = (orderId, status) => {
    setPendingAction({
      orderId,
      status,
      notify: ACTION_CONFIG[status].email?.default ?? false,
    });
  };

  const confirmAction = async () => {
    if (!pendingAction || isSubmitting) return;
    setIsSubmitting(true);
    await handleStatusChange(
      pendingAction.orderId,
      pendingAction.status,
      pendingAction.notify
    );
    setIsSubmitting(false);
    setPendingAction(null);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Zarządzanie zamówieniami
        </h1>

        {/* Filtry */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label
              htmlFor="order-search"
              className="block text-gray-700 font-medium mb-2"
            >
              Szukaj:
            </label>
            <input
              id="order-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nr zamówienia, nazwisko, e-mail, telefon…"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white"
            />
          </div>

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
              <option value="todo">Do zrobienia (oczekujące + opłacone)</option>
              <option value="all">Wszystkie statusy</option>
              <option value="PENDING">Oczekujące</option>
              <option value="PAID">Opłacone</option>
              <option value="SHIPPED">Wysłane</option>
              <option value="CANCELLED">Anulowane</option>
              <option value="EXPIRED">Wygasłe</option>
            </select>
          </div>
        </div>

        <p ref={listTopRef} className="text-sm text-gray-500 mb-4">
          Znaleziono: {filteredOrders.length}
        </p>

        {/* Lista zamówień */}
        {filteredOrders.length === 0 ? (
          <p className="text-gray-600 text-center text-lg py-12">
            Brak zamówień pasujących do wybranych filtrów
          </p>
        ) : (
          <div className="grid gap-6">
            {visibleOrders.map((order) => {
              const { text: statusText, styles: statusStyles } = getStatusInfo(
                order.status
              );
              const transferDaysLeft =
                order.status === "PENDING" &&
                order.paymentMethod === "traditional"
                  ? TRANSFER_EXPIRY_BUSINESS_DAYS -
                    businessDaysSince(new Date(order.createdAt))
                  : null;
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

                  {transferDaysLeft !== null && (
                    <p
                      className={`mb-4 text-sm px-3 py-2 rounded-lg border ${
                        transferDaysLeft <= 2
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-yellow-50 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      Przelew czeka{" "}
                      {TRANSFER_EXPIRY_BUSINESS_DAYS - transferDaysLeft} dni
                      roboczych —{" "}
                      {transferDaysLeft > 0
                        ? `wygaśnie za ${transferDaysLeft} dni roboczych, jeśli nie zostanie oznaczony jako opłacony`
                        : "wygaśnie najbliższej nocy, jeśli nie zostanie oznaczony jako opłacony"}
                    </p>
                  )}

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
                        {DELIVERY_LABELS[order.deliveryMethod] ||
                          order.deliveryMethod}
                      </p>
                      <p>
                        <span className="font-medium">Metoda płatności:</span>{" "}
                        {getPaymentMethodText(order.paymentMethod)}
                      </p>
                      <p>
                        <span className="font-medium">Koszt dostawy:</span>{" "}
                        {order.deliveryCost.toFixed(2)} zł
                      </p>
                      {order.discountAmount > 0 && (
                        <p>
                          <span className="font-medium">Rabat:</span> −
                          {order.discountAmount.toFixed(2)} zł
                          {order.discountCode && ` (${order.discountCode})`}
                        </p>
                      )}
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

                  {ACTIONS[order.status] && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {ACTIONS[order.status].map((action) => (
                        <button
                          key={action}
                          onClick={() => openAction(order.id, action)}
                          className={`${ACTION_CONFIG[action].button} text-white px-4 py-2 rounded-lg transition-colors duration-200`}
                        >
                          {ACTION_CONFIG[action].label}
                        </button>
                      ))}
                    </div>
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
                              {item.quantity} szt. x{" "}
                              {item.promoPrice && (
                                <span className="line-through text-gray-400 mr-1">
                                  {item.price.toFixed(2)} zł
                                </span>
                              )}
                              {paidPrice(item).toFixed(2)} zł
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

        {pageCount > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white border text-gray-700 hover:bg-gray-100 disabled:opacity-40"
            >
              ← Poprzednia
            </button>
            <span className="text-gray-600">
              Strona {page} z {pageCount}
            </span>
            <button
              onClick={() => goToPage(Math.min(pageCount, page + 1))}
              disabled={page === pageCount}
              className="px-4 py-2 rounded-lg bg-white border text-gray-700 hover:bg-gray-100 disabled:opacity-40"
            >
              Następna →
            </button>
          </div>
        )}

        {/* Modal potwierdzenia akcji */}
        {pendingAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {ACTION_CONFIG[pendingAction.status].title}
              </h3>
              <p className="text-gray-600 mb-6">
                Zamówienie{" "}
                <span className="font-semibold">#{pendingAction.orderId}</span>
                {ACTION_CONFIG[pendingAction.status].warning && (
                  <>
                    <br />
                    <span className="text-red-600">
                      {ACTION_CONFIG[pendingAction.status].warning}
                    </span>
                  </>
                )}
              </p>

              {ACTION_CONFIG[pendingAction.status].email && (
                <label className="flex items-start gap-3 mb-8 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pendingAction.notify}
                    onChange={(e) =>
                      setPendingAction((prev) => ({
                        ...prev,
                        notify: e.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-gray-700">
                    Wyślij klientowi maila o zmianie statusu
                    {ACTION_CONFIG[pendingAction.status].email.hint && (
                      <span className="block text-sm text-gray-500 mt-1">
                        {ACTION_CONFIG[pendingAction.status].email.hint}
                      </span>
                    )}
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setPendingAction(null)}
                  disabled={isSubmitting}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Cofnij
                </button>
                <button
                  onClick={confirmAction}
                  disabled={isSubmitting}
                  className={`${ACTION_CONFIG[pendingAction.status].button} px-6 py-3 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50`}
                >
                  {isSubmitting ? "Zapisywanie..." : "Potwierdź"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
