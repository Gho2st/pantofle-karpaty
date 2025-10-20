import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Musisz być zalogowany" },
      { status: 401 }
    );
  }

  try {
    const id = await parseInt(params.id);
    const { street, city, postalCode, phone, paczkomat, isPrimary } =
      await request.json();

    if (!street || !city || !postalCode || !phone) {
      return NextResponse.json(
        {
          error:
            "Wszystkie pola (ulica, miasto, kod pocztowy, telefon) są wymagane",
        },
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

    // If isPrimary is true, set all other addresses to isPrimary: false
    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        street,
        city,
        postalCode,
        phone,
        paczkomat: paczkomat || null,
        isPrimary: isPrimary || false,
        user: {
          connect: { id: session.user.id },
        },
      },
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

export async function PATCH(request, { params }) {
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

    // Set all other addresses to isPrimary: false
    await prisma.address.updateMany({
      where: { userId: session.user.id, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set the selected address as primary
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: { isPrimary: true },
    });

    return NextResponse.json(
      { message: "Adres ustawiony jako główny", id: updatedAddress.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Błąd podczas ustawiania głównego adresu:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas ustawiania głównego adresu" },
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

    // Prevent deleting the primary address if there are other addresses
    if (address.isPrimary) {
      const otherAddresses = await prisma.address.findMany({
        where: { userId: session.user.id, id: { not: id } },
      });
      if (otherAddresses.length > 0) {
        return NextResponse.json(
          { error: "Nie można usunąć głównego adresu, ustaw inny jako główny" },
          { status: 400 }
        );
      }
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
