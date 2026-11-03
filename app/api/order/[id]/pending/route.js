// app/api/order/[id]/pending/route.js
// Czy zamówienie nadal czeka na płatność — dla banera "Dokończ płatność"
// w koszyku. Dostęp tylko z podpisanym tokenem wydanym przy składaniu zamówienia.
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { verifyRetryToken } from "@/app/lib/retryToken";

export async function POST(request, { params }) {
  const { id } = await params;
  const orderId = parseInt(id);
  const { retryToken } = await request.json().catch(() => ({}));

  if (isNaN(orderId) || !verifyRetryToken(orderId, retryToken)) {
    return NextResponse.json({ pending: false });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, paymentMethod: true, totalAmount: true },
  });

  const pending =
    order?.status === "PENDING" && order.paymentMethod === "stripe";
  return NextResponse.json(
    pending
      ? { pending: true, totalAmount: order.totalAmount }
      : { pending: false }
  );
}
