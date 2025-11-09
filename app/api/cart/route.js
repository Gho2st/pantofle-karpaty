import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  try {
    if (!session) {
      return NextResponse.json({ cart: [] }, { status: 200 });
    }

    const cart = await prisma.cart.findMany({
      where: {
        userId: session.user.id,
        product: { deletedAt: null },
      },
      select: {
        id: true,
        productId: true,
        size: true,
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            promoPrice: true,
            promoEndDate: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    console.error("Błąd GET koszyka:", error);
    return NextResponse.json({ error: " | Błąd serwera" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const { productId, size, quantity } = await request.json();

  if (!productId || !size || !quantity || quantity < 1) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId), deletedAt: null }, // TYLKO AKTYWNY
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produkt nie istnieje lub został usunięty" },
        { status: 404 }
      );
    }

    let cartItem;
    if (session) {
      const existing = await prisma.cart.findFirst({
        where: {
          userId: session.user.id,
          productId: product.id,
          size,
        },
      });

      if (existing) {
        cartItem = await prisma.cart.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + parseInt(quantity) },
        });
      } else {
        cartItem = await prisma.cart.create({
          data: {
            userId: session.user.id,
            productId: product.id,
            size,
            quantity: parseInt(quantity),
          },
        });
      }
    } else {
      cartItem = { productId: product.id, size, quantity: parseInt(quantity) };
    }

    return NextResponse.json(
      { message: "Dodano do koszyka", cartItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd POST koszyka:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  const { cartItemId, quantity } = await request.json();

  if (!cartItemId || !quantity || quantity < 1) {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  try {
    if (!session) {
      return NextResponse.json(
        {
          message: "Zaktualizowano (gość)",
          cartItem: { id: cartItemId, quantity },
        },
        { status: 200 }
      );
    }

    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(cartItemId) },
      include: { product: true },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Pozycja nie znaleziona" },
        { status: 404 }
      );
    }

    // Sprawdź, czy produkt nadal istnieje
    if (cartItem.product.deletedAt !== null) {
      await prisma.cart.delete({ where: { id: cartItem.id } });
      return NextResponse.json(
        { error: "Produkt został usunięty – usunięto z koszyka" },
        { status: 410 }
      );
    }

    const updated = await prisma.cart.update({
      where: { id: cartItem.id },
      data: { quantity: parseInt(quantity) },
    });

    return NextResponse.json(
      { message: "Zaktualizowano", cartItem: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd PUT koszyka:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  const { cartItemId, clearAll, clearDead } = await request.json();

  try {
    if (!session) {
      return NextResponse.json(
        { message: "Koszyk gościa wyczyszczony" },
        { status: 200 }
      );
    }

    // Czyszczenie martwych produktów
    if (clearDead) {
      await prisma.cart.deleteMany({
        where: {
          userId: session.user.id,
          product: { deletedAt: { not: null } },
        },
      });
      return NextResponse.json(
        { message: "Usunięto martwe produkty z koszyka" },
        { status: 200 }
      );
    }

    // Czyszczenie całego koszyka
    if (clearAll) {
      await prisma.cart.deleteMany({
        where: { userId: session.user.id },
      });
      return NextResponse.json(
        { message: "Koszyk wyczyszczony" },
        { status: 200 }
      );
    }

    // Usuwanie jednej pozycji
    if (!cartItemId) {
      return NextResponse.json({ error: "Brak ID" }, { status: 400 });
    }

    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(cartItemId) },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }

    await prisma.cart.delete({ where: { id: cartItem.id } });

    return NextResponse.json(
      { message: "Usunięto z koszyka" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd DELETE koszyka:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
