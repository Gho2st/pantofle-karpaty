// app/produkty/[slug]/page.js
import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "@/app/components/ProductDetails";

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

  let partner = null;

  if (slug === "kapcie-zdobione-skora-owcza") {
    partner = await prisma.product.findFirst({
      where: { slug: "kapcie-meskie-skorzane-welna", deletedAt: null },
      select: { name: true, images: true },
    });
  } else if (slug === "kapcie-meskie-skorzane-welna") {
    partner = await prisma.product.findFirst({
      where: { slug: "kapcie-zdobione-skora-owcza", deletedAt: null },
      select: { name: true, images: true },
    });
  }

  const partnerImage = partner ? fixJsonField(partner.images)?.[0] : null;
  const partnerName = partner?.name || "drugą parę";

  const partnerUrl =
    slug === "kapcie-zdobione-skora-owcza"
      ? "/produkty/kapcie-meskie-skorzane-welna"
      : slug === "kapcie-meskie-skorzane-welna"
      ? "/produkty/kapcie-zdobione-skora-owcza"
      : null;

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
