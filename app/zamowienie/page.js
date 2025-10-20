import { Suspense } from "react";
import CheckoutForm from "./CheckoutForm";
import Link from "next/link";

export default function CheckoutPage() {
  return (
    <div className="max-w-4xl mx-auto my-24 px-4">
      <h1 className="text-3xl font-bold mb-6">Finalizacja zamówienia</h1>
      <Suspense
        fallback={
          <div className="p-4 border rounded-md">Ładowanie formularza...</div>
        }
      >
        <CheckoutForm />
      </Suspense>
      <Link href="/koszyk" className="text-blue-500 hover:underline">
        ← Wróć do koszyka
      </Link>
    </div>
  );
}
