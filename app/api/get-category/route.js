import { getServerSession } from "next-auth";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nieautoryzowany" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get("parentId")
    ? parseInt(searchParams.get("parentId"))
    : null;

  try {
    const categories = await prisma.category.findMany({
      where: { parentId },
      include: {
        subcategories: {
          include: {
            subcategories: {
              include: {
                subcategories: true,
                products: {
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
                    deletedAt: true, // Admin widzi usunięte
                  },
                },
              },
            },
            products: {
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
        products: {
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
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      message: "Kategorie (admin) – pełna lista",
      categories,
    });
  } catch (error) {
    console.error("Błąd GET /api/admin/categories:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
