// app/produkty/[slug]/page.js
import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "@/app/components/ProductDetails";

// --- SEO ---
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    select: {
      name: true,
      price: true,
      promoPrice: true,
      images: true,
      description: true,
    },
  });

  if (!product) {
    return { title: "Produkt nie znaleziony | Pantofle Karpaty" };
  }

  const currentPrice = product.promoPrice || product.price;
  const isPromo = product.promoPrice && product.promoPrice < product.price;

  return {
    title: `${product.name} – ${
      isPromo ? `${product.promoPrice} zł` : `${currentPrice} zł`
    } | Pantofle Karpaty`,
    description:
      product.description ||
      `Kup ${product.name.toLowerCase()} – ręcznie robione pantofle z Karpat. Tradycja, wełna, ciepło.`,
    openGraph: {
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    alternates: {
      canonical: `/produkty/${slug}`,
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!product) notFound();

  // Normalizuj `sizes` – upewnij się, że to tablica obiektów
  const normalizedSizes = Array.isArray(product.sizes) ? product.sizes : [];

  // Normalizuj `images`
  const images = Array.isArray(product.images) ? product.images : [];

  // Przygotuj produkt dla komponentu
  const productForClient = {
    ...product,
    images,
    sizes: normalizedSizes,
  };

  return <ProductDetails product={productForClient} />;
}
