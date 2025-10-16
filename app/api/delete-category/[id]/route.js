// app/api/delete-category/[id]/route.js

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({
      error: "Nieautoryzowany dostęp",
      status: 401,
    });
  }

  try {
    // Oczekiwanie na params
    const { id } = await context.params;

    // Konwersja id na liczbę całkowitą, ponieważ Prisma oczekuje Int
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({
        error: "Id kategorii musi być liczbą",
        status: 400,
      });
    }

    // Funkcja do rekurencyjnego sprawdzania, czy kategoria i jej podkategorie nie mają produktów
    const canDeleteCategory = async (catId) => {
      const category = await prisma.category.findUnique({
        where: { id: catId },
        include: {
          products: true,
          subcategories: {
            include: {
              products: true,
              subcategories: true,
            },
          },
        },
      });

      if (!category) {
        throw new Error("Kategoria nie została znaleziona");
      }

      // Sprawdź, czy kategoria ma produkty
      if (category.products.length > 0) {
        throw new Error(
          "Nie można usunąć kategorii, która zawiera produkty. Usuń najpierw produkty."
        );
      }

      // Rekurencyjnie sprawdź podkategorie
      for (const sub of category.subcategories) {
        await canDeleteCategory(sub.id);
      }

      return true;
    };

    // Sprawdź, czy można usunąć kategorię
    await canDeleteCategory(categoryId);

    // Rekurencyjne usuwanie kategorii i jej podkategorii
    const deleteCategoryRecursively = async (catId) => {
      const category = await prisma.category.findUnique({
        where: { id: catId },
        include: { subcategories: true },
      });

      if (category) {
        // Najpierw usuń wszystkie podkategorie
        for (const sub of category.subcategories) {
          await deleteCategoryRecursively(sub.id);
        }

        // Następnie usuń bieżącą kategorię
        await prisma.category.delete({
          where: { id: catId },
        });
      }
    };

    // Wykonaj usunięcie
    await deleteCategoryRecursively(categoryId);

    return NextResponse.json({
      message: "Kategoria i jej podkategorie usunięte pomyślnie",
      deletedCategoryId: categoryId,
    });
  } catch (error) {
    console.error("Błąd podczas usuwania kategorii:", error);
    return NextResponse.json(
      { error: error.message || "Błąd serwera podczas usuwania kategorii" },
      { status: 500 }
    );
  }
}
