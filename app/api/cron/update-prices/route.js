// app/api/update-lowest-price/route.js
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      price: true,
      promoPrice: true,
      promoStartDate: true,
      promoEndDate: true,
    },
  });

  for (const product of products) {
    const candidates = new Set([product.price]); // zawsze bierzemy cenę regularną

    // === 1. Ceny z zamówień (tylko PAID w ciągu 30 dni) ===
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: product.id,
        order: {
          status: "PAID",
          createdAt: { gte: thirtyDaysAgo },
        },
      },
      select: { price: true },
    });

    orderItems.forEach((item) => candidates.add(item.price));

    // === 2. Cena promocyjna – TYLKO jeśli była aktywna w ciągu 30 dni ===
    if (
      product.promoPrice != null &&
      product.promoPrice < product.price &&
      product.promoStartDate &&
      product.promoEndDate
    ) {
      const promoStart = new Date(product.promoStartDate);
      const promoEnd = new Date(product.promoEndDate);

      // Czy promocja zachodziła na jakikolwiek dzień w ciągu ostatnich 30 dni?
      if (promoEnd >= thirtyDaysAgo && promoStart <= new Date()) {
        candidates.add(product.promoPrice);
      }
    }

    // === 3. Oblicz najniższą cenę ===
    const lowestPrice = Math.min(...Array.from(candidates));

    // === 4. Aktualizuj tylko jeśli się zmieniła (unikamy niepotrzebnych write'ów) ===
    await prisma.product.update({
      where: { id: product.id },
      data: { lowestPrice },
    });
  }

  return NextResponse.json({
    message: "lowestPrice zaktualizowane dla wszystkich produktów",
    updatedAt: new Date().toISOString(),
  });
}
