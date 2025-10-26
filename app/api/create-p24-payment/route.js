import { NextRequest, NextResponse } from "next/server";
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
      orderId,
      amount,
      email,
      firstName,
      lastName,
      street,
      city,
      postalCode,
    } = body;

    // Walidacja danych
    if (!orderId || !amount || !email) {
      return NextResponse.json(
        { error: "Brak wymaganych danych" },
        { status: 400 }
      );
    }

    // Dane do transakcji
    const tranData = {
      p24_merchant_id: P24_MERCHANT_ID,
      p24_pos_id: P24_POS_ID,
      p24_session_id: orderId.toString(),
      p24_amount: Math.round(amount * 100).toString(), // Kwota w groszach
      p24_currency: "PLN",
      p24_description: `Zamówienie #${orderId}`,
      p24_email: email,
      p24_country: "PL",
      p24_url_return: `https://abcd1234.ngrok.io/order/${orderId}/confirmation?status=pending`, // Zastąp ngrok URL
      p24_url_status: `https://abcd1234.ngrok.io/api/p24-callback`, // Zastąp ngrok URL
      p24_api_version: "3.2",
      p24_first_name: firstName,
      p24_last_name: lastName,
      p24_street: street,
      p24_city: city,
      p24_zip: postalCode,
      p24_language: "pl",
    };

    // Podpis MD5
    const signString = `${tranData.p24_session_id}|${tranData.p24_merchant_id}|${tranData.p24_amount}|${tranData.p24_currency}|${P24_CRC_KEY}`;
    tranData.p24_sign = crypto
      .createHash("md5")
      .update(signString)
      .digest("hex");

    // Wysłanie żądania do P24
    const response = await fetch(
      `${P24_SANDBOX_URL}/api/v1/transaction/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${P24_MERCHANT_ID}:${P24_CRC_KEY}`
          ).toString("base64")}`,
        },
        body: JSON.stringify(tranData),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.data || !result.data.token) {
      return NextResponse.json(
        { error: result.error || "Błąd inicjacji płatności" },
        { status: 500 }
      );
    }

    const token = result.data.token;

    // Zapisz token w bazie
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { p24_token: token },
    });

    // URL do przekierowania
    const redirectUrl = `${P24_SANDBOX_URL}/trnRequest/${token}`;
    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("Błąd:", error);
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 }
    );
  }
}
