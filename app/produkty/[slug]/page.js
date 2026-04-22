import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "@/app/components/ProductDetails";

const SPECIAL_PARTNERS = {
  "kapcie-zdobione-skora-owcza": "kapcie-meskie-skorzane-welna",
  "kapcie-meskie-skorzane-welna": "kapcie-zdobione-skora-owcza",
};

// ==================== GENERATE METADATA ====================
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    select: {
      name: true,
      price: true,
      promoPrice: true,
      description: true,
      images: true,
    },
  });

  if (!product) {
    return { title: "Produkt nie znaleziony | Pantofle Karpaty" };
  }

  const currentPrice = product.promoPrice || product.price;
  const isPromo = Boolean(
    product.promoPrice && product.promoPrice < product.price,
  );

  return {
    title: `${product.name} – ${currentPrice} zł | Pantofle Karpaty`,
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

// ==================== PAGE ====================
export default async function ProductPage({ params }) {
  const { slug } = await params;

  // Główne zapytanie – pobieramy wszystko co potrzebne
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
      sizes: true,
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

  // Parsowanie pól JSON (images, sizes)
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
  const sizes = fixJsonField(product.sizes);

  // === Logika partnera (zoptymalizowana) ===
  let partner = null;

  const partnerSlug = SPECIAL_PARTNERS[slug];

  if (partnerSlug) {
    partner = await prisma.product.findFirst({
      where: {
        slug: partnerSlug,
        deletedAt: null,
      },
      select: {
        name: true,
        images: true,
      },
    });
  }

  const partnerImage = partner ? fixJsonField(partner.images)?.[0] : null;
  const partnerName = partner?.name || "drugą parę";

  const partnerUrl = partnerSlug ? `/produkty/${partnerSlug}` : null;
  const partnerTitle =
    slug === "kapcie-zdobione-skora-owcza"
      ? "Kup też dla Niego"
      : "Kup też dla Niej";

  const productForClient = {
    ...product,
    images,
    sizes,
    showPartnerTile: !!partner,
    partnerUrl,
    partnerImage,
    partnerName,
    partnerTitle,
  };

  return <ProductDetails product={productForClient} />;
}
