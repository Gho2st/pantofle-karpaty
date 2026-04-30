// app/produkty/[slug]/loading.jsx

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto my-12 md:my-24 px-4 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex justify-center md:justify-start gap-2 mb-8 xl:mb-12">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        {/* ====================== GALERIA ====================== */}
        <div className="w-full md:w-1/2">
          {/* MOBILE */}
          <div className="md:hidden">
            <div className="aspect-[4/5] bg-gray-200 rounded-xl" />
          </div>

          {/* DESKTOP — miniaturki + główne zdjęcie */}
          <div className="hidden md:grid md:grid-cols-12 gap-4">
            <div className="flex flex-col gap-2 col-span-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-md" />
              ))}
            </div>
            <div className="aspect-[4/5] bg-gray-200 rounded-md col-span-10" />
          </div>
        </div>

        {/* ====================== INFORMACJE ====================== */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Kategoria + nazwa */}
          <div className="mb-5">
            <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-9 md:h-10 bg-gray-200 rounded w-4/5 mb-2" />
            <div className="h-9 md:h-10 bg-gray-200 rounded w-3/5" />
          </div>

          {/* Cena */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <div className="h-9 bg-gray-200 rounded w-40 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-56" />
          </div>

          {/* Warianty kolorystyczne */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-32 mb-3" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-200" />
              ))}
            </div>
          </div>

          {/* Opis */}
          <div className="mb-6 pb-6 border-b border-gray-100 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-11/12" />
            <div className="h-3 bg-gray-200 rounded w-4/6" />
          </div>

          <div className="flex flex-col gap-6">
            {/* Rozmiar */}
            <div>
              <div className="h-3 bg-gray-200 rounded w-20 mb-3" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-md bg-gray-200" />
                ))}
              </div>
            </div>

            {/* Ilość */}
            <div>
              <div className="h-3 bg-gray-200 rounded w-12 mb-3" />
              <div className="h-10 w-32 rounded-md bg-gray-200" />
            </div>

            {/* CTA */}
            <div className="h-14 rounded-md bg-gray-200" />

            {/* Dostawa / zwroty / płatność */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="h-3 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-200 rounded w-40" />
              <div className="h-3 bg-gray-200 rounded w-44" />
            </div>
          </div>

          {/* Szczegóły — toggle */}
          <div className="mt-6 border-t border-gray-100 py-4">
            <div className="h-3 bg-gray-200 rounded w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}
