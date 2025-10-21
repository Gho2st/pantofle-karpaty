import React from "react";

// ZMIANA 1: Komponent przyjmuje teraz jeden prop: `order`
export default function TraditionalPaymentInstructions({ order }) {
  // ZMIANA 2: Sprawdzamy dane z obiektu `order`
  // (Założyłem, że w bazie zapisujesz tę metodę jako "traditional")
  if (!order || order.paymentMethod !== "traditional") {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-semibold mb-2">
        Instrukcje przelewu tradycyjnego
      </h3>
      <p>Proszę dokonać przelewu na poniższe dane w ciągu 7 dni roboczych:</p>
      <ul className="list-disc ml-5 mt-2">
        <li>
          <strong>Nazwa odbiorcy:</strong> Twoja Firma Sp. z o.o.
        </li>
        <li>
          <strong>Numer konta:</strong> PL12 3456 7890 1234 5678 9012 3456
        </li>
        <li>
          {/* ZMIANA 3: Używamy `order.totalAmount` zamiast funkcji `calculateTotal` */}
          <strong>Kwota:</strong> {order.totalAmount.toFixed(2)} PLN
        </li>
        <li>
          {/* ZMIANA 4: Używamy `order.id` zamiast `orderId` */}
          <strong>Tytuł przelewu:</strong> Zamówienie #{order.id}
        </li>
      </ul>
      <p className="mt-2">
        Po zaksięgowaniu płatności Twoje zamówienie zostanie zrealizowane.
        Faktura VAT (jeśli wybrano) zostanie przesłana na podany adres email.
      </p>
    </div>
  );
}
