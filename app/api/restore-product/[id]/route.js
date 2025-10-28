import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }
  const awaitedParams = await params;
  const { id } = awaitedParams;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Nieprawidłowe ID" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, deletedAt: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produkt nie istnieje" },
        { status: 404 }
      );
    }

    if (!product.deletedAt) {
      return NextResponse.json({ message: "Produkt nie jest usunięty" });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: null },
    });

    return NextResponse.json({
      message: "Produkt przywrócony",
      restoredProductId: productId,
    });
  } catch (error) {
    console.error("Błąd przywracania:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
