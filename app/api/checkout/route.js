import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// To jest miejsce na Twoją przyszłą integrację z Przelewy24
// Na razie zwraca link do strony podsumowania
async function handleP24Payment(order, formData, total) {
  // W przyszłości tutaj będzie kod komunikujący się z API Przelewy24

  // Na potrzeby testów, generujemy link, który symuluje udaną płatność
  const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie/${order.id}?status=success`;
  return redirectUrl;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const {
      cartItems,
      formData,
      total,
      deliveryCost,
      paymentMethod,
      deliveryMethod,
    } = body;

    let userId = null;
    let isGuest = true;

    // Jeśli użytkownik jest zalogowany, znajdź jego ID
    if (session && session.user && session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        userId = user.id;
        isGuest = false;
      }
    }

    // Stwórz zamówienie w bazie danych
    const createdOrder = await prisma.order.create({
      data: {
        userId: userId,
        isGuest: isGuest,
        totalAmount: parseFloat(total),
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        phone: formData.phone,
        paczkomat: formData.parcelLocker || null,
        // Upewnij się, że te pola istnieją w Twoim modelu `Order` w schema.prisma
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
        deliveryCost: parseFloat(deliveryCost),
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            name: item.product.name, // Zapisz nazwę produktu na stałe
            quantity: item.quantity,
            price: item.product.price,
            size: item.size,
          })),
        },
      },
    });

    let redirectUrl;

    if (paymentMethod === "p24") {
      redirectUrl = await handleP24Payment(createdOrder, formData, total);
    } else {
      // Dla przelewu tradycyjnego, przekieruj od razu na stronę podsumowania
      redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie/${createdOrder.id}`;
    }

    return NextResponse.json({ redirectUrl: redirectUrl });
  } catch (error) {
    console.error("Błąd w /api/checkout:", error);
    return NextResponse.json(
      { error: "Wystąpił nieoczekiwany błąd" },
      { status: 500 }
    );
  }
}
