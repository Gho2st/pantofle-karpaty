import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  try {
    let cart = [];
    if (session) {
      // Dla zalogowanych użytkowników pobierz koszyk z bazy danych
      cart = await prisma.cart.findMany({
        where: { userId: session.user.id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
        },
      });
    }
    // Zwracamy koszyk (pusty dla niezalogowanych, jeśli nie używasz sesji lokalnej)
    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania koszyka:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas pobierania koszyka" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Musisz być zalogowany, aby dodać produkt do koszyka" },
      { status: 401 }
    );
  }

  try {
    const { productId, size, quantity } = await request.json();

    if (!productId || !size || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane produktu" },
        { status: 400 }
      );
    }

    // Sprawdź, czy produkt istnieje
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { sizes: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produkt nie znaleziony" },
        { status: 404 }
      );
    }

    // Sprawdź dostępność rozmiaru i stanu magazynowego
    const sizeData = product.sizes.find((s) => s.size === size);
    if (!sizeData || sizeData.stock < quantity) {
      return NextResponse.json(
        { error: `Niewystarczający stan magazynowy dla rozmiaru ${size}` },
        { status: 400 }
      );
    }

    // Sprawdź, czy produkt w danym rozmiarze już istnieje w koszyku
    let cartItem = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
        productId: parseInt(productId),
        size,
      },
    });

    if (cartItem) {
      // Zaktualizuj ilość, jeśli produkt już jest w koszyku
      cartItem = await prisma.cart.update({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity + parseInt(quantity) },
      });
    } else {
      // Dodaj nowy produkt do koszyka
      cartItem = await prisma.cart.create({
        data: {
          userId: session.user.id,
          productId: parseInt(productId),
          size,
          quantity: parseInt(quantity),
        },
      });
    }

    return NextResponse.json(
      { message: "Produkt dodany do koszyka", cartItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd podczas dodawania do koszyka:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas dodawania do koszyka" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Musisz być zalogowany, aby zaktualizować koszyk" },
      { status: 401 }
    );
  }

  try {
    const { cartItemId, quantity } = await request.json();

    if (!cartItemId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane" },
        { status: 400 }
      );
    }

    // Sprawdź, czy pozycja w koszyku istnieje
    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(cartItemId) },
      include: { product: { select: { sizes: true } } },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Pozycja w koszyku nie znaleziona" },
        { status: 404 }
      );
    }

    // Sprawdź stan magazynowy
    const sizeData = cartItem.product.sizes.find(
      (s) => s.size === cartItem.size
    );
    if (!sizeData || sizeData.stock < quantity) {
      return NextResponse.json(
        {
          error: `Niewystarczający stan magazynowy dla rozmiaru ${cartItem.size}`,
        },
        { status: 400 }
      );
    }

    // Zaktualizuj ilość
    const updatedCartItem = await prisma.cart.update({
      where: { id: parseInt(cartItemId) },
      data: { quantity: parseInt(quantity) },
    });

    return NextResponse.json(
      { message: "Koszyk zaktualizowany", cartItem: updatedCartItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd podczas aktualizacji koszyka:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas aktualizacji koszyka" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Musisz być zalogowany, aby usunąć produkt z koszyka" },
      { status: 401 }
    );
  }

  try {
    const { cartItemId } = await request.json();

    if (!cartItemId) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID pozycji w koszyku" },
        { status: 400 }
      );
    }

    // Sprawdź, czy pozycja w koszyku istnieje
    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(cartItemId) },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Pozycja w koszyku nie znaleziona" },
        { status: 404 }
      );
    }

    // Usuń pozycję z koszyka
    await prisma.cart.delete({
      where: { id: parseInt(cartItemId) },
    });

    return NextResponse.json(
      { message: "Produkt usunięty z koszyka" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd podczas usuwania z koszyka:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas usuwania z koszyka" },
      { status: 500 }
    );
  }
}
