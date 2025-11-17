// app/kategorie/[slug]/page.js

import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import CollectionTitle from "@/app/components/CollectionTitle";

// --- SEO ---
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

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const mainCategory = await prisma.category.findFirst({
    where: { slug, deletedAt: null },
    select: { name: true },
  });

  if (!mainCategory) {
    return { title: "Kategoria nie znaleziona | Pantofle Karpaty" };
  }

  const seo = CATEGORY_SEO[slug] || {
    title: `${mainCategory.name} | Pantofle Karpaty`,
    description: `Ręcznie robione pantofle z Karpat – tradycja, wełna, ciepło. Odkryj kolekcję ${mainCategory.name.toLowerCase()}.`,
  };

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/kategorie/${slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  // 1. Główna kategoria
  const mainCategory = await prisma.category.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true, name: true, description: true },
  });

  if (!mainCategory) notFound();

  // 2. Podkategorie (bez orderBy)
  const subcategories = await prisma.category.findMany({
    where: {
      parentId: mainCategory.id,
      deletedAt: null,
    },
    include: {
      products: {
        where: { deletedAt: null },
        select: { id: true, name: true, price: true },
      },
    },
  });

  // 3. Produkty bezpośrednie – teraz z pełnymi danymi cenowymi
  const directProducts = await prisma.product.findMany({
    where: {
      categoryId: mainCategory.id,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      price: true, // cena katalogowa
      promoPrice: true, // cena promocyjna (jeśli masz takie pole)
      lowestPrice: true, // ← OBOWIĄZKOWO DODAJ TO!
      slug: true,
      images: true,
    },
  });

  const seo = CATEGORY_SEO[slug] || {
    description:
      "Ręcznie robione pantofle z Karpat – ciepłe, naturalne, pełne tradycji i pasji.",
  };

  return (
    <div className="max-w-7xl text-center mx-auto my-16 lg:my-24">
      <h1 className="text-5xl font-light uppercase">{mainCategory.name}</h1>

      <p className="my-8 px-4 lg:px-0 font-light xl:text-lg max-w-4xl mx-auto leading-relaxed">
        {mainCategory.description || seo.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {subcategories.length > 0 ? (
          subcategories.map((category) => (
            <CollectionTitle
              key={category.id}
              src={category.image || "/pantofle/pantofle.jpg"}
              alt={category.name}
              label={`${category.name} (${category.products?.length || 0})`}
              href={`/kategorie/${slug}/${
                category.slug ||
                category.name.toLowerCase().replace(/\s+/g, "-")
              }`}
            />
          ))
        ) : directProducts.length > 0 ? (
          directProducts.map((product) => {
            const firstImage =
              product.images &&
              Array.isArray(product.images) &&
              product.images[0]
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
