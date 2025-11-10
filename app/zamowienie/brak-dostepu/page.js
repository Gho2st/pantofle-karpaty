// app/zamowienie/brak-dostepu/page.js
import Link from "next/link";

export const metadata = {
  title: "Brak dostępu do zamówienia | Pantofle Karpaty",
  robots: "noindex, nofollow, noarchive",
};

export default function NoAccessPage() {
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Brak dostępu</h1>
      <p className="text-gray-600 mb-6">
        Nie masz uprawnień do wyświetlenia tego zamówienia.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Jeśli to Twoje zamówienie – sprawdź email gdzie znajdziesz
        potwierdzenie.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Wróć na stronę główną
      </Link>
    </div>
  );
}
