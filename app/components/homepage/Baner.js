import Image from "next/image";

export default function Baner() {
  // Klasy dla standardowego kontenera obrazu
  const imageContainerClasses =
    "relative h-full w-full shadow-lg overflow-hidden rounded-lg min-h-[250px] lg:min-h-0";
  const imageClasses = "object-cover";

  return (
    <>
      <div className="px-[9%] py-24">
        {/* GŁÓWNY GRID: Dzieli sekcję na dwie równe kolumny (50%/50%) i używa items-stretch, 
           aby lewa i prawa kolumna miały tę samą wysokość. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* LEWA KOLUMNA (Baner + 2 Małe ZDJĘCIA) - Definiuje wysokość całej sekcji */}
          <div className="flex flex-col gap-8 lg:gap-12">
            {/* 1. DUŻY BANER */}
            <div className="bg-gray-100 p-10 md:p-16">
              <h1 className="uppercase text-primary text-4xl sm:text-4xl 2xl:text-6xl font-extrabold leading-snug mb-4">
                Polski producent obuwia ze skóry
              </h1>
              <p className="text-gray-700 text-lg xl:text-xl 2xl:text-2xl">
                Naturalne materiały, solidne wykonanie, ponadczasowy styl.
              </p>
            </div>

            {/* 2. DWA MAŁE ZDJĘCIA (Dolna część: 1/2 i 1/2 horyzontalnie) */}
            <div className="grid grid-cols-2 gap-4 h-64 md:h-80">
              <div className={imageContainerClasses}>
                <Image
                  src={"/baner/1.jpg"}
                  alt="Pantofle damskie"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className={imageClasses}
                />
              </div>

              <div className={imageContainerClasses}>
                <Image
                  src={"/baner/2.jpg"}
                  alt="Pantofle męskie"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className={imageClasses}
                />
              </div>
            </div>
          </div>

          {/* PRAWA KOLUMNA (TYLKO 2 ZDJĘCIA OBOK SIEBIE) */}
          {/* KLUCZOWA ZMIANA: Zagnieżdżony Grid, który dzieli całą kolumnę na 2 kolumny (50%/50%) */}
          {/* Dodano h-full, aby kontener rozciągnął się na całą wysokość lewej kolumny. */}
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Lewe zdjęcie (zajmuje 1/2 szerokości i całą dostępną wysokość) */}
            <div className={imageContainerClasses}>
              <Image
                src={"/baner/3.jpg"}
                alt="Pantofle dziecięce"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className={imageClasses}
              />
            </div>

            {/* Prawe zdjęcie (zajmuje 1/2 szerokości i całą dostępną wysokość) */}
            <div className={imageContainerClasses}>
              <Image
                src={"/baner/4.jpg"}
                alt="Pantofle skórzane"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className={imageClasses}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
