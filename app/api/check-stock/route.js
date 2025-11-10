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

        const productId = parseInt(item.productId);
        if (isNaN(productId)) {
          return {
            productId: item.productId,
            size: item.size,
            available: false,
            message: `Nieprawidłowy ID produktu: ${item.productId}`,
          };
        }

        // Pobieranie produktu z bazy danych
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true, sizes: true },
        });

        // Sprawdzenie, czy produkt istnieje
        if (!product) {
          return {
            productId: item.productId,
            size: item.size,
            available: false,
            message: `Produkt o ID ${item.productId} nie znaleziony`,
          };
        }

        // === KLUCZOWA POPRAWKA: Obsługa sizes jako string (JSON.stringify) ===
        let sizes = product.sizes;

        // Jeśli sizes to string (np. '[{"size":"37","stock":1}]'), sparsuj go
        if (typeof sizes === "string") {
          try {
            sizes = JSON.parse(sizes);
            // console.log(`[DEBUG] Parsowanie JSON udane:`, sizes);
          } catch (parseError) {
            console.error(
              `[ERROR] Błąd parsowania JSON dla produktu ${product.name}:`,
              parseError
            );
            return {
              productId: item.productId,
              size: item.size,
              available: false,
              message: `Błąd formatu danych rozmiarów dla produktu ${product.name}`,
            };
          }
        }

        // Teraz sprawdzamy, czy sizes jest tablicą
        if (!sizes || !Array.isArray(sizes)) {
          return {
            productId: item.productId,
            size: item.size,
            available: false,
            message: `Brak danych o rozmiarach dla produktu ${product.name}`,
          };
        }

        // Wyszukiwanie rozmiaru w tablicy sizes
        const sizeData = sizes.find((s) => s.size === item.size);

        if (!sizeData) {
          return {
            productId: item.productId,
            size: item.size,
            available: false,
            message: `Rozmiar ${item.size} nie istnieje dla produktu ${product.name}`,
          };
        }

        if (sizeData.stock < item.quantity) {
          return {
            productId: item.productId,
            size: item.size,
            available: false,
            message: `Niewystarczający stan magazynowy dla produktu ${product.name} (rozmiar: ${item.size}). Dostępne: ${sizeData.stock}, żądane: ${item.quantity}`,
          };
        }

        // Wszystko OK
        return {
          productId: item.productId,
          size: item.size,
          available: true,
          availableQuantity: sizeData.stock,
          productName: product.name, // opcjonalnie
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
