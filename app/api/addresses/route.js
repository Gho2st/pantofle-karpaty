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

    // If isPrimary is true, set all other addresses to isPrimary: false
    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const address = await prisma.address.create({
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

    return NextResponse.json({ id: address.id }, { status: 201 });
  } catch (error) {
    console.error("Błąd podczas dodawania adresu:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas dodawania adresu" },
      { status: 500 }
    );
  }
}
