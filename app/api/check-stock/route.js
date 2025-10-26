// /api/check-stock/route.js
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request) {
  try {
    const { cartItems } = await request.json();

    // Sprawdzenie, czy cartItems istnieje i jest tablicą
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane koszyka: brak lub niepoprawny format" },
        { status: 400 }
      );
    }

    const availability = await Promise.all(
      cartItems.map(async (item) => {
        // Weryfikacja wymaganych pól w item
        if (!item.productId || !item.size || !item.quantity) {
          return {
            productId: item.productId || "unknown",
            size: item.size || "unknown",
            available: false,
            message: `Nieprawidłowe dane elementu koszyka: brak productId, size lub quantity`,
          };
        }

        // Pobieranie produktu z bazy danych
        const product = await prisma.product.findUnique({
          where: { id: parseInt(item.productId) },
          select: { id: true, name: true, sizes: true },
        });

        // Sprawdzenie, czy produkt istnieje
        if (!product) {
          return {
            productId: item.productId,
            size: item.size,
            available: false,
            message: `Produkt ${
              item.product?.name || "nieznany"
            } nie znaleziony`,
          };
        }

        // Sprawdzenie, czy pole sizes istnieje i jest tablicą
        if (!product.sizes || !Array.isArray(product.sizes)) {
          return {
            productId: item.productId,
            size: item.size,
            available: false,
            message: `Brak danych o rozmiarach dla produktu ${product.name}`,
          };
        }

        // Wyszukiwanie rozmiaru w tablicy sizes
        const sizeData = product.sizes.find((s) => s.size === item.size);
        if (!sizeData || sizeData.stock < item.quantity) {
          return {
            productId: item.productId,
            size: item.size,
            available: false,
            message: `Niewystarczający stan magazynowy dla produktu ${
              product.name
            } (rozmiar: ${item.size}). Dostępna ilość: ${sizeData?.stock || 0}`,
          };
        }

        return {
          productId: item.productId,
          size: item.size,
          available: true,
          availableQuantity: sizeData.stock,
        };
      })
    );

    return NextResponse.json({ availability }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas sprawdzania dostępności:", error);
    return NextResponse.json(
      {
        error: "Błąd serwera podczas sprawdzania dostępności",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
