import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import CollectionTitle from "@/app/components/CollectionTitle";

// Bezpieczny slug (na wszelki wypadek)
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-+/g, "-");
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  // --- POBIERZ TYLKO AKTYWNĄ KATEGORIĘ ---
  const mainCategory = await prisma.category.findFirst({
    where: {
      slug,
      deletedAt: null, // KLUCZOWE: TYLKO AKTYWNE KATEGORIE
    },
    include: {
      subcategories: {
        where: {
          deletedAt: null, // TYLKO AKTYWNE PODKATEGORIE
        },
        include: {
          products: {
            where: {
              deletedAt: null, // TYLKO AKTYWNE PRODUKTY
            },
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  // --- 404 JEŚLI KATEGORIA NIE ISTNIEJE LUB JEST USUNIĘTA ---
  if (!mainCategory) {
    notFound();
  }

  const subcategories = mainCategory.subcategories || [];

  return (
    <div className="max-w-7xl text-center mx-auto my-16 lg:my-24">
      <h1 className="text-5xl font-light uppercase">{mainCategory.name}</h1>
      <p className="my-8 px-4 lg:px-0 font-light xl:text-lg">
        {mainCategory.description ||
          "Odkryj naszą kolekcję wyjątkowego obuwia ręcznie robionego z pasją i tradycją."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {subcategories.length > 0 ? (
          subcategories.map((category) => (
            <CollectionTitle
              key={category.id}
              src={category.image || "/pantofle/pantofle.jpg"}
              alt={category.name}
              label={`${category.name} (${category.products?.length || 0})`}
              href={`/kategoria/${slug}/${
                category.slug || generateSlug(category.name)
              }`}
            />
          ))
        ) : (
          <p className="text-gray-600 col-span-full">
            Brak dostępnych podkategorii w {mainCategory.name.toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
}
