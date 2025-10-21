// app/components/CartSummary.jsx
import React from "react";

export default function CartSummary({
  cartItems,
  deliveryMethod,
  calculateSubtotal,
  calculateDeliveryCost,
  calculateTotal,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Podsumowanie koszyka</h2>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Twój koszyk jest pusty.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between mb-2">
              <span>
                {item.product.name} (Rozm. {item.size}, Ilość: {item.quantity})
              </span>
              <span>
                {((item.product.price || 0) * item.quantity).toFixed(2)} PLN
              </span>
            </div>
          ))}
          <div className="border-t pt-2 mt-4">
            <div className="flex justify-between">
              <span>Suma produktów:</span>
              <span>{calculateSubtotal()} PLN</span>
            </div>
            <div className="flex justify-between">
              <span>Koszt dostawy ({deliveryMethod}):</span>
              <span>{calculateDeliveryCost().toFixed(2)} PLN</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Razem:</span>
              <span>{calculateTotal()} PLN</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
