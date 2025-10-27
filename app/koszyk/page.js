"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/cartContext";
import { ToastContainer, toast } from "react-toastify";
import { CheckCircle, AlertCircle } from "lucide-react";
import Collection from "../components/homepage/Collection";

// 1. Komponent ładowania
const LoadingOverlay = ({ text }) => (
  <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 rounded-lg">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    <span className="mt-4 text-lg text-gray-700 font-medium">{text}</span>
  </div>
);

export default function Checkout() {
  const {
    cartItems,
    loading, // To jest loading z useCart() do pobierania koszyka
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

  // 2. Nowy stan do obsługi przekierowania
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0) {
      const verifyStock = async () => {
        setIsCheckingAvailability(true);
        const available = await checkAvailability();
        setIsAvailable(available);
        setIsCheckingAvailability(false);
      };
      verifyStock();
    } else {
      setIsAvailable(true);
      setAvailabilityErrors([]);
    }
  }, [cartItems, checkAvailability, setAvailabilityErrors]);

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

    // 3. Ustaw stan ładowania PRZED przekierowaniem
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

  // Ten stan 'loading' z useCart() jest do pierwszego ładowania koszyka
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-24 px-4">
        <h1 className="text-3xl font-bold mb-6">Koszyk</h1>
        <p className="text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  return (
    // 4. Dodaj 'relative' do głównego kontenera
    <div className="max-w-7xl mx-auto my-16 lg:my-24 px-4 relative">
      {/* 5. Dodaj warunkowo nakładkę ładowania */}
      {isRedirecting && <LoadingOverlay text="Przechodzenie do kasy..." />}

      <h1 className="text-3xl font-bold mb-6">Koszyk</h1>
      {cartItems.length === 0 ? (
        <div>
          <p className="text-gray-600">
            Twój koszyk jest pusty. Czeka na coś wyjątkowego! Odkryj naszą
            ofertę i dodaj produkty, które pokochasz!
          </p>
          <Collection />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sekcja błędów dostępności */}
          {availabilityErrors.length > 0 && (
            <div className="p-4 bg-red-100 rounded-lg shadow-md flex items-start space-x-2">
              <AlertCircle className="w-6 h-6 text-red-700" />
              <div>
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  Problemy z dostępnością produktów
                </h2>
                <ul className="list-disc list-inside text-red-700">
                  {availabilityErrors.map((error, index) => (
                    <li key={index} className="mb-1">
                      {error.productId && error.size
                        ? `Produkt ${
                            error.product?.name || error.productId
                          }, rozmiar ${error.size}: ${error.message}`
                        : error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Lista produktów */}
          {cartItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-6 p-4 bg-white rounded-lg shadow-md ${
                availabilityErrors.some(
                  (e) =>
                    String(e.productId) === String(item.productId) &&
                    e.size === item.size
                )
                  ? "border-2 border-red-500"
                  : ""
              }`}
            >
              {/* ... zawartość mapowania itemu (Image, nazwa, ilość itd.) ... */}
              <div className="w-24 h-24">
                <Image
                  src={item.product.images?.[0] || "/placeholder.png"}
                  width={96}
                  height={96}
                  alt={item.product.name}
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.product.name}</h2>
                <p className="text-gray-600">Rozmiar: {item.size}</p>
                <p className="text-gray-600">
                  Cena: {item.product.price.toFixed(2)} PLN
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-gray-600">Ilość:</label>
                  <input
                    type="number"
                    min="1"
                    max={
                      availableQuantities[`${item.productId}-${item.size}`] ||
                      100
                    }
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value);
                      if (!isNaN(newQuantity)) {
                        updateQuantity(item.id, newQuantity);
                      }
                    }}
                    className={`border rounded-md p-1 w-16 ${
                      availabilityErrors.some(
                        (e) =>
                          String(e.productId) === String(item.productId) &&
                          e.size === item.size
                      )
                        ? "border-2 border-red-500"
                        : "border-gray-300"
                    }`}
                    title={
                      availableQuantities[`${item.productId}-${item.size}`]
                        ? `Maksymalna ilość: ${
                            availableQuantities[
                              `${item.productId}-${item.size}`
                            ]
                          }`
                        : ""
                    }
                  />
                  {availableQuantities[`${item.productId}-${item.size}`] >=
                    0 && (
                    <p className="text-gray-600 text-sm">
                      Maks. dostępna ilość:{" "}
                      {availableQuantities[`${item.productId}-${item.size}`]}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-lg font-medium">
                  {(item.product.price * item.quantity).toFixed(2)} PLN
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="mt-2 text-red-500 hover:text-red-700"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}

          {/* Sekcja wyboru metody dostawy */}
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Metoda dostawy</h2>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="paczkomat"
                  checked={deliveryMethod === "paczkomat"}
                  onChange={() => setDeliveryMethod("paczkomat")}
                  className="h-4 w-4 text-red-600"
                />
                <span className="text-gray-700">
                  InPost Paczkomat -{" "}
                  {parseFloat(calculateSubtotal()) >= 200
                    ? "Darmowa"
                    : "13,99 PLN"}
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="kurier"
                  checked={deliveryMethod === "kurier"}
                  onChange={() => setDeliveryMethod("kurier")}
                  className="h-4 w-4 text-red-600"
                />
                <span className="text-gray-700">
                  InPost Kurier -{" "}
                  {parseFloat(calculateSubtotal()) >= 200
                    ? "Darmowa"
                    : "15,99 PLN"}
                </span>
              </label>
            </div>
            {parseFloat(calculateSubtotal()) >= 200 ? (
              <div className="mt-4 p-3 bg-green-200 rounded-md flex items-center space-x-2 transition-opacity duration-300 opacity-100">
                <CheckCircle className="w-6 h-6 text-green-700" />
                <p className="text-green-700 font-medium">
                  Gratulacje! Oszczędzasz {calculateSavings().toFixed(2)} PLN
                  dzięki darmowej dostawie!
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-yellow-200 rounded-md flex items-center space-x-2 transition-opacity duration-300 opacity-100">
                <AlertCircle className="w-6 h-6 text-yellow-700" />
                <p className="text-yellow-700 font-medium">
                  Dodaj produkty za {calculateRemainingForFreeDelivery()} PLN,
                  aby uzyskać darmową dostawę!
                </p>
              </div>
            )}
          </div>

          {/* Podsumowanie */}
          <div className="flex justify-end">
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-lg font-medium">
                Suma produktów: {calculateSubtotal()} PLN
              </p>
              <p className="text-lg font-medium">
                Koszt dostawy: {calculateDeliveryCost().toFixed(2)} PLN
              </p>
              {parseFloat(calculateSubtotal()) >= 200 && (
                <p className="text-lg font-medium text-green-700">
                  Oszczędność: {calculateSavings().toFixed(2)} PLN
                </p>
              )}
              <p className="text-xl font-bold">
                Całkowita suma: {calculateTotal()} PLN
              </p>
              <button
                onClick={handleFinalizeOrder}
                // 6. Zaktualizuj 'disabled' i tekst przycisku
                disabled={
                  isCheckingAvailability || !isAvailable || isRedirecting
                }
                className={`mt-4 block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 text-center ${
                  isCheckingAvailability || !isAvailable || isRedirecting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isRedirecting
                  ? "Przechodzenie..."
                  : isCheckingAvailability
                  ? "Sprawdzanie dostępności..."
                  : "Przejdź do finalizacji zamówienia"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
