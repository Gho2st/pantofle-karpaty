import Collection from "../components/Collection";

export const metadata = {
  title: "Kapcie i pantofle damskie, męskie i dziecięce | Pantofle Karpaty",
  description:
    "Wszystkie kategorie Pantofle Karpaty: kapcie i pantofle damskie, męskie i dziecięce, bambosze, klapki i drewniaki ze skóry naturalnej i wełny. Polski producent.",
  alternates: { canonical: "/kategorie" },
};

export default function Kategoria() {
  return (
    <>
      <div className="max-w-5xl 2xl:max-w-7xl container mx-auto px-4 my-16 2xl:my-24">
        <h1 className="text-5xl font-light uppercase text-center mb-8">
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
