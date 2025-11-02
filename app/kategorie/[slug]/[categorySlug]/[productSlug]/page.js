// app/produkt/[productSlug]/page.js
import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";

// === DYNAMICZNE METADATA + JSON-LD ===
export async function generateMetadata({ params }) {
  const { productSlug } = await params;

  if (!productSlug) {
    return { title: "Produkt nie znaleziony" };
  }

  const product = await prisma.product.findFirst({
    where: {
      slug: productSlug,
      deletedAt: null,
      category: {
        deletedAt: null,
        parent: { is: { deletedAt: null } },
      },
    },
    select: {
      name: true,
      description: true,
      price: true,
      lowestPrice: true,
      images: true,
      category: {
        select: {
          name: true,
          slug: true,
          parent: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!product) {
    return { title: "Produkt nie znaleziony | Pantofle Karpaty" };
  }

  const parent = product.category.parent;
  const category = product.category;

  // BREADCRUMB do OG
  const breadcrumb = [
    "Strona główna",
    parent?.name,
    category.name,
    product.name,
  ].filter(Boolean);

  const title = `${product.name} – ${category.name}${
    parent ? ` (${parent.name})` : ""
  } | Pantofle Karpaty`;
  const baseDesc =
    product.description ||
    `Ręcznie robione ${product.name.toLowerCase()} z wełny – ciepłe, wygodne i trwałe. Idealne na prezent.`;
  const description = `${baseDesc} Pantofle Karpaty – tradycja z Bieszczad.`;

  const image = product.images?.[0];

  return {
    title,
    description,
    alternates: {
      canonical: `${productSlug}`,
    },

    // JSON-LD: Product (schema.org)
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: [image],
        description: baseDesc,
        brand: { "@type": "Brand", name: "Pantofle Karpaty" },
        offers: {
          "@type": "Offer",
          priceCurrency: "PLN",
          price: product.lowestPrice || product.price,
          availability: "https://schema.org/InStock",
          // url: `${productSlug}`,
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumb.map((name, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name,
          })),
        },
      }),
    },
  };
}

export default async function ProductSlug({ params }) {
  const { productSlug } = await params;

  if (!productSlug) notFound();

  const product = await prisma.product.findFirst({
    where: {
      slug: productSlug,
      deletedAt: null,
      category: {
        deletedAt: null,
        parent: { is: { deletedAt: null } },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      lowestPrice: true,
      description: true,
      description2: true,
      additionalInfo: true,
      sizes: true,
      images: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parent: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  if (!product) notFound();

  return <ProductDetails product={product} />;
}
