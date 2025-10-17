import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
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

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({
      error: "Nieautoryzowany dostęp",
      status: 401,
    });
  }

  try {
    const {
      name,
      price,
      description,
      description2,
      additionalInfo,
      sizes,
      categoryId,
    } = await request.json();

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Nazwa, cena i ID kategorii są wymagane" },
        { status: 400 }
      );
    }

    // Sprawdź, czy kategoria istnieje
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Kategoria nie została znaleziona" },
        { status: 404 }
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

    // Walidacja sizes
    validateSizes(sizes);

    // Utwórz nowy produkt
    const product = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        description: description || null,
        description2: description2 || null,
        additionalInfo: additionalInfo || null,
        sizes: sizes || null,
        categoryId: parseInt(categoryId),
      },
    });

    return NextResponse.json({
      message: "Produkt dodany pomyślnie",
      product,
    });
  } catch (error) {
    console.error("Błąd podczas dodawania produktu:", error);
    return NextResponse.json(
      { error: error.message || "Błąd serwera podczas dodawania produktu" },
      { status: 500 }
    );
  }
}
