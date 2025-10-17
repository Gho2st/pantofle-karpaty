import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

function validateSizes(sizes) {
  if (!sizes) return true; // sizes jest opcjonalne
  if (!Array.isArray(sizes)) {
    throw new Error("Pole sizes musi być tablicą");
  }
  sizes.forEach((item) => {
    if (!item.size || typeof item.stock !== "number" || item.stock < 0) {
      throw new Error("Nieprawidłowy format rozmiaru lub stanu");
    }
  });
  return true;
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({
      error: "Nieautoryzowany dostęp",
      status: 401,
    });
  }

  try {
    const { id } = params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({
        error: "ID produktu musi być liczbą",
        status: 400,
      });
    }

    const {
      name,
      price,
      description,
      description2,
      additionalInfo,
      sizes,
      categoryId,
    } = await request.json();

    if (!name || !price) {
      return NextResponse.json(
        { error: "Nazwa i cena produktu są wymagane" },
        { status: 400 }
      );
    }

    // Walidacja ceny
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "Cena musi być dodatnią liczbą" },
        { status: 400 }
      );
    }

    // Sprawdź, czy produkt istnieje
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Produkt nie został znaleziony" },
        { status: 404 }
      );
    }

    // Sprawdź, czy kategoria istnieje (jeśli przesłano categoryId)
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Kategoria nie została znaleziona" },
          { status: 404 }
        );
      }
    }

    // Walidacja sizes
    validateSizes(sizes);

    // Zaktualizuj produkt
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price: parsedPrice,
        description: description || null,
        description2: description2 || null,
        additionalInfo: additionalInfo || null,
        sizes: sizes || null,
        categoryId: categoryId ? parseInt(categoryId) : product.categoryId, // Zachowaj istniejące categoryId, jeśli nie przesłano nowego
      },
    });

    return NextResponse.json({
      message: "Produkt zaktualizowany pomyślnie",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji produktu:", error);
    return NextResponse.json(
      { error: error.message || "Błąd serwera podczas aktualizacji produktu" },
      { status: 500 }
    );
  }
}
