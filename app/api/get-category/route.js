import { getServerSession } from "next-auth";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  // --- AUTORYZACJA ---
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }

  // --- PARAMS ---
  const { searchParams } = new URL(request.url);
  const parentIdParam = searchParams.get("parentId");
  const parentId = parentIdParam ? parseInt(parentIdParam, 10) : null;

  // Walidacja parentId
  if (parentId !== null && isNaN(parentId)) {
    return NextResponse.json(
      { error: "Nieprawidłowy parentId" },
      { status: 400 }
    );
  }

  try {
    // --- SPRAWDZENIE ISTNIENIA RODZICA ---
    if (parentId !== null) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId },
        select: { id: true },
      });
      if (!parentExists) {
        return NextResponse.json(
          { error: "Kategoria nadrzędna nie istnieje" },
          { status: 404 }
        );
      }
    }

    // --- POBIERANIE AKTYWNYCH KATEGORII + PRODUKTY Z PROMOCJĄ ---
    const categories = await prisma.category.findMany({
      where: {
        parentId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        parentId: true,
        description: true,
        deletedAt: true,

        // --- PRODUKTY (główne) ---
        products: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            price: true,
            promoPrice: true, // DODANE
            promoStartDate: true, // DODANE
            promoEndDate: true, // DODANE
            lowestPrice: true, // DODANE
            description: true,
            description2: true,
            additionalInfo: true,
            sizes: true,
            images: true,
            categoryId: true,
            deletedAt: true,
          },
        },

        // --- PODKATEGORIE (1 poziom) ---
        subcategories: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            parentId: true,
            deletedAt: true,
            description: true,

            // Produkty w podkategorii – z promocją
            products: {
              where: { deletedAt: null },
              select: {
                id: true,
                name: true,
                price: true,
                promoPrice: true, // DODANE
                promoStartDate: true, // DODANE
                promoEndDate: true, // DODANE
                lowestPrice: true, // DODANE
                description: true,
                description2: true,
                additionalInfo: true,
                sizes: true,
                images: true,
                categoryId: true,
                deletedAt: true,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      message: "Kategorie (admin) – tylko aktywne + ceny promocyjne",
      parentId,
      categories,
    });
  } catch (error) {
    console.error("Błąd GET /api/get-category:", error);
    return NextResponse.json(
      { error: "Błąd serwera", details: error.message },
      { status: 500 }
    );
  }
}
