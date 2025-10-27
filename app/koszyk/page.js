"use client";
import { useEffect, useState } from "react"; // <-- WAŻNE: Dodano useState
import Image from "next/image";
import { useCart } from "@/app/context/cartContext";
import { ToastContainer, toast } from "react-toastify";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import Collection from "../components/homepage/Collection";

// 1. Komponent nakładki ładowania (bez zmian)
const LoadingOverlay = ({ text }) => (
  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    <span className="mt-4 text-lg text-gray-700 font-medium">{text}</span>
  </div>
);

// 2. Komponent szkieletu ładowania koszyka (bez zmian)
const CartSkeleton = () => (
  <div className="lg:grid lg:grid-cols-3 lg:gap-8">
    <div className="lg:col-span-2 space-y-6">
      <div className="flex gap-4 p-4 bg-white rounded-lg shadow-md animate-pulse">
        <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0"></div>
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-20 h-4 bg-gray-200 rounded self-center"></div>
      </div>
      <div className="p-6 bg-white rounded-lg shadow-md animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded mb-2"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
      <div className="p-6 bg-white rounded-lg shadow-lg animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="border-t border-gray-200 my-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);

// 3. Niestandardowy komponent do zmiany ilości (NOWA WERSJA)
const QuantityInput = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  error = false,
}) => {
  // Stan wewnętrzny do obsługi swobodnego pisania
  const [displayValue, setDisplayValue] = useState(value.toString());

  // Synchronizacja, gdy 'value' z koszyka się zmieni
  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleDecrease = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue); // Bezpośrednio wywołujemy zmianę w koszyku
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue); // Bezpośrednio wywołujemy zmianę w koszyku
  };

  // Pozwala na wpisywanie i usuwanie (backspace)
  const handleDirectChange = (e) => {
    const val = e.target.value;
    // Pozwól na pusty ciąg lub tylko cyfry
    if (val === "" || /^\d+$/.test(val)) {
      setDisplayValue(val);
    }
  };

  // Walidacja przy utracie fokusa (kliknięcie obok)
  const handleBlur = () => {
    let num = parseInt(displayValue, 10);

    if (isNaN(num) || num < min) {
      num = min; // Resetuj do minimum, jeśli puste lub poniżej
    } else if (num > max) {
      num = max; // Resetuj do maksimum, jeśli powyżej
    }

    setDisplayValue(num.toString()); // Zaktualizuj wyświetlaną wartość
    if (num !== value) {
      onChange(num); // Wyślij zwalidowaną zmianę do koszyka
    }
  };

  // Nowe, zunifikowane style
  const containerClass = `flex items-center rounded-md border overflow-hidden transition-all ${
    error ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"
  } ${
    disabled ? "bg-gray-100" : "bg-white"
  } focus-within:ring-2 focus-within:ring-red-300 focus-within:border-red-300`;

  const buttonClass =
    "flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  const inputClass =
    "w-12 h-8 text-center p-1 text-gray-900 focus:outline-none disabled:bg-gray-100";

  return (
    <div className={containerClass}>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className={`${buttonClass} border-r border-gray-300`}
        aria-label="Zmniejsz ilość"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number" // Nadal 'number' dla klawiatury mobilnej
        value={displayValue}
        onChange={handleDirectChange}
        onBlur={handleBlur} // Walidacja przy utracie fokusa
        min={min}
        max={max}
        disabled={disabled}
        className={inputClass}
        aria-label="Ilość"
      />
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className={`${buttonClass} border-l border-gray-300`}
        aria-label="Zwiększ ilość"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

// 4. Główny komponent Checkout (bez zmian w logice, tylko używa nowego QuantityInput)
export default function Checkout() {
  const {
    cartItems,
    loading,
    updateQuantity,
    removeFromCart,
    checkAvailability,
    availabilityErrors,
    setAvailabilityErrors,
    availableQuantities,
  } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState("paczkomat");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0 && !loading) {
      const verifyStock = async () => {
        setIsCheckingAvailability(true);
        const available = await checkAvailability();
        setIsAvailable(available);
        setIsCheckingAvailability(false);
      };
      verifyStock();
    } else if (cartItems.length === 0) {
      setIsAvailable(true);
      setAvailabilityErrors([]);
    }
  }, [cartItems, checkAvailability, setAvailabilityErrors, loading]);

  const handleFinalizeOrder = async (e) => {
    e.preventDefault();
    if (!isAvailable) {
      toast.error(
        "Nie można sfinalizować zamówienia: niektóre produkty są niedostępne",
        {
          position: "bottom-right",
          autoClose: 3000,
        }
      );
      return;
    }

    setIsRedirecting(true);
    window.location.href = `/zamowienie?deliveryMethod=${deliveryMethod}&deliveryCost=${calculateDeliveryCost().toFixed(
      2
    )}`;
  };

  const calculateSubtotal = () => {
    return cartItems
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      .toFixed(2);
  };

  const calculateDeliveryCost = () => {
    const subtotal = parseFloat(calculateSubtotal());
    if (subtotal >= 200) return 0;
    return deliveryMethod === "paczkomat" ? 13.99 : 15.99;
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const deliveryCost = calculateDeliveryCost();
    return (subtotal + deliveryCost).toFixed(2);
  };

  const calculateRemainingForFreeDelivery = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return subtotal < 200 ? (200 - subtotal).toFixed(2) : 0;
  };

  const calculateSavings = () => {
    const subtotal = parseFloat(calculateSubtotal());
    if (subtotal >= 200) {
      return deliveryMethod === "paczkomat" ? 13.99 : 15.99;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-16 lg:my-24 px-4">
        <h1 className="text-3xl font-bold mb-8">Twój Koszyk</h1>
        <CartSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-16 lg:my-24 px-4 relative">
      {isRedirecting && <LoadingOverlay text="Przechodzenie do kasy..." />}

      <h1 className="text-3xl font-bold mb-8">Twój Koszyk</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-300" />
          <h2 className="mt-6 text-2xl font-semibold text-gray-800">
            Twój koszyk jest pusty
          </h2>
          <p className="mt-2 text-gray-600">
            Czeka na coś wyjątkowego! Odkryj naszą ofertę i dodaj produkty,
            które pokochasz!
          </p>
          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-6">Może coś z tego?</h3>
            <Collection />
          </div>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* --- Lewa kolumna: Produkty i Dostawa --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sekcja błędów dostępności */}
            {availabilityErrors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-md flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-red-800 mb-2">
                    Problemy z dostępnością produktów
                  </h2>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    {availabilityErrors.map((error, index) => (
                      <li key={index}>
                        {error.productId && error.size
                          ? `Produkt ${
                              error.product?.name || error.productId
                            }, rozmiar ${error.size}: ${error.message}`
                          : error.message}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-red-600">
                    Zmień ilość lub usuń produkty, aby kontynuować.
                  </p>
                </div>
              </div>
            )}

            {/* Lista produktów */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow-md transition-all ${
                    availabilityErrors.some(
                      (e) =>
                        String(e.productId) === String(item.productId) &&
                        e.size === item.size
                    )
                      ? "border-2 border-red-500 ring-2 ring-red-200"
                      : "border border-transparent"
                  }`}
                >
                  <div className="w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.product.images?.[0] || "/placeholder.png"}
                      width={96}
                      height={96}
                      alt={item.product.name}
                      className="object-cover rounded-md w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold truncate">
                      {item.product.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Rozmiar: {item.size}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cena: {item.product.price.toFixed(2)} PLN
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-sm text-gray-600">Ilość:</label>

                      {/* Komponent QuantityInput jest używany tutaj bez zmian */}
                      <QuantityInput
                        value={item.quantity}
                        onChange={(newQuantity) => {
                          updateQuantity(item.id, newQuantity);
                        }}
                        min={1}
                        max={
                          availableQuantities[
                            `${item.productId}-${item.size}`
                          ] || 99
                        }
                        error={availabilityErrors.some(
                          (e) =>
                            String(e.productId) === String(item.productId) &&
                            e.size === item.size
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
                    <p className="text-lg font-medium text-gray-800">
                      {(item.product.price * item.quantity).toFixed(2)} PLN
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-0 sm:mt-2 text-gray-500 hover:text-red-600 transition-colors p-1"
                      title="Usuń produkt"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sekcja wyboru metody dostawy (karty) */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Metoda dostawy</h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    deliveryMethod === "paczkomat"
                      ? "border-red-600 border-2 shadow-sm"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="paczkomat"
                    checked={deliveryMethod === "paczkomat"}
                    onChange={() => setDeliveryMethod("paczkomat")}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-gray-700 font-medium">
                    InPost Paczkomat
                  </span>
                  <span className="ml-auto text-gray-800 font-medium">
                    {parseFloat(calculateSubtotal()) >= 200
                      ? "Darmowa"
                      : "13,99 PLN"}
                  </span>
                </label>
                <label
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    deliveryMethod === "kurier"
                      ? "border-red-600 border-2 shadow-sm"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="kurier"
                    checked={deliveryMethod === "kurier"}
                    onChange={() => setDeliveryMethod("kurier")}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-gray-700 font-medium">
                    InPost Kurier
                  </span>
                  <span className="ml-auto text-gray-800 font-medium">
                    {parseFloat(calculateSubtotal()) >= 200
                      ? "Darmowa"
                      : "15,99 PLN"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* --- Prawa kolumna: Podsumowanie (lepkie na desktopie) --- */}
          <div className="lg:col-span-1 mt-6 lg:mt-0 lg:sticky lg:top-24 h-fit">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">
                Podsumowanie zamówienia
              </h2>

              {parseFloat(calculateSubtotal()) >= 200 ? (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium text-sm">
                    Gratulacje! Oszczędzasz {calculateSavings().toFixed(2)} PLN
                    na dostawie!
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-700 font-medium text-sm">
                    Dodaj za {calculateRemainingForFreeDelivery()} PLN do
                    darmowej dostawy!
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Suma produktów:</span>
                  <span className="font-medium text-gray-800">
                    {calculateSubtotal()} PLN
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Koszt dostawy:</span>
                  <span className="font-medium text-gray-800">
                    {calculateDeliveryCost().toFixed(2)} PLN
                  </span>
                </div>
                {parseFloat(calculateSubtotal()) >= 200 && (
                  <div className="flex justify-between text-green-600">
                    <span>Oszczędność (dostawa):</span>
                    <span className="font-medium">
                      -{calculateSavings().toFixed(2)} PLN
                    </span>
                  </div>
                )}
              </div>

              <hr className="my-4 border-gray-200" />

              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Do zapłaty:</span>
                <span>{calculateTotal()} PLN</span>
              </div>

              <button
                onClick={handleFinalizeOrder}
                disabled={
                  isCheckingAvailability || !isAvailable || isRedirecting
                }
                className={`mt-6 w-full flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-red-700 transition-all ${
                  isCheckingAvailability || !isAvailable || isRedirecting
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-lg"
                }`}
              >
                {isRedirecting || isCheckingAvailability ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                {isRedirecting
                  ? "Przechodzenie..."
                  : isCheckingAvailability
                  ? "Sprawdzanie..."
                  : "Przejdź do finalizacji"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
