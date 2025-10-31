import CartContent from "./CartContent";

// Jeśli używasz App Router + metadata
export const metadata = {
  title: "Koszyk – Sklep Karpaty | Pantofle domowe i kapcie",
  description:
    "Twój koszyk czeka! Sprawdź produkty, wybierz dostawę (od 13,99 zł) i złóż zamówienie. Darmowa dostawa od 200 zł!",
};

export default function Koszyk() {
  return <CartContent />;
}
