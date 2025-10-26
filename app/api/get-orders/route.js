import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Musisz być zalogowany" },
      { status: 401 }
    );
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
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
