import prisma from "@/app/lib/prisma";
import FeaturedSlider from "./FeaturedClientSlider";

// Next.js odświeżanie strony (np. co 30 sekund).
export const revalidate = 30;

async function getFeaturedProducts(total = 20) {
  const baseWhere = {
    deletedAt: null,
    images: { not: null },
  };

  const selectFields = {
    id: true,
    name: true,
    slug: true,
    price: true,
    promoPrice: true,
    promoStartDate: true,
    promoEndDate: true,
    lowestPrice: true,
    images: true,
  };

  const featuredRaw = await prisma.product.findMany({
    where: { ...baseWhere, featured: true },
    select: selectFields,
  });

  const featured = featuredRaw.filter(
    (p) => Array.isArray(p.images) && p.images.length > 0,
  );

  // Jeśli samych polecanych jest wystarczająco dużo, po prostu je tasujemy i zwracamy
  if (featured.length >= total) {
    return featured.sort(() => Math.random() - 0.5).slice(0, total);
  }

  const remaining = total - featured.length;
  const featuredIds = featured.map((p) => p.id);

  const randomWhere = {
    ...baseWhere,
    id: { notIn: featuredIds },
  };

  const count = await prisma.product.count({
    where: randomWhere,
  });

  const maxSkip = Math.max(0, count - (remaining + 10));
  const skip = maxSkip > 0 ? Math.floor(Math.random() * maxSkip) : 0;

  const randomRaw = await prisma.product.findMany({
    where: randomWhere,
    select: selectFields,
    skip,
    take: remaining + 10,
  });

  const random = randomRaw
    .filter((p) => Array.isArray(p.images) && p.images.length > 0)
    .slice(0, remaining);

  // ROZWIĄZANIE:
  // Tasujemy osobno polecane i osobno resztę, a następnie łączymy tak,
  // by 'featured' zawsze były z przodu.
  const shuffledFeatured = featured.sort(() => Math.random() - 0.5);
  const shuffledRandom = random.sort(() => Math.random() - 0.5);

  return [...shuffledFeatured, ...shuffledRandom];
}

export default async function FeaturedServerSlider() {
  const products = await getFeaturedProducts(20);
  return <FeaturedSlider products={products} />;
}
