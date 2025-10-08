import CollectionTitle from "../../components/CollectionTitle"


export default function Woman() {
  return (
    <>
      <div className="max-w-7xl text-center mx-auto my-24">
        <h1 className="text-5xl font-light uppercase">Dla Kobiet</h1>
        <p className="my-8 font-light">
          Każdy model naszego obuwia jest wykonywany ręcznie z najwyższą
          starannością. Oferujemy unikalne pantofle domowe, bambosze oraz
          mokasyny ozdobione regionalnymi góralskimi wzorami, które nadają im
          niepowtarzalny charakter. Dla miłośniczek nowoczesnego stylu
          przygotowaliśmy także eleganckie klapki i inne modele łączące komfort
          z modnym designem. Wybierz buty, które łączą jakość rzemieślniczą z
          wyjątkowym stylem, idealne na co dzień i specjalne okazje.
        </p>

        <div className="grid grid-cols-4 gap-10">
          <CollectionTitle
            src={"/pantofle/pantofle.jpg"}
            alt="Pantofle Damskie"
            label="Pantofle Damskie"
            href="/kobiety"
          />
          <CollectionTitle
            src={"/pantofle/pantofle.jpg"}
            alt="Pantofle Damskie"
            label="Pantofle Damskie"
            href="/kobiety"
          />
          <CollectionTitle
            src={"/pantofle/pantofle.jpg"}
            alt="Pantofle Damskie"
            label="Pantofle Damskie"
            href="/kobiety"
          />
          <CollectionTitle
            src={"/pantofle/pantofle.jpg"}
            alt="Pantofle Damskie"
            label="Pantofle Damskie"
            href="/kobiety"
          />
        </div>
      </div>
    </>
  );
}
