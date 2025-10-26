import React from "react";

// Prosty komponent spinnera (możesz go dostosować lub podmienić)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-6">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-700">Przetwarzanie płatności...</span>
  </div>
);

export default function CartSummary({
  cartItems,
  deliveryMethod,
  calculateSubtotal,
  calculateDeliveryCost,
  calculateTotal,
  isProcessing, // <-- Nowy prop
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Podsumowanie koszyka</h2>

      {/* Najpierw sprawdzamy stan przetwarzania. 
        Dopiero jeśli NIE jest przetwarzany, sprawdzamy czy jest pusty.
      */}
      {isProcessing ? (
        <LoadingSpinner />
      ) : cartItems.length === 0 ? (
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
