"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/cartContext";
import { ToastContainer, toast } from "react-toastify";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  ShoppingCart,
  Tag,
} from "lucide-react";
import Collection from "../components/homepage/Collection";
import LoadingOverlay from "./LoadingOverlay";
import CartSkeleton from "./CartSkeleton";
import QuantityInput from "./QuantityInput";

export default function CartContent() {
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

  // === Kod rabatowy ===
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null); // { code, type, value, message }
  const [isApplyingCode, setIsApplyingCode] = useState(false);

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
      setAppliedDiscount(null); // Reset przy pustym koszyku
    }
  }, [cartItems, checkAvailability, setAvailabilityErrors, loading]);

  const handleFinalizeOrder = async (e) => {
    e.preventDefault();
    if (!isAvailable) {
      toast.error(
        "Nie można sfinalizować zamówienia: niektóre produkty są niedostępne",
        { position: "bottom-right", autoClose: 3000 }
      );
      return;
    }

    setIsRedirecting(true);
    const params = new URLSearchParams({
      deliveryMethod,
      deliveryCost: calculateDeliveryCost().toFixed(2),
    });
    if (appliedDiscount) {
      params.append("discountCode", appliedDiscount.code);
      params.append("discountValue", calculateDiscountAmount().toFixed(2));
    }
    window.location.href = `/zamowienie?${params.toString()}`;
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

  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    const subtotal = parseFloat(calculateSubtotal());
    if (appliedDiscount.type === "percentage") {
      return (subtotal * appliedDiscount.value) / 100;
    }
    return Math.min(appliedDiscount.value, subtotal); // nie więcej niż subtotal
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const deliveryCost = calculateDeliveryCost();
    const discount = calculateDiscountAmount();
    return (subtotal + deliveryCost - discount).toFixed(2);
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

  // === Aplikowanie kodu rabatowego ===
  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast.error("Wpisz kod rabatowy");
      return;
    }

    setIsApplyingCode(true);
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode.toUpperCase().trim(),
          subtotal: parseFloat(calculateSubtotal()),
        }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedDiscount({
          code: discountCode.toUpperCase().trim(),
          type: data.type,
          value: data.value,
          message: data.message,
        });
        toast.success(`Zastosowano kod: ${discountCode.toUpperCase()}`);
      } else {
        toast.error(data.error || "Nieprawidłowy kod rabatowy");
        setAppliedDiscount(null);
      }
    } catch (err) {
      toast.error("Błąd połączenia");
      setAppliedDiscount(null);
    } finally {
      setIsApplyingCode(false);
      setDiscountCode("");
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    toast.info("Kod rabatowy usunięty");
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
          {/* Lewa kolumna */}
          <div className="lg:col-span-2 space-y-6">
            {availabilityErrors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-md flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
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
                  <div className="w-24 h-24 shrink-0">
                    <Image
                      src={item.product.images?.[0] || "/placeholder.png"}
                      width={96}
                      height={96}
                      alt={item.product.name}
                      className="object-cover rounded-md w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold">
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
                      <QuantityInput
                        value={item.quantity}
                        onChange={(newQuantity) =>
                          updateQuantity(item.id, newQuantity)
                        }
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
                      className="mt-0 sm:mt-2 text-gray-500 hover:text-red-600 transition-colors p-0.5"
                      title="Usuń produkt"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Metoda dostawy */}
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

          {/* Prawa kolumna – Podsumowanie */}
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

                {/* Kod rabatowy */}
                {!appliedDiscount ? (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && applyDiscountCode()
                      }
                      placeholder="Kod rabatowy"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={applyDiscountCode}
                      disabled={isApplyingCode}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isApplyingCode ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Tag className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Kod: <strong>{appliedDiscount.code}</strong>
                        </p>
                        <p className="text-xs text-green-700">
                          {appliedDiscount.type === "percentage"
                            ? `-${appliedDiscount.value}%`
                            : `-${appliedDiscount.value.toFixed(2)} PLN`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Usuń
                    </button>
                  </div>
                )}

                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Rabat:</span>
                    <span className="font-medium">
                      -{calculateDiscountAmount().toFixed(2)} PLN
                    </span>
                  </div>
                )}

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
