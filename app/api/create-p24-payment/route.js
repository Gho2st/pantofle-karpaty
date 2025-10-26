import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";

const P24_SANDBOX_URL = process.env.P24_SANDBOX_URL;
const P24_MERCHANT_ID = process.env.P24_MERCHANT_ID;
const P24_POS_ID = process.env.P24_POS_ID;
const P24_CRC_KEY = process.env.P24_CRC_KEY;

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      p24_merchant_id,
      p24_order_id,
      p24_session_id,
      p24_amount,
      p24_currency,
      p24_sign,
    } = body;

    // Weryfikacja podpisu
    const signString = `${p24_session_id}|${p24_order_id}|${p24_amount}|${p24_currency}|${P24_CRC_KEY}`;
    const expectedSign = crypto
      .createHash("md5")
      .update(signString)
      .digest("hex");

    if (p24_sign !== expectedSign) {
      return NextResponse.json(
        { error: "Nieprawidłowy podpis" },
        { status: 400 }
      );
    }

    // Weryfikacja transakcji
    const verifyData = {
      p24_merchant_id: P24_MERCHANT_ID,
      p24_pos_id: P24_POS_ID,
      p24_session_id: p24_session_id,
      p24_amount: p24_amount,
      p24_currency: p24_currency,
      p24_order_id: p24_order_id,
      p24_sign: crypto
        .createHash("md5")
        .update(
          `${p24_session_id}|${p24_order_id}|${p24_amount}|${p24_currency}|${P24_CRC_KEY}`
        )
        .digest("hex"),
    };

    const verifyResponse = await fetch(
      `${P24_SANDBOX_URL}/api/v1/transaction/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${P24_MERCHANT_ID}:${P24_CRC_KEY}`
          ).toString("base64")}`,
        },
        body: JSON.stringify(verifyData),
      }
    );

    const verifyResult = await verifyResponse.json();
    const paymentStatus =
      verifyResult.data?.status === "success" ? "PAID" : "FAILED";

    // Aktualizacja statusu w bazie
    await prisma.order.update({
      where: { id: parseInt(p24_order_id) },
      data: { paymentStatus },
    });

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Błąd w /api/p24-callback:", error);
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    );
  }
}
