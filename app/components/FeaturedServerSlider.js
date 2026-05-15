import prisma from "@/app/lib/prisma";
import FeaturedSlider from "./FeaturedClientSlider";

// 1. NAPRAWA CACHE: Wymusza na Next.js odświeżanie strony (np. co 30 sekund).
// Dzięki temu usunięte produkty znikną ze strony maksymalnie po minucie od ich usunięcia w bazie.
export const revalidate = 30;

async function getFeaturedProducts(total = 20) {
  // Część wspólna zapytania (tylko aktywne i takie, których images nie jest NULLem)
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

  // Pobieramy produkty "polecane"
  const featuredRaw = await prisma.product.findMany({
    where: { ...baseWhere, featured: true },
    select: selectFields,
  });

  // 2. NAPRAWA ZDJĘĆ: Filtrujemy w JS, aby upewnić się, że to faktycznie tablica, która nie jest pusta '[]'
  const featured = featuredRaw.filter(
    (p) => Array.isArray(p.images) && p.images.length > 0,
  );

  if (featured.length >= total) {
    return featured.sort(() => Math.random() - 0.5).slice(0, total);
  }

  const remaining = total - featured.length;
  const featuredIds = featured.map((p) => p.id);

  const randomWhere = {
    ...baseWhere,
    id: { notIn: featuredIds },
  };

  // Liczymy dostępne produkty do losowania
  const count = await prisma.product.count({
    where: randomWhere,
  });

  // Losujemy punkt startowy (skip). Zabezpieczamy margines (+10), bo po drodze
  // JS może odrzucić puste tablice '[]'
  const maxSkip = Math.max(0, count - (remaining + 10));
  const skip = maxSkip > 0 ? Math.floor(Math.random() * maxSkip) : 0;

  const randomRaw = await prisma.product.findMany({
    where: randomWhere,
    select: selectFields,
    skip,
    take: remaining + 10, // Pobieramy z górką na wypadek wycięcia pustych tablic
  });

  // Filtrujemy losowe produkty ze zdjęciami i przycinamy do brakującej ilości
  const random = randomRaw
    .filter((p) => Array.isArray(p.images) && p.images.length > 0)
    .slice(0, remaining);

  return [...featured, ...random].sort(() => Math.random() - 0.5);
}

export default async function FeaturedServerSlider() {
  const products = await getFeaturedProducts(20);
  return <FeaturedSlider products={products} />;
}
