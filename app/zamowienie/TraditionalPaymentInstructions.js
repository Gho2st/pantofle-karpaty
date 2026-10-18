import React from "react";
import { BANK_TRANSFER, transferTitle } from "@/app/lib/bankTransfer";

export default function TraditionalPaymentInstructions({ order }) {
  if (!order || order.paymentMethod !== "traditional") {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-md">
      <h3 className="text-lg font-semibold mb-2">
        Instrukcje przelewu tradycyjnego
      </h3>
      <p>
        Proszę dokonać przelewu na poniższe dane w ciągu{" "}
        {BANK_TRANSFER.deadline}:
      </p>
      <ul className="list-disc ml-5 mt-2">
        <li>
          <strong>Nazwa odbiorcy:</strong> {BANK_TRANSFER.recipient}
        </li>
        <li>
          <strong>Numer konta ({BANK_TRANSFER.bank}):</strong>{" "}
          {BANK_TRANSFER.account}
        </li>
        <li>
          <strong>Kwota:</strong> {order.totalAmount.toFixed(2)} PLN
        </li>
        <li>
          <strong>Tytuł przelewu:</strong> {transferTitle(order.id)}
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
