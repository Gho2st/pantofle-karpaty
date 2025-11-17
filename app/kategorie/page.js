import Collection from "../components/homepage/Collection";

export const metadata = {
  title: "Kategorie odzieży: Męska, Damska, Dziecięca | Pantofle Karpaty",
  description:
    "Odkryj modne kolekcje odzieży dla mężczyzn, kobiet i dzieci. Sukienki, kurtki, koszule, buty – wszystko w jednym miejscu. Wybierz swoją kategorię!",
};

export default function Kategoria() {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-6">
          Kategorie
        </h1>
        <p className="text-lg text-center text-gray-600 mb-10 max-w-3xl mx-auto">
          Przeglądaj naszą ofertę i wybierz kategorię, która Cię interesuje:{" "}
          <strong>męska</strong>, <strong>damska</strong> lub{" "}
          <strong>dziecięca</strong>. Znajdź idealny styl na każdą okazję!
        </p>
        <Collection />
      </div>
    </>
  );
}
