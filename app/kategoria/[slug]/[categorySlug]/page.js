import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import CollectionTitle from "@/app/components/CollectionTitle";
import Link from "next/link";

export default async function CategorySlug({ params }) {
  const awaitedParams = await params;
  const { categorySlug } = awaitedParams;

  if (!categorySlug) notFound();

  // UŻYJ findFirst – findUnique NIE DZIAŁA z deletedAt
  const category = await prisma.category.findFirst({
    where: {
      slug: categorySlug,
      deletedAt: null,
    },
    include: {
      parent: {
        where: { deletedAt: null },
        select: { slug: true, name: true },
      },
      products: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true,
          lowestPrice: true,
        },
      },
    },
  });

  if (!category) notFound();

  // PEŁNA ŚCIEŻKA URL
  const parentSlug = category.parent?.slug;
  const basePath = parentSlug
    ? `/kategoria/${parentSlug}/${category.slug}`
    : `/kategoria/${category.slug}`;

  // BREADCRUMB
  const breadcrumb = [
    { name: "Strona główna", href: "/" },
    category.parent && {
      name: category.parent.name,
      href: `/kategoria/${category.parent.slug}`,
    },
    { name: category.name, href: null },
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto my-16 lg:my-24 px-4">
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
              href={`${basePath}/${product.slug}`}
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
