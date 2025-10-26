// app/components/PaymentMethodSelector.jsx
import React from "react";

export default function PaymentMethodSelector({
  paymentMethod,
  handlePaymentMethodChange,
}) {
  return (
    <>
      <h3 className="text-lg font-semibold mb-2">Metoda płatności</h3>
      <div className="flex flex-col gap-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="stripe"
            checked={paymentMethod === "stripe"}
            onChange={handlePaymentMethodChange}
            className="mr-2"
          />
          Stripe
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="paymentMethod"
            value="traditional"
            checked={paymentMethod === "traditional"}
            onChange={handlePaymentMethodChange}
            className="mr-2"
          />
          Przelew tradycyjny
        </label>
      </div>
    </>
  );
}
