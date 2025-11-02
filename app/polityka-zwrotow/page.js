import ClientReturnForm from "./ClientReturnForm";

export const metadata = {
  title: "Zwroty i Reklamacje | Pantofle Karpaty",
  description:
    "Masz 14 dni na zwrot. Wypełnij formularz – wyślemy etykietę. Koszt zwrotu: 13,99 zł. Reklamacja? Zgłoś w 24h – odbierzemy paczkę.",
  alternates: {
    canonical: "/polityka-zwrotow",
  },
  robots: "index, follow",
};

export default function ZwrotyPage() {
  return <ClientReturnForm />;
}
