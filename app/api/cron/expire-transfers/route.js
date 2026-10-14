// app/api/cron/expire-transfers/route.js
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { expireUnpaidTransfer } from "@/app/lib/releaseOrder";
import {
  TRANSFER_EXPIRY_BUSINESS_DAYS,
  subtractBusinessDays,
} from "@/app/lib/transferDeadline";

export const dynamic = "force-dynamic";

export async function GET(request) {
  // Vercel Cron wysyła nagłówek Authorization: Bearer <CRON_SECRET>
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  }

  const cutoff = subtractBusinessDays(new Date(), TRANSFER_EXPIRY_BUSINESS_DAYS);

  const orders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      paymentMethod: "traditional",
      createdAt: { lt: cutoff },
    },
    select: { id: true },
  });

  const expired = [];
  for (const { id } of orders) {
    if (await expireUnpaidTransfer(id)) expired.push(id);
  }

  if (expired.length > 0) {
    console.log(
      `Wygaszono nieopłacone przelewy (towar wrócił na stan): ${expired.join(", ")}`,
    );
  }

  return NextResponse.json({ expired, cutoff: cutoff.toISOString() });
}
