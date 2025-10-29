// app/produkt/[productSlug]/page.js
import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";

export default async function ProductSlug({ params }) {
  const awaitedParams = await params;
  const { productSlug } = awaitedParams;

  if (!productSlug) notFound();

  const product = await prisma.product.findFirst({
    where: {
      slug: productSlug,
      deletedAt: null,
      category: {
        deletedAt: null,
        parent: {
          is: { deletedAt: null },
        },
      },
    },
    select: {
      // POBIERZ WSZYSTKIE POTRZEBNE POLA
      id: true,
      name: true,
      slug: true,
      price: true,
      lowestPrice: true, // KLUCZOWE!
      description: true,
      description2: true,
      additionalInfo: true,
      sizes: true,
      images: true,

      // RELACJA: KATEGORIA
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

  return <ProductDetails product={product} />;
}
