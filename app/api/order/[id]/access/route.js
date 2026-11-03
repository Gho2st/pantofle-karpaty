// app/api/order/[id]/access/route.js
// Wymiana jednorazowego tokenu gościa na ciasteczko dostępu do zamówienia,
// potem przekierowanie na stronę zamówienia (bez tokenu w adresie).
import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";
import {
  ACCESS_MAX_AGE_S,
  orderAccessCookie,
  signOrderAccess,
} from "@/app/lib/orderAccess";

const sameToken = (a, b) =>
  typeof a === "string" &&
  typeof b === "string" &&
  a.length === b.length &&
  crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function GET(request, { params }) {
  const { id } = await params;
  const orderId = parseInt(id);
  const incoming = new URL(request.url);

  // Pozostałe parametry (payment=success, session_id, status=error) idą dalej
  const target = new URL(`/zamowienie/${orderId}`, request.url);
  incoming.searchParams.forEach((value, key) => {
    if (key !== "token") target.searchParams.set(key, value);
  });
  const response = NextResponse.redirect(target);

  if (isNaN(orderId)) return response;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { guestToken: true },
  });

  // Ważny token: zużyj go i daj tej przeglądarce dostęp na 30 dni.
  // Nieważny/zużyty: samo przekierowanie — strona zamówienia sprawdzi ciasteczko.
  if (order && sameToken(incoming.searchParams.get("token"), order.guestToken)) {
    await prisma.order.update({
      where: { id: orderId },
      data: { guestToken: null },
    });
    response.cookies.set(orderAccessCookie(orderId), signOrderAccess(orderId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_MAX_AGE_S,
    });
  }

  return response;
}
