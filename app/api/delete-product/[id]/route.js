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
    const { id } = await context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({
        error: "Id produktu musi być liczbą",
        status: 400,
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Produkt nie został znaleziony" },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      message: "Produkt usunięty pomyślnie",
      deletedProductId: productId,
    });
  } catch (error) {
    console.error("Błąd podczas usuwania produktu:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas usuwania produktu" },
      { status: 500 }
    );
  }
}
