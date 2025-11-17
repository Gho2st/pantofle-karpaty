// app/produkty/[slug]/page.js
import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "@/app/components/ProductDetails";

// SEO – bez zmian
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

// GŁÓWNA STRONA – DZIAŁA ZAWSZE
export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      promoPrice: true,
      lowestPrice: true,
      description: true,
      description2: true,
      additionalInfo: true,
      images: true,
      sizes: true, // pole Json? – bierzemy surowe dane
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

  // NAPRAWA: sizes i images przychodzą czasem jako STRING (np. "[{...}]")
  const fixJsonField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch (e) {
        console.error("Błąd parsowania JSON:", field);
        return [];
      }
    }
    return [];
  };

  const images = fixJsonField(product.images);
  const sizes = fixJsonField(product.sizes); // TERAZ ZAWSZE BĘDZIE TABLICĄ!

  const productForClient = {
    ...product,
    images,
    sizes,
  };

  return <ProductDetails product={productForClient} />;
}
