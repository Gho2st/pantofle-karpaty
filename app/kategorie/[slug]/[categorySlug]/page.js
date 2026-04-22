import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import CollectionTitle from "@/app/components/CollectionTitle";
import Link from "next/link";

// GENERATE METADATA
export async function generateMetadata({ params }) {
  const { categorySlug } = await params;

  const category = await prisma.category.findFirst({
    where: {
      slug: categorySlug,
      deletedAt: null,
    },
    select: {
      name: true,
      description: true,
      parent: {
        select: { name: true, slug: true },
      },
    },
  });

  if (!category) {
    return { title: "Kategoria nie znaleziona | Pantofle Karpaty" };
  }

  const parentName = category.parent?.name;
  const fullTitle = parentName
    ? `${category.name} – ${parentName} | Pantofle Karpaty`
    : `${category.name} | Pantofle Karpaty`;

  const fullDescription = category.description
    ? `${category.description} Ręcznie robione pantofle z Karpat – tradycja, wełna i pasja w każdym modelu.`
    : `Odkryj kolekcję ${category.name.toLowerCase()} – ręcznie robione pantofle z wełny, ciepłe i wygodne.`;

  return {
    title: fullTitle,
    description: fullDescription,
    alternates: {
      canonical: `/kategorie/${category.parent?.slug ? `${category.parent.slug}/` : ""}${categorySlug}`,
    },
    robots: "index, follow",
  };
}

//  PAGE
export default async function CategorySlug({ params }) {
  const { categorySlug } = await params;

  if (!categorySlug) notFound();

  // Najpierw pobieramy kategorię + parent (lekkie zapytanie)
  const category = await prisma.category.findFirst({
    where: {
      slug: categorySlug,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      parent: {
        select: { slug: true, name: true },
      },
    },
  });

  if (!category) notFound();

  // Osobne zapytanie tylko po produkty – lepsza wydajność
  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      lowestPrice: true,
      promoPrice: true,
      promoEndDate: true,
      sortOrder: true, // jeśli używasz do sortowania
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  const parentSlug = category.parent?.slug;
  const basePath = parentSlug
    ? `/kategorie/${parentSlug}/${category.slug}`
    : `/kategorie/${category.slug}`;

  const breadcrumb = [
    { name: "Strona główna", href: "/" },
    category.parent && {
      name: category.parent.name,
      href: `/kategorie/${category.parent.slug}`,
    },
    { name: category.name, href: null },
  ].filter(Boolean);

  return (
    <div className="max-w-5xl 2xl:max-w-7xl mx-auto my-16 2xl:my-24 px-4">
      {/* BREADCRUMB */}
      <nav className="text-sm text-gray-600 mb-6 text-center">
        {breadcrumb.map((item, i) => (
          <span key={i}>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-red-600 hover:underline"
              >
                {item.name}
              </Link>
            ) : (
              <span className="font-medium text-gray-900">{item.name}</span>
            )}
            {i < breadcrumb.length - 1 && <span className="mx-2">›</span>}
          </span>
        ))}
      </nav>

      <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-light uppercase text-center">
        {category.name}
      </h1>

      <p className="my-8 font-light text-center max-w-3xl mx-auto leading-relaxed">
        {category.description || (
          <>
            Ręcznie robione pantofle z Karpat – ciepłe, naturalne, z wełny.
            Idealne na zimę, do domu i na prezent. Tradycja i pasja w każdym
            szwie.
          </>
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <CollectionTitle
              key={product.id}
              src={product.images?.[0] || "/pantofle/pantofle.jpg"}
              alt={product.name}
              label={product.name}
              href={`/produkty/${product.slug}`}
              product={product}
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
