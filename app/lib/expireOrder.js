// app/lib/expireOrder.js
import prisma from "@/app/lib/prisma";

// Oznacza nieopłacone zamówienie jako EXPIRED i oddaje towar na stan.
// Zmiana statusu PENDING → EXPIRED jest warunkowa, więc nawet przy
// równoczesnym wywołaniu z webhooka i strony zamówienia stan wraca tylko raz.
// paymentId: wygasa tylko aktualna sesja Stripe — po ponowieniu płatności
// (retry-payment) wygaśnięcie starej sesji nie może anulować zamówienia.
export async function expireOrder(orderId, paymentId) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING", paymentId },
      data: { status: "EXPIRED" },
    });
    if (count === 0) return false;

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
