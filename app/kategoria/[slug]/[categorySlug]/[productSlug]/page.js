import prisma from "@/app/lib/prisma";
import ProductDetails from "./ProductDetails";

export default async function ProductSlug({ params }) {
  const { productSlug } = await params;

  // Pobierz produkt po name lub slug
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug: productSlug }],
    },
  });

  if (!product) {
    return (
      <div className="flex justify-center mt-10 text-2xl">
        Produkt nie znaleziony
      </div>
    );
  }

  return <ProductDetails product={product} />;
}
