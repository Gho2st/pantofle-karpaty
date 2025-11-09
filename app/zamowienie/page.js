import { Suspense } from "react";
import CheckoutForm from "./CheckoutForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "../lib/prisma";

export const metadata = {
  title: "Finalizacja zamówienia | Pantofle Karpaty",
  description: "Złóż zamówienie. Bezpieczne płatności, szybka dostawa.",
  alternates: { canonical: "/zamowienie" },
  robots: "noindex, nofollow",
};

async function getUserData(email) {
  if (!email) return { user: null, primaryAddress: null };
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { addresses: { orderBy: { isPrimary: "desc" } } },
    });
    if (!user) return { user: null, primaryAddress: null };
    const primaryAddress =
      user.addresses.find((a) => a.isPrimary) || user.addresses[0] || null;
    return { user, primaryAddress };
  } catch (error) {
    console.error("Błąd pobierania danych:", error);
    return { user: null, primaryAddress: null };
  }
}

export default async function CheckoutPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const { user, primaryAddress } = await getUserData(session?.user?.email);

  const awaitedSearchParams = await searchParams;
  // POBIERZ RABAT Z URL
  const discountCode = awaitedSearchParams?.discountCode || null;
  const discountValue = awaitedSearchParams?.discountValue
    ? parseFloat(awaitedSearchParams.discountValue)
    : 0;

  return (
    <div className="max-w-4xl mx-auto my-12 2xl:my-24 px-4">
      <h1 className="text-2xl lg:text-3xl font-bold text-center mb-8">
        Finalizacja zamówienia
      </h1>

      <Suspense fallback={<div className="text-center py-6">Ładowanie...</div>}>
        <CheckoutForm
          session={session}
          primaryAddress={primaryAddress}
          userName={user?.name || session?.user?.name || ""}
          userEmail={session?.user?.email || ""}
          discountCode={discountCode}
          discountValue={discountValue}
        />
      </Suspense>
    </div>
  );
}
