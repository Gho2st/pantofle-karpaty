import ClientProfil from "./ClientProfil";

export const metadata = {
  title: "Twój profil – Zamówienia, dane, adresy | Pantofle Karpaty",
  description:
    "Zarządzaj swoim kontem w Pantofle Karpaty. Sprawdź zamówienia, edytuj dane osobowe i adresy dostawy. Szybko i bezpiecznie.",
  alternates: {
    canonical: "/profil",
  },
  robots: "noindex, nofollow", // Profil prywatny – nie w Google
};

export default function ProfilPage() {
  return <ClientProfil />;
}
