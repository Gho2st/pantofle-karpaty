// app/zamowienie/brak-dostepu/page.js
import Link from "next/link";
import { CARD, PRIMARY_BUTTON } from "@/app/components/checkout/CheckoutUI";

export const metadata = {
  title: "Brak dostępu do zamówienia | Pantofle Karpaty",
  robots: "noindex, nofollow, noarchive",
};

export default function NoAccessPage() {
  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className={`${CARD} text-center`}>
        <h1 className="text-xl font-semibold text-gray-900 mb-3">
          Brak dostępu
        </h1>
        <p className="text-gray-600 mb-3">
          Nie masz uprawnień do wyświetlenia tego zamówienia.
        </p>
        <p className="text-sm text-gray-500">
          Jeśli to Twoje zamówienie i masz konto — zaloguj się. Szczegóły
          zamówienia znajdziesz też w mailu z potwierdzeniem.
        </p>
        <Link href="/" className={`${PRIMARY_BUTTON} mt-6`}>
          Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
}
