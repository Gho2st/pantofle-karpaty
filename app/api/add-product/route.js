import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({
      error: "Nieautoryzowany dostęp",
      status: 401,
    });
  }

  try {
    const { name, price, description, categoryId } = await request.json();

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

    // Utwórz nowy produkt
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description,
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
      { error: "Błąd serwera podczas dodawania produktu" },
      { status: 500 }
    );
  }
}
