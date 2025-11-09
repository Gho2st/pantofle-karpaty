import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();

    const discount = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount || !discount.isActive) {
      return NextResponse.json({ error: "Nieprawidłowy kod" }, { status: 400 });
    }

    const now = new Date();
    if (discount.validFrom && now < discount.validFrom) {
      return NextResponse.json(
        { error: "Kod jeszcze nieaktywny" },
        { status: 400 }
      );
    }
    if (discount.validTo && now > discount.validTo) {
      return NextResponse.json({ error: "Kod wygasł" }, { status: 400 });
    }
    if (discount.minOrderValue && subtotal < discount.minOrderValue) {
      return NextResponse.json(
        { error: `Minimalna kwota: ${discount.minOrderValue} PLN` },
        { status: 400 }
      );
    }
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return NextResponse.json({ error: "Kod wyczerpany" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      type: discount.type,
      value: discount.value,
      message: `Rabat ${
        discount.type === "percentage"
          ? `$$ {discount.value}%`
          : ` $${discount.value} PLN`
      }`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
