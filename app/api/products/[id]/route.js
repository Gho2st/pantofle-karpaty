import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
export async function GET(request, context) {
  const params = await context.params;
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Nieprawidłowe ID" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        price: true,
        promoPrice: true, // DODANE
        promoEndDate: true, // DODANE
        images: true,
        description: true,
        description2: true,
        additionalInfo: true,
        lowestPrice: true,
        sizes: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
                parent: true, // jeśli chcesz głębiej
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produkt nie znaleziono" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET product error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
