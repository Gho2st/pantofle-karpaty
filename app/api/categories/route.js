import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  console.log("Prisma:", prisma); // Sprawdź, czy prisma jest zdefiniowane
  console.log("Prisma.category:", prisma.category); // Sprawdź, czy prisma.category istnieje

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId")
    ? parseInt(searchParams.get("parentId"))
    : null;

  try {
    const categories = await prisma.category.findMany({
      where: { parentId },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      message: "Kategorie pobrane pomyślnie",
      categories,
    });
  } catch (error) {
    console.error("Błąd podczas pobierania kategorii:", error);
    return NextResponse.json(
      {
        error: "Błąd serwera podczas pobierania danych",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
