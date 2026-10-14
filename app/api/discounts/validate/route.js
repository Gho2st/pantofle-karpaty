import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateDiscount } from "@/app/lib/pricing";

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();

    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Nieprawidłowy kod" }, { status: 400 });
    }

    const { discount, error } = validateDiscount(
      await prisma.discountCode.findUnique({
        where: { code: code.toUpperCase().trim() },
      }),
      Number(subtotal) || 0,
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      type: discount.type,
      value: discount.value,
      message: `Rabat ${
        discount.type === "percentage"
          ? `${discount.value}%`
          : `${discount.value} PLN`
      }`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
