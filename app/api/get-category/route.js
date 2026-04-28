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
  const parentIdParam = searchParams.get("parentId");
  const parentId = parentIdParam ? parseInt(parentIdParam, 10) : null;

  if (parentId !== null && isNaN(parentId)) {
    return NextResponse.json(
      { error: "Nieprawidłowy parentId" },
      { status: 400 },
    );
  }

  try {
    if (parentId !== null) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId },
        select: { id: true },
      });
      if (!parentExists) {
        return NextResponse.json(
          { error: "Kategoria nadrzędna nie istnieje" },
          { status: 404 },
        );
      }
    }

    const productSelect = {
      id: true,
      name: true,
      slug: true,
      price: true,
      promoPrice: true,
      promoStartDate: true,
      promoEndDate: true,
      lowestPrice: true,
      description: true,
      description2: true,
      additionalInfo: true,
      sizes: true,
      images: true,
      categoryId: true,
      deletedAt: true,
      sortOrder: true,
      featured: true,
      colorHex: true,
      colorGroup: true,
    };

    const productOrderBy = [{ sortOrder: "asc" }, { id: "asc" }];

    const categories = await prisma.category.findMany({
      where: {
        parentId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        parentId: true,
        description: true,
        deletedAt: true,

        products: {
          where: { deletedAt: null },
          select: productSelect,
          orderBy: productOrderBy,
        },

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
            products: {
              select: productSelect,
              orderBy: productOrderBy,
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const parseJsonFields = (data) => {
      if (Array.isArray(data)) {
        return data.map(parseJsonFields);
      }
      if (data && typeof data === "object") {
        const parsed = { ...data };

        if (parsed.sizes != null) {
          if (typeof parsed.sizes === "string") {
            try {
              parsed.sizes = JSON.parse(parsed.sizes);
            } catch (e) {
              parsed.sizes = [];
            }
          } else if (!Array.isArray(parsed.sizes)) {
            parsed.sizes = [];
          }
        } else {
          parsed.sizes = [];
        }

        if (parsed.images != null) {
          if (typeof parsed.images === "string") {
            try {
              parsed.images = JSON.parse(parsed.images);
            } catch (e) {
              parsed.images = [];
            }
          } else if (!Array.isArray(parsed.images)) {
            parsed.images = [];
          }
        } else {
          parsed.images = [];
        }

        if (parsed.products) parsed.products = parseJsonFields(parsed.products);
        if (parsed.subcategories)
          parsed.subcategories = parseJsonFields(parsed.subcategories);

        return parsed;
      }
      return data;
    };

    const parsedCategories = parseJsonFields(categories);

    return NextResponse.json({
      message: "Kategorie (admin) – tylko aktywne + ceny promocyjne",
      parentId,
      categories: parsedCategories,
    });
  } catch (error) {
    console.error("Błąd GET /api/get-category:", error);
    return NextResponse.json(
      { error: "Błąd serwera", details: error.message },
      { status: 500 },
    );
  }
}
