import ClientProfil from "./ClientProfil";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Twój profil – Zamówienia, dane, adresy | Pantofle Karpaty",
  description:
    "Zarządzaj swoim kontem w Pantofle Karpaty. Sprawdź zamówienia, edytuj dane osobowe i adresy dostawy. Szybko i bezpiecznie.",
  alternates: {
    canonical: "/profil",
  },
  robots: "noindex, nofollow",
};

export default async function ProfilPage() {
  const session = await getServerSession(authOptions); // ← await!

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role === "ADMIN") {
    redirect("/admin");
  }

  return <ClientProfil />;
}
