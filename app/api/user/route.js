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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Użytkownik nie znaleziony" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania danych użytkownika", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas pobierania danych" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Musisz być zalogowany" },
      { status: 401 }
    );
  }

  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Imię i nazwisko jest wymagane" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas aktualizacji danych użytkownika", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas aktualizacji danych" },
      { status: 500 }
    );
  }
}
