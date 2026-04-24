// app/kategorie/[slug]/page.tsx
import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import CollectionTitle from "@/app/components/CollectionTitle";

const CATEGORY_SEO = {
  "dla-kobiet": {
    title: "Pantofle damskie – ręcznie robione z wełny | Pantofle Karpaty",
    description:
      "Odkryj kolekcję pantofli damskich z Karpat – ciepłe, stylowe i ręcznie robione z naturalnej wełny. Idealne na zimę, dom i górskie wieczory. Tradycja, komfort i karpacki design w każdym modelu.",
  },
  "dla-mezczyzn": {
    title: "Pantofle męskie – ciepłe i trwałe z Karpat | Pantofle Karpaty",
    description:
      "Męskie pantofle z Karpat – solidne, ciepłe, ręcznie robione z wełny i skóry. Klasyczny design, wysoka jakość i komfort na lata. Idealne do domu, po górach czy na wieczór przy kominku.",
  },
  "dla-dzieci": {
    title: "Pantofle dziecięce – wesołe i miękkie | Pantofle Karpaty",
    description:
      "Pantofelki dla dzieci z Karpat – kolorowe, mięciutkie, ręcznie robione z wełny. Bezpieczne, ciepłe i pełne karpackich wzorów. Idealne na prezent, do przedszkola i na zimowe wieczory w domu.",
  },
};

// ─── Jedno zapytanie, współdzielone przez metadata i page ─────────────────────

async function getCategoryPageData(slug) {
  const mainCategory = await prisma.category.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true, name: true, description: true },
  });

  if (!mainCategory) return null;

  const [subcategories, directProducts] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: mainCategory.id, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
      orderBy: { name: "asc" },
    }),

    prisma.product.findMany({
      where: { categoryId: mainCategory.id, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        promoPrice: true,
        lowestPrice: true,
        images: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return { mainCategory, subcategories, directProducts };
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getCategoryPageData(slug);

  if (!data) return { title: "Kategoria nie znaleziona | Pantofle Karpaty" };

  const seo = CATEGORY_SEO[slug] || {
    title: `${data.mainCategory.name} | Pantofle Karpaty`,
    description: "Ręcznie robione pantofle z Karpat – tradycja, wełna, ciepło.",
  };

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/kategorie/${slug}` },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const data = await getCategoryPageData(slug);

  if (!data) notFound();

  const { mainCategory, subcategories, directProducts } = data;

  const seo = CATEGORY_SEO[slug] || {
    description:
      "Ręcznie robione pantofle z Karpat – ciepłe, naturalne, pełne tradycji i pasji.",
  };

  return (
    <div className="max-w-5xl 2xl:max-w-7xl text-center mx-auto my-16 2xl:my-24">
      <h1 className="text-5xl font-light uppercase">{mainCategory.name}</h1>

      <p className="my-8 px-4 lg:px-0 font-light xl:text-lg max-w-4xl mx-auto leading-relaxed">
        {mainCategory.description || seo.description}
      </p>

      <div
        id="categories"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10"
      >
        {subcategories.length > 0 ? (
          subcategories.map((category) => (
            <CollectionTitle
              key={category.id}
              centerOnMobile="true"
              src={category.image || "/pantofle/pantofle.jpg"}
              alt={category.name}
              label={`${category.name} (${category._count.products})`}
              href={`/kategorie/${slug}/${category.slug || category.name.toLowerCase().replace(/\s+/g, "-")}`}
            />
          ))
        ) : directProducts.length > 0 ? (
          directProducts.map((product) => {
            const firstImage =
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : "/pantofle/pantofle.jpg";

            return (
              <CollectionTitle
                key={product.id}
                src={firstImage}
                alt={product.name}
                label={product.name}
                href={`/produkty/${product.slug || product.id}`}
                product={product}
              />
            );
          })
        ) : (
          <p className="text-gray-600 col-span-full">
            Brak produktów w kategorii {mainCategory.name.toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
}
