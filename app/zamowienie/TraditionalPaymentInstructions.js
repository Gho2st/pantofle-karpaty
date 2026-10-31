"use client";
import { useState } from "react";
import { Copy, Check, Landmark } from "lucide-react";
import { BANK_TRANSFER, transferTitle } from "@/app/lib/bankTransfer";

function CopyRow({ label, value, copyValue }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // brak dostępu do schowka (np. starsza przeglądarka) — dane i tak są widoczne
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-amber-200/70 last:border-b-0">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900 break-words">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-amber-300 bg-white hover:bg-amber-100 transition-colors"
        aria-label={`Kopiuj: ${label}`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-600" /> Skopiowano
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" /> Kopiuj
          </>
        )}
      </button>
    </div>
  );
}

export default function TraditionalPaymentInstructions({ order }) {
  if (!order || order.paymentMethod !== "traditional") {
    return null;
  }

  const amount = order.totalAmount.toFixed(2);

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Landmark className="h-5 w-5 text-amber-700" />
        Dane do przelewu
      </h3>
      <p className="text-sm text-gray-600 mt-1 mb-2">
        Prosimy o wpłatę w ciągu {BANK_TRANSFER.deadline}. Wyślemy zamówienie
        zaraz po zaksięgowaniu przelewu. Te dane wysłaliśmy też mailem.
      </p>

      <CopyRow label="Odbiorca" value={BANK_TRANSFER.recipient} />
      <CopyRow
        label={`Numer konta (${BANK_TRANSFER.bank})`}
        value={BANK_TRANSFER.account}
        copyValue={BANK_TRANSFER.account.replace(/\s/g, "")}
      />
      <CopyRow label="Kwota" value={`${amount} zł`} copyValue={amount} />
      <CopyRow label="Tytuł przelewu" value={transferTitle(order.id)} />

      <p className="text-xs text-gray-500 mt-3">
        Paragon fiskalny otrzymasz w paczce. Faktura VAT (jeśli wybrano)
        zostanie przesłana na podany adres e-mail (powyżej 450 zł).
      </p>
    </div>
  );
}
