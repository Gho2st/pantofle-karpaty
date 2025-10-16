import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request, context) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({
      error: "Nieautoryzowany dostęp",
      status: 401,
    });
  }

  try {
    const { id } = await context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({
        error: "Id produktu musi być liczbą",
        status: 400,
      });
    }

    const { name, price, description } = await request.json();

    if (!name || !price) {
      return NextResponse.json(
        { error: "Nazwa i cena produktu są wymagane" },
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

    // Zaktualizuj produkt
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price: parseFloat(price),
        description,
      },
    });

    return NextResponse.json({
      message: "Produkt zaktualizowany pomyślnie",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji produktu:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas aktualizacji produktu" },
      { status: 500 }
    );
  }
}
