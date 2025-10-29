import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";

// Bezpieczny fallback slug
function generateSlug(name) {
  if (!name) return "produkt";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .replace(/-+/g, "-");
}

export default async function ProductSlug({ params }) {
  const { productSlug } = await params;

  // --- WALIDACJA ---
  if (!productSlug || typeof productSlug !== "string") {
    notFound();
  }

  const slug = productSlug.trim();

  // --- POBIERZ TYLKO AKTYWNY PRODUKT + KATEGORIĘ ---
  const product = await prisma.product.findFirst({
    where: {
      deletedAt: null, // TYLKO AKTYWNY PRODUKT
      OR: [
        { slug: slug },
        // Opcjonalnie: fallback na nazwę (jeśli slug nie istnieje)
        // { name: { equals: slug, mode: "insensitive" } }
      ],
    },
    include: {
      category: {
        where: { deletedAt: null }, // TYLKO AKTYWNA KATEGORIA
        select: {
          id: true,
          name: true,
          slug: true,
          parent: {
            where: { deletedAt: null },
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  // --- 404 JEŚLI PRODUKT NIE ISTNIEJE LUB JEST USUNIĘTY ---
  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
