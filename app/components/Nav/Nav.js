// app/components/ServerNav.tsx
import prisma from "@/app/lib/prisma";
import ClientNav from "./ClientNav";

async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null, deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      subcategories: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });
}

export default async function ServerNav() {
  const categories = await getCategories();
  return <ClientNav initialCategories={categories} />;
}
