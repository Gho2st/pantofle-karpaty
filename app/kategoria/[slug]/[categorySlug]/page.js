import prisma from "@/app/lib/prisma";
import CollectionTitle from "@/app/components/CollectionTitle";

export default async function CategorySlug({ params }) {
  const { categorySlug } = await params;

  const slug = categorySlug;

  // Pobierz kategorię po name LUB slug
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { slug }, // Szukaj po slug (np. "dla-kobiet")
        { name: slug }, // Szukaj po name (np. "Dla Kobiet")
      ],
    },
    include: {
      subcategories: true, // Pobierz subkategorie
      products: true, // Pobierz produkty
    },
  });

  console.log(category); // Do debugowania

  if (!category) {
    return <div>Kategoria nie znaleziona</div>;
  }

  return (
    <div className="max-w-7xl mx-auto my-16 lg:my-24">
      <h1 className="text-5xl font-light uppercase text-center">
        {category.name}
      </h1>
      <p className="my-8 font-light text-center">
        {category.description || "Brak opisu kategorii"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {category.products.length > 0 ? (
          category.products.map((product) => (
            <CollectionTitle
              key={product.id}
              src={product.images?.[0] || "/pantofle/pantofle.jpg"} // Bierz pierwsze zdjęcie z tablicy
              alt={product.name || "Produkt"}
              label={product.name}
              href={`/kategoria/dla-kobiet/${category.slug || category.name}/${
                product.slug || product.name
              }`}
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
