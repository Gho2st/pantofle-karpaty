"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/cartContext";
import { toast } from "react-toastify";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  ShoppingCart,
  Tag,
  Check,
} from "lucide-react";
import {
  CARD,
  PRIMARY_BUTTON,
  PageShell,
  ProductThumb,
  SectionTitle,
  SummaryRow,
  formatPrice,
} from "../components/checkout/CheckoutUI";
import Collection from "../components/Collection";
import LoadingOverlay from "./LoadingOverlay";
import QuantityInput from "./QuantityInput";
import PendingPaymentBanner from "../components/PendingPaymentBanner";

export default function CartContent() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    checkAvailability,
    availabilityErrors,
    setAvailabilityErrors,
    availableQuantities,
    getCurrentPrice,
    loading: isCartLoading,
  } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState("paczkomat");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  const hasCheckedAvailability = useRef(false);

  useEffect(() => {
    if (cartItems.length > 0 && !hasCheckedAvailability.current) {
      hasCheckedAvailability.current = true;
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
      setAppliedDiscount(null);
      hasCheckedAvailability.current = false;
    }
  }, [cartItems, checkAvailability]);

  const handleFinalizeOrder = async (e) => {
    e.preventDefault();
    if (!isAvailable) {
      toast.error("Niektóre produkty są niedostępne");
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
    // Nawigacja bez przeładowania: koszyk jest już wczytany, więc strona
    // zamówienia nie miga pustym koszykiem, a "Wstecz" wraca do świeżego koszyka
    router.push(`/zamowienie?${params.toString()}`);
  };

  const calculateSubtotal = () => {
    return cartItems
      .reduce(
        (sum, item) => sum + getCurrentPrice(item.product) * item.quantity,
        0,
      )
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
    if (appliedDiscount.type === "free_delivery") {
      return calculateDeliveryCost();
    }
    if (appliedDiscount.type === "percentage") {
      return (subtotal * appliedDiscount.value) / 100;
    }
    return Math.min(appliedDiscount.value, subtotal);
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
        toast.error(data.error || "Nieprawidłowy kod");
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
    toast.info("Kod usunięty");
  };

  const subtotal = parseFloat(calculateSubtotal());
  const freeDeliveryProgress = Math.min(100, (subtotal / 200) * 100);
  const deliveryOptions = [
    { value: "paczkomat", label: "InPost Paczkomat", price: 13.99 },
    { value: "kurier", label: "Kurier InPost", price: 15.99 },
  ];
  const hasError = (item) =>
    availabilityErrors.some(
      (e) =>
        String(e.productId) === String(item.productId) && e.size === item.size,
    );

  return (
    <div className="relative">
      {isRedirecting && <LoadingOverlay text="Przechodzenie do kasy..." />}

      <PageShell step={1} title="Twój koszyk">
        <PendingPaymentBanner />

        {isCartLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300" />
            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              Twój koszyk jest pusty
            </h2>
            <p className="mt-2 text-gray-600">
              Czeka na coś wyjątkowego! Odkryj naszą ofertę i dodaj produkty.
            </p>
            <div className="mt-12 text-left">
              <SectionTitle className="text-center">Może coś z tego?</SectionTitle>
              <Collection />
            </div>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
            <div className="lg:col-span-2 space-y-6">
              {availabilityErrors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">
                      Problemy z dostępnością
                    </p>
                    <ul className="mt-1 list-disc list-inside text-sm text-red-700 space-y-1">
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
                      Zmień ilość lub usuń produkty.
                    </p>
                  </div>
                </div>
              )}

              <div className={CARD}>
                <SectionTitle>Produkty</SectionTitle>
                <ul className="divide-y divide-gray-100">
                  {cartItems.map((item) => {
                    const price = getCurrentPrice(item.product);
                    const isPromo = price < item.product.price;
                    return (
                      <li
                        key={item.id}
                        className={`flex gap-4 py-4 first:pt-0 last:pb-0 ${
                          hasError(item) ? "bg-red-50/60 -mx-2 px-2 rounded-xl" : ""
                        }`}
                      >
                        <ProductThumb
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          size="lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm sm:text-base font-medium text-gray-900 leading-snug">
                              {item.product.name}
                            </p>
                            <div className="text-right shrink-0">
                              <p className="text-sm sm:text-base font-semibold text-gray-900 tabular-nums">
                                {formatPrice(price * item.quantity)}
                              </p>
                              {isPromo && (
                                <p className="text-xs text-gray-400 line-through tabular-nums">
                                  {formatPrice(item.product.price * item.quantity)}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="mt-0.5 text-xs sm:text-sm text-gray-500">
                            Rozmiar {item.size} · {formatPrice(price)} / szt.
                          </p>
                          <div className="mt-3 flex items-center justify-between">
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
                              error={hasError(item)}
                            />
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Usuń
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className={CARD}>
                <SectionTitle>Dostawa</SectionTitle>
                <div className="space-y-3">
                  {deliveryOptions.map((option) => {
                    const selected = deliveryMethod === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red-600 has-[:focus-visible]:ring-offset-2 ${
                          selected
                            ? "border-red-600 bg-red-50/50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value={option.value}
                          checked={selected}
                          onChange={() => setDeliveryMethod(option.value)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected ? "border-red-600 bg-red-600" : "border-gray-300"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3 text-white" />}
                        </span>
                        <span className="font-medium text-gray-900">
                          {option.label}
                        </span>
                        <span className="ml-auto text-sm font-medium text-gray-900 tabular-nums">
                          {subtotal >= 200 ? (
                            <span className="text-green-700">Gratis</span>
                          ) : (
                            formatPrice(option.price)
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 lg:mt-0 lg:sticky lg:top-24">
              <div className={CARD}>
                <SectionTitle>Podsumowanie</SectionTitle>

                {/* Postęp do darmowej dostawy */}
                <div className="mb-5">
                  {subtotal >= 200 ? (
                    <p className="flex items-center gap-2 text-sm font-medium text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Masz darmową dostawę
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">
                      Brakuje{" "}
                      <strong className="tabular-nums">
                        {formatPrice(calculateRemainingForFreeDelivery())}
                      </strong>{" "}
                      do darmowej dostawy
                    </p>
                  )}
                  <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        subtotal >= 200 ? "bg-green-600" : "bg-red-600"
                      }`}
                      style={{ width: `${freeDeliveryProgress}%` }}
                    />
                  </div>
                </div>

                {!appliedDiscount ? (
                  <div className="flex gap-2 mb-5">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyDiscountCode()}
                      placeholder="Kod rabatowy"
                      className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      onClick={applyDiscountCode}
                      disabled={isApplyingCode}
                      className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {isApplyingCode ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Tag className="w-4 h-4" />
                      )}
                      Użyj
                    </button>
                  </div>
                ) : (
                  <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Kod <strong>{appliedDiscount.code}</strong>
                        </p>
                        <p className="text-xs text-green-700">
                          {appliedDiscount.type === "free_delivery"
                            ? "Darmowa dostawa"
                            : appliedDiscount.type === "percentage"
                              ? `-${appliedDiscount.value}%`
                              : `-${formatPrice(appliedDiscount.value)}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Usuń
                    </button>
                  </div>
                )}

                <div className="space-y-2.5">
                  <SummaryRow label="Produkty" value={formatPrice(subtotal)} />
                  {appliedDiscount && (
                    <SummaryRow
                      label="Rabat"
                      value={`-${formatPrice(calculateDiscountAmount())}`}
                      tone="discount"
                    />
                  )}
                  <SummaryRow
                    label="Dostawa"
                    value={
                      calculateDeliveryCost() === 0
                        ? "Gratis"
                        : formatPrice(calculateDeliveryCost())
                    }
                  />
                </div>
                <SummaryRow
                  label="Do zapłaty"
                  value={formatPrice(calculateTotal())}
                  tone="total"
                />

                <button
                  onClick={handleFinalizeOrder}
                  disabled={
                    isCheckingAvailability || !isAvailable || isRedirecting
                  }
                  className={`${PRIMARY_BUTTON} mt-6`}
                >
                  {(isRedirecting || isCheckingAvailability) && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  {isRedirecting
                    ? "Przechodzenie..."
                    : isCheckingAvailability
                      ? "Sprawdzanie dostępności..."
                      : "Przejdź do zamówienia"}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
}
