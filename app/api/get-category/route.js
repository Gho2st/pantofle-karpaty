import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nieautoryzowany dostęp" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId")
    ? parseInt(searchParams.get("parentId"))
    : null;

  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId, // Pobierz kategorie główne lub podkategorie
      },
      include: {
        subcategories: {
          include: {
            subcategories: {
              include: {
                subcategories: true, // Rekurencyjne podkategorie
                products: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    description: true,
                  },
                },
              },
            },
            products: {
              select: { id: true, name: true, price: true, description: true },
            },
          },
        },
        products: {
          select: { id: true, name: true, price: true, description: true },
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
      { error: "Błąd serwera podczas pobierania danych" },
      { status: 500 }
    );
  }
}
