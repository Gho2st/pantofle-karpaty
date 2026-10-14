// app/api/cron/expire-transfers/route.js
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { expireUnpaidTransfer } from "@/app/lib/releaseOrder";

export const dynamic = "force-dynamic";

// Klient ma "7 dni roboczych" na przelew (TraditionalPaymentInstructions.js).
// +1 dzień roboczy zapasu na zaksięgowanie przelewu i święta.
const PAYMENT_BUSINESS_DAYS = 7;
const BOOKING_BUFFER_BUSINESS_DAYS = 1;

function subtractBusinessDays(date, days) {
  const result = new Date(date);
  while (days > 0) {
    result.setDate(result.getDate() - 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) days--;
  }
  return result;
}

export async function GET(request) {
  // Vercel Cron wysyła nagłówek Authorization: Bearer <CRON_SECRET>
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  }

  const cutoff = subtractBusinessDays(
    new Date(),
    PAYMENT_BUSINESS_DAYS + BOOKING_BUFFER_BUSINESS_DAYS,
  );

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
