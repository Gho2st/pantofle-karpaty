import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { CATALOG_TAG } from "@/app/lib/revalidateCatalog";

// Lista kategorii jest pobierana przez przeglądarkę przy każdym wejściu do sklepu —
// bez cache każde wejście (także robotów) budziło bazę. Czyszczone przez revalidateCatalog.
const getCategories = unstable_cache(
  (parentId) =>
    prisma.category.findMany({
      where: {
        parentId,
        deletedAt: null, // TYLKO AKTYWNE KATEGORIE
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        subcategories: {
          where: {
            deletedAt: null, // TYLKO AKTYWNE PODKATEGORIE
          },
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            products: {
              where: {
                deletedAt: null, // TYLKO AKTYWNE PRODUKTY
              },
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
                sortOrder: true, // potrzebne do sortowania (nawet jeśli nie zwracamy)
              },
              orderBy: [
                { sortOrder: "asc" }, // 1, 2, 3, 4… → ręczna kolejność
                { id: "asc" }, // jeśli sortOrder null → po ID (stabilnie)
              ],
            },
          },
        },
      },
      orderBy: { id: "asc" },
    }),
  ["categories"],
  { tags: [CATALOG_TAG], revalidate: 86400 },
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId")
    ? parseInt(searchParams.get("parentId"))
    : null;

  try {
    const categories = await getCategories(parentId);

    return NextResponse.json({
      message: "Kategorie pobrane pomyślnie",
      categories,
    });
  } catch (error) {
    console.error("Błąd podczas pobierania kategorii:", error);
    return NextResponse.json(
      {
        error: "Błąd serwera podczas pobierania danych",
      },
      { status: 500 },
    );
  }
}
