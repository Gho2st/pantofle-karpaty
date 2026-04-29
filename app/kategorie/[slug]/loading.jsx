// app/kategorie/[slug]/loading.jsx

export default function CategoryLoading() {
  return (
    <div className="max-w-5xl 2xl:max-w-7xl text-center mx-auto my-16 2xl:my-24 px-4 animate-pulse">
      {/* Tytuł */}
      <div className="h-10 bg-gray-200 rounded-md w-56 mx-auto" />

      {/* Opis */}
      <div className="mt-8 space-y-2 max-w-xl mx-auto">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-4/6 mx-auto" />
      </div>

      {/* Siatka kart — 3 kolumny jak najczęstszy przypadek */}
      <div className="grid sm:grid-cols-3 max-w-6xl mx-auto gap-10 mt-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="w-full aspect-square bg-gray-200 rounded-md" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
