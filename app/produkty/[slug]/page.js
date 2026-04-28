import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "@/app/components/ProductDetails";

const SPECIAL_PARTNERS = {
  "kapcie-zdobione-skora-owcza": "kapcie-meskie-skorzane-welna",
  "kapcie-meskie-skorzane-welna": "kapcie-zdobione-skora-owcza",
};

const fixJsonField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  }
  return [];
};

// ─── Shared data fetcher ──────────────────────────────────────────────────────

async function getProductData(slug) {
  const [product, partnerSlug] = [
    await prisma.product.findFirst({
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
        sizes: true,
        colorHex: true,
        colorGroup: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    SPECIAL_PARTNERS[slug],
  ];

  if (!product) return null;

  // Pobierz warianty kolorystyczne
  const colorVariants = product.colorGroup
    ? await prisma.product.findMany({
        where: {
          colorGroup: product.colorGroup,
          deletedAt: null,
          id: { not: product.id },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          colorHex: true,
          images: true,
        },
      })
    : [];

  const partner = partnerSlug
    ? await prisma.product.findFirst({
        where: { slug: partnerSlug, deletedAt: null },
        select: { name: true, images: true },
      })
    : null;

  return { product, partner, partnerSlug, colorVariants };
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getProductData(slug);

  if (!data) return { title: "Produkt nie znaleziony | Pantofle Karpaty" };

  const { product } = data;
  const currentPrice = product.promoPrice || product.price;

  return {
    title: `${product.name} – ${currentPrice} zł | Pantofle Karpaty`,
    description:
      product.description ||
      `Kup ${product.name.toLowerCase()} – ręcznie robione pantofle z Karpat. Tradycja, wełna, ciepło.`,
    openGraph: {
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    alternates: { canonical: `/produkty/${slug}` },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const data = await getProductData(slug);

  if (!data) notFound();

  const { product, partner, partnerSlug, colorVariants } = data;

  const images = fixJsonField(product.images);
  const sizes = fixJsonField(product.sizes);
  const partnerImage = partner ? fixJsonField(partner.images)?.[0] : null;

  return (
    <ProductDetails
      product={{
        ...product,
        images,
        sizes,
        colorVariants,
        showPartnerTile: !!partner,
        partnerUrl: partnerSlug ? `/produkty/${partnerSlug}` : null,
        partnerImage,
        partnerName: partner?.name || "drugą parę",
        partnerTitle:
          slug === "kapcie-zdobione-skora-owcza"
            ? "Kup też dla Niego"
            : "Kup też dla Niej",
      }}
    />
  );
}
