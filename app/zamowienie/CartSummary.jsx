"use client";
import React from "react";
import { useCart } from "@/app/context/cartContext";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-6">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-700">Przetwarzanie płatności...</span>
  </div>
);

export default function CartSummary({
  cartItems,
  deliveryMethod,
  calculateSubtotal, // ← teraz używa getCurrentPrice
  calculateDeliveryCost,
  calculateTotal, // ← używa poprawnej sumy
  isProcessing,
  discountCode,
  discountValue = 0,
}) {
  const { getCurrentPrice } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Podsumowanie koszyka</h2>

      {isProcessing ? (
        <LoadingSpinner />
      ) : cartItems.length === 0 ? (
        <p className="text-gray-600">Twój koszyk jest pusty.</p>
      ) : (
        <>
          {cartItems.map((item) => {
            const currentPrice = getCurrentPrice(item.product);
            const itemTotal = currentPrice * item.quantity;
            const isPromo = currentPrice < item.product.price;

            return (
              <div
                key={`${item.product.id}-${item.size}`}
                className="flex justify-between mb-2 text-sm"
              >
                <span>
                  {item.product.name} (Rozm. {item.size}, Ilość: {item.quantity}
                  )
                  {isPromo && (
                    <span className="text-red-600 text-xs ml-1 font-medium">
                      {" "}
                      (-
                      {Math.round(
                        ((item.product.price - currentPrice) /
                          item.product.price) *
                          100
                      )}
                      %)
                    </span>
                  )}
                </span>
                <span className={isPromo ? "text-red-600 font-medium" : ""}>
                  {itemTotal.toFixed(2)} PLN
                </span>
              </div>
            );
          })}

          <div className="border-t pt-3 mt-4 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Suma produktów:</span>
              <span>{calculateSubtotal()} PLN</span>
            </div>

            {discountCode && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Rabat ({discountCode}):</span>
                <span>-{discountValue.toFixed(2)} PLN</span>
              </div>
            )}

            <div className="flex justify-between text-gray-700">
              <span>Koszt dostawy ({deliveryMethod}):</span>
              <span>{calculateDeliveryCost().toFixed(2)} PLN</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Razem do zapłaty:</span>
              <span>{calculateTotal()} PLN</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
