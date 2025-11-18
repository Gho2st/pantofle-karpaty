import React from "react";

export default function TraditionalPaymentInstructions({ order }) {
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
          <strong>Nazwa odbiorcy:</strong> Firma KARPATY Maciej Wideł
        </li>
        <li>
          <strong>Numer konta (PKO BP):</strong> PL 06 1020 3453 0000 8602 0009
          7758
        </li>
        <li>
          <strong>Kwota:</strong> {order.totalAmount.toFixed(2)} PLN
        </li>
        <li>
          <strong>Tytuł przelewu:</strong> Zamówienie #{order.id}
        </li>
      </ul>
      <p className="mt-2">
        Po zaksięgowaniu płatności Twoje zamówienie zostanie zrealizowane.
        Paragon fiskalny otrzymasz w paczce. Faktura VAT (jeśli wybrano)
        zostanie przesłana na podany adres email (powyżej 450zł).
      </p>
    </div>
  );
}
