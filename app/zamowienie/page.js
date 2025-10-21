import { Suspense } from "react";
import CheckoutForm from "./CheckoutForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "../lib/prisma";

async function getUserData(email) {
  if (!email) return { user: null, primaryAddress: null };

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        addresses: {
          orderBy: {
            isPrimary: "desc", // Najpierw te z `isPrimary: true`
          },
        },
      },
    });

    if (!user) return { user: null, primaryAddress: null };

    // Znajdź adres główny (lub pierwszy dowolny, jeśli żaden nie jest główny)
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
  // 1. Pobierz sesję na serwerze
  const session = await getServerSession(authOptions);

  // 2. Pobierz dane użytkownika i jego domyślny adres
  const { user, primaryAddress } = await getUserData(session?.user?.email);

  return (
    <div className="max-w-4xl mx-auto my-24 px-4">
      <h1 className="text-3xl font-bold mb-6">Finalizacja zamówienia</h1>

      {/* Suspense jest nadal przydatny do ładowania komponentu klienckiego */}
      <Suspense
        fallback={
          <div className="p-4 border rounded-md">Ładowanie formularza...</div>
        }
      >
        {/* Przekaż pobrane dane jako propsy do CheckoutForm */}
        <CheckoutForm
          primaryAddress={primaryAddress}
          userName={user?.name || session?.user?.name || ""}
        />
      </Suspense>
    </div>
  );
}
