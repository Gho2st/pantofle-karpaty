import prisma from "@/app/lib/prisma";
import FeaturedSlider from "./FeaturedClientSlider";

async function getFeaturedProducts(total = 20) {
  const featured = await prisma.product.findMany({
    where: { featured: true, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      promoPrice: true,
      promoStartDate: true,
      promoEndDate: true,
      lowestPrice: true,
      images: true,
    },
  });

  if (featured.length >= total) {
    return featured.sort(() => Math.random() - 0.5).slice(0, total);
  }

  const remaining = total - featured.length;
  const featuredIds = featured.map((p) => p.id);

  const count = await prisma.product.count({
    where: { deletedAt: null, id: { notIn: featuredIds } },
  });

  const skip = Math.max(
    0,
    Math.floor(Math.random() * Math.max(1, count - remaining)),
  );

  const random = await prisma.product.findMany({
    where: { deletedAt: null, id: { notIn: featuredIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      promoPrice: true,
      promoStartDate: true,
      promoEndDate: true,
      lowestPrice: true,
      images: true,
    },
    skip,
    take: remaining,
  });

  return [...featured, ...random.sort(() => Math.random() - 0.5)];
}

export default async function FeaturedServerSlider() {
  const products = await getFeaturedProducts(20);
  return <FeaturedSlider products={products} />;
}
