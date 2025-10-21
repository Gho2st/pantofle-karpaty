"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/cartContext";
import { ToastContainer } from "react-toastify";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Checkout() {
  const { cartItems, loading, fetchCart, updateQuantity, removeFromCart } =
    useCart();
  const [deliveryMethod, setDeliveryMethod] = useState("paczkomat"); // Domyślna metoda dostawy

  useEffect(() => {
    fetchCart(); // Pobierz koszyk (z bazy lub localStorage)
  }, [fetchCart]);

  // Oblicz sumę produktów w koszyku
  const calculateSubtotal = () => {
    return cartItems
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      .toFixed(2);
  };

  // Oblicz koszt dostawy
  const calculateDeliveryCost = () => {
    const subtotal = parseFloat(calculateSubtotal());
    if (subtotal >= 200) return 0; // Darmowa dostawa powyżej 200 PLN
    return deliveryMethod === "paczkomat" ? 13.99 : 15.99;
  };

  // Oblicz całkowitą sumę (produkty + dostawa)
  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const deliveryCost = calculateDeliveryCost();
    return (subtotal + deliveryCost).toFixed(2);
  };

  // Oblicz brakującą kwotę do darmowej dostawy
  const calculateRemainingForFreeDelivery = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return subtotal < 200 ? (200 - subtotal).toFixed(2) : 0;
  };

  // Oblicz oszczędność dzięki darmowej dostawie
  const calculateSavings = () => {
    const subtotal = parseFloat(calculateSubtotal());
    if (subtotal >= 200) {
      return deliveryMethod === "paczkomat" ? 13.99 : 15.99;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-24 px-4">
        <h1 className="text-3xl font-bold mb-6">Koszyk</h1>
        <p className="text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-24 px-4">
      <h1 className="text-3xl font-bold mb-6">Koszyk</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Twój koszyk jest pusty.</p>
      ) : (
        <div className="space-y-6">
          {/* Lista produktów */}
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-6 p-4 bg-white rounded-lg shadow-md"
            >
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
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="border border-gray-300 rounded-md p-1 w-16"
                  />
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
            {/* Informacja o darmowej dostawie lub brakującej kwocie */}
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
              <Link
                href={{
                  pathname: "/zamowienie",
                  query: {
                    deliveryMethod,
                    deliveryCost: calculateDeliveryCost().toFixed(2),
                  },
                }}
                className="mt-4 block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 text-center"
              >
                Przejdź do finalizacji zamówienia
              </Link>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
