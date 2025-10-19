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
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
    });
    return NextResponse.json({ addresses }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania adresów:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas pobierania adresów" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Musisz być zalogowany" },
      { status: 401 }
    );
  }

  try {
    const { street, city, postalCode, phone, paczkomat } = await request.json();

    if (!street || !city || !postalCode || !phone || !paczkomat) {
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane" },
        { status: 400 }
      );
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        street,
        city,
        postalCode,
        phone,
        paczkomat,
      },
    });

    return NextResponse.json({ id: address.id }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas dodawania adresu:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas dodawania adresu" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Musisz być zalogowany" },
      { status: 401 }
    );
  }

  try {
    const id = parseInt(params.id);
    const { street, city, postalCode, phone, paczkomat } = await request.json();

    if (!street || !city || !postalCode || !phone || !paczkomat) {
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane" },
        { status: 400 }
      );
    }

    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Adres nie znaleziony lub brak uprawnień" },
        { status: 404 }
      );
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: { street, city, postalCode, phone, paczkomat },
    });

    return NextResponse.json(
      { message: "Adres zaktualizowany", id: updatedAddress.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd podczas aktualizacji adresu:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas aktualizacji adresu" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Musisz być zalogowany" },
      { status: 401 }
    );
  }

  try {
    const id = parseInt(params.id);
    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Adres nie znaleziony lub brak uprawnień" },
        { status: 404 }
      );
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Adres usunięty" }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas usuwania adresu:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas usuwania adresu" },
      { status: 500 }
    );
  }
}
