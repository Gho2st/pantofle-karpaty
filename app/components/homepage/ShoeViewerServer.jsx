// app/components/ShoeViewerServer.jsx
// Użycie: <ShoeViewerServer colorGroup="klapki-mule" />
// lub:    <ShoeViewerServer featured />

import prisma from "@/app/lib/prisma";
import ShoeViewer from "./Shoeviewer";

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

async function fetchVariants({ colorGroup, featured }) {
  const where = colorGroup
    ? { colorGroup, deletedAt: null }
    : { featured: true, deletedAt: null };

  return prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      colorHex: true,
      images: true,
    },
    orderBy: { sortOrder: "asc" },
  });
}

export default async function ShoeViewerServer({ colorGroup, featured }) {
  const products = await fetchVariants({ colorGroup, featured });

  if (!products.length) return null;

  const variants = products.map((p) => ({
    label: p.name,
    color: p.colorHex ?? "#888888",
    href: `/produkty/${p.slug}`,
    images: fixJsonField(p.images),
  }));

  return <ShoeViewer variants={variants} />;
}
