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
    // --- SPRAWDZENIE ISTNIENIA RODZICA (nawet usuniętego – dla spójności) ---
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

    // --- POBIERANIE TYLKO AKTYWNYCH KATEGORII I PRODUKTÓW ---
    const categories = await prisma.category.findMany({
      where: {
        parentId,
        deletedAt: null, // TYLKO AKTYWNE KATEGORIE
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        parentId: true,
        description: true,
        deletedAt: true, // Admin widzi pole, ale tylko dla aktywnych

        // --- AKTYWNE PRODUKTY ---
        products: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            description2: true,
            additionalInfo: true,
            sizes: true,
            images: true,
            categoryId: true,
            deletedAt: true,
          },
        },

        // --- AKTYWNE PODKATEGORIE (1 poziom) ---
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

            // Aktywne produkty w podkategorii
            products: {
              where: { deletedAt: null },
              select: {
                id: true,
                name: true,
                price: true,
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
      message: "Kategorie (admin) – tylko aktywne",
      parentId,
      categories,
    });
  } catch (error) {
    console.error("Błąd GET /api/admin/categories:", error);
    return NextResponse.json(
      { error: "Błąd serwera", details: error.message },
      { status: 500 }
    );
  }
}
