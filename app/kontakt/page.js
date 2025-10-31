import Form from "./Form";
import Map from "./Map";

export const metadata = {
  title: "Kontakt – Sklep Karpaty | Pantofle domowe i kapcie",
  description:
    "Masz pytanie? Napisz lub zadzwoń! Kontakt: mwidel@pantofle-karpaty.pl | +48 608 238 103. Szybka pomoc 8:00–17:00 (pn–pt).",
};

export default function Contact() {
  return (
    <>
      <Form />
      <Map />
    </>
  );
}
