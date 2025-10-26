import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
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
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania zamówień", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas pobierania zamówień" },
      { status: 500 }
    );
  }
}
