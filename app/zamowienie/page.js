import { Suspense } from "react";
import CheckoutForm from "./CheckoutForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "../lib/prisma";

export const metadata = {
  title: "Finalizacja zamówienia | Pantofle Karpaty",
  description:
    "Złóż zamówienie. Bezpieczne płatności, szybka dostawa. Pantofle Karpaty.",
  alternates: {
    canonical: "/zamowienie",
  },
  robots: "noindex, nofollow", // Prywatna strona – NIE w Google
};

// === Pobierz dane użytkownika i adres główny ===
async function getUserData(email) {
  if (!email) return { user: null, primaryAddress: null };

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        addresses: {
          orderBy: { isPrimary: "desc" }, // Najpierw główny
        },
      },
    });

    if (!user) return { user: null, primaryAddress: null };

    const primaryAddress =
      user.addresses.find((addr) => addr.isPrimary) ||
      user.addresses[0] ||
      null;

    return { user, primaryAddress };
  } catch (error) {
    console.error("Błąd podczas pobierania danych użytkownika:", error);
    return { user: null, primaryAddress: null };
  }
}

export default async function CheckoutPage() {
  // 1. Sesja (server-side)
  const session = await getServerSession(authOptions);

  // 2. Dane użytkownika i adres
  const { user, primaryAddress } = await getUserData(session?.user?.email);

  return (
    <div className="max-w-4xl mx-auto my-12 2xl:my-24 px-4">
      <h1 className="text-2xl lg:text-3xl font-bold text-center mb-8">
        Finalizacja zamówienia
      </h1>

      {/* Suspense – ładuje komponent kliencki */}
      <Suspense
        fallback={
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600">
            Ładowanie formularza...
          </div>
        }
      >
        {/* Przekaż dane do CheckoutForm */}
        <CheckoutForm
          primaryAddress={primaryAddress}
          userName={user?.name || session?.user?.name || ""}
          userEmail={session?.user?.email || ""}
        />
      </Suspense>
    </div>
  );
}
