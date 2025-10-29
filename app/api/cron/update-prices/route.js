// app/api/cron/update-prices/route.js
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await prisma.$executeRaw`
    UPDATE "Product" AS p
    SET "lowestPrice" = (
      SELECT COALESCE(MIN(oi.price), p.price)
      FROM "OrderItem" oi
      JOIN "Order" o ON oi."orderId" = o.id
      WHERE oi."productId" = p.id
        AND o.status = 'PAID'
        AND o."createdAt" >= ${thirtyDaysAgo}
    )
    WHERE p."deletedAt" IS NULL
  `;

  return NextResponse.json({ message: "Ceny zaktualizowane!" });
}
