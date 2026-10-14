// app/lib/releaseOrder.js
import prisma from "@/app/lib/prisma";

// Zamówienia w tych statusach trzymają towar zdjęty ze stanu.
const ACTIVE_STATUSES = ["PENDING", "PAID", "SHIPPED"];

// Nieopłacone zamówienie → EXPIRED, towar wraca na stan.
// paymentId: wygasa tylko aktualna sesja Stripe — po ponowieniu płatności
// (retry-payment) wygaśnięcie starej sesji nie może anulować zamówienia.
export function expireOrder(orderId, paymentId) {
  return releaseOrder(
    { id: orderId, status: "PENDING", paymentId },
    "EXPIRED",
  );
}

// Anulowanie przez admina → CANCELLED, towar wraca na stan.
export function cancelOrder(orderId) {
  return releaseOrder(
    { id: orderId, status: { in: ACTIVE_STATUSES } },
    "CANCELLED",
  );
}

// Zmiana statusu jest warunkowa, więc przy równoczesnych wywołaniach
// (webhook + strona zamówienia, podwójne kliknięcie) towar wraca tylko raz.
// Zwraca false, jeśli zamówienie nie spełniało warunku.
async function releaseOrder(where, newStatus) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where,
      data: { status: newStatus },
    });
    if (count === 0) return false;

    const orderId = where.id;

    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    for (const item of order.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product?.sizes) continue;
      const sizes =
        typeof product.sizes === "string"
          ? JSON.parse(product.sizes)
          : product.sizes;
      const sizeIndex = sizes.findIndex((s) => s.size === item.size);
      if (sizeIndex === -1) continue;
      sizes[sizeIndex].stock += item.quantity;
      await tx.product.update({
        where: { id: item.productId },
        data: { sizes: JSON.stringify(sizes) },
      });
    }

    if (order.discountCode) {
      await tx.discountCode.updateMany({
        where: { code: order.discountCode, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      });
    }

    return true;
  });
}
