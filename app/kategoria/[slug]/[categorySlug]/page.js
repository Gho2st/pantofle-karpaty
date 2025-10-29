import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import CollectionTitle from "@/app/components/CollectionTitle";

// Bezpieczny fallback slug
function generateSlug(name) {
  if (!name) return "produkt";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-+/g, "-");
}

export default async function CategorySlug({ params }) {
  const { categorySlug } = await params;

  // Walidacja podstawowa
  if (!categorySlug || typeof categorySlug !== "string") {
    notFound();
  }

  const slug = categorySlug.trim();

  // Pobierz TYLKO AKTYWNĄ kategorię
  const category = await prisma.category.findFirst({
    where: {
      deletedAt: null, // TYLKO AKTYWNA KATEGORIA
      OR: [
        { slug: slug },
        { name: slug }, // fallback na nazwę (jeśli slug nie istnieje)
      ],
    },
    include: {
      subcategories: {
        where: { deletedAt: null }, // TYLKO AKTYWNE PODKATEGORIE
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      products: {
        where: { deletedAt: null }, // TYLKO AKTYWNE PRODUKTY
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
        },
      },
    },
  });

  // 404 jeśli kategoria nie istnieje LUB jest usunięta
  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto my-16 lg:my-24">
      <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-light uppercase text-center">
        {category.name}
      </h1>
      <p className="my-8 font-light text-center max-w-3xl mx-auto">
        {category.description || ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {category.products.length > 0 ? (
          category.products.map((product) => (
            <CollectionTitle
              key={product.id}
              src={product.images?.[0] || "/pantofle/pantofle.jpg"}
              alt={product.name}
              label={product.name}
              href={`/produkt/${product.slug || generateSlug(product.name)}`}
            />
          ))
        ) : (
          <p className="text-gray-600 col-span-full text-center">
            Brak dostępnych produktów w tej kategorii.
          </p>
        )}
      </div>
    </div>
  );
}
