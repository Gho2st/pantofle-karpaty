import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId")
    ? parseInt(searchParams.get("parentId"))
    : null;

  try {
    if (!prisma.category) {
      throw new Error("Prisma.category is undefined");
    }

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
              where: {
                deletedAt: null, // TYLKO AKTYWNE PRODUKTY
              },
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
