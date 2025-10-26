import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);

  // Sprawdzenie autoryzacji
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
  }

  try {
    const awaitedParams = await params;
    const id = awaitedParams?.id; // Pobieranie id z params (zamiast orderId)
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

    // Sprawdzenie, czy zamówienie istnieje
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Zamówienie nie istnieje" },
        { status: 404 }
      );
    }

    // Aktualizacja statusu zamówienia
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
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

    return NextResponse.json({ order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas aktualizacji statusu zamówienia:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas aktualizacji statusu zamówienia" },
      { status: 500 }
    );
  }
}
