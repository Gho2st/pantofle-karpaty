// app/api/orders/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// === BEZPIECZNE PARSOWANIE I ZAPIS JSON ===
function parseSizes(sizes) {
  if (typeof sizes === "string") {
    try {
      return JSON.parse(sizes);
    } catch (e) {
      console.error("Błąd parsowania sizes:", e);
      return [];
    }
  }
  return Array.isArray(sizes) ? sizes : [];
}

function serializeSizes(sizes) {
  return JSON.stringify(sizes);
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);

  // Sprawdzenie autoryzacji
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
  }

  try {
    const awaitedParams = await params;
    const id = awaitedParams?.id;
    const { status } = await request.json();

    // Walidacja id
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID zamówienia" },
        { status: 400 }
      );
    }

    // Walidacja statusu
    if (!["PENDING", "PAID", "SHIPPED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Nieprawidłowy status zamówienia" },
        { status: 400 }
      );
    }

    const orderId = parseInt(id);

    // Pobierz zamówienie z itemami i produktami
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sizes: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Zamówienie nie istnieje" },
        { status: 404 }
      );
    }

    // === RESTOCK: tylko jeśli status ZMIENIA się NA CANCELLED ===
    const wasCancelled = order.status === "CANCELLED";
    const isNowCancelled = status === "CANCELLED";

    if (isNowCancelled && !wasCancelled) {
      for (const item of order.items) {
        const product = item.product;
        if (!product || !product.sizes) continue;

        let sizes = parseSizes(product.sizes);
        const sizeEntry = sizes.find((s) => s.size === item.size);

        if (sizeEntry) {
          sizeEntry.stock += item.quantity;
          console.log(
            `[RESTOCK] ${product.name} | ${item.size} +${item.quantity} → ${sizeEntry.stock}`
          );

          await prisma.product.update({
            where: { id: product.id },
            data: {
              sizes: serializeSizes(sizes),
            },
          });
        } else {
          console.warn(
            `[RESTOCK] Nie znaleziono rozmiaru ${item.size} w produkcie ${product.id}`
          );
        }
      }
    }

    // === Aktualizacja statusu zamówienia ===
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      select: {
        id: true,
        userId: true,
        email: true,
        firstName: true,
        lastName: true,
        street: true,
        city: true,
        postalCode: true,
        phone: true,
        paczkomat: true,
        totalAmount: true,
        isGuest: true,
        deliveryMethod: true,
        paymentMethod: true,
        deliveryCost: true,
        createdAt: true,
        status: true,
        paymentId: true,
        companyName: true,
        nip: true,
        items: {
          select: {
            id: true,
            name: true,
            size: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        order: updatedOrder,
        message:
          isNowCancelled && !wasCancelled
            ? "Zamówienie anulowane + stan magazynowy przywrócony"
            : "Status zaktualizowany",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd podczas aktualizacji statusu zamówienia:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas aktualizacji statusu zamówienia" },
      { status: 500 }
    );
  }
}
