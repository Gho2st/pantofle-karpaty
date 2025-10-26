import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const validateNip = (nip) => {
  if (!nip) return false;
  const nipClean = nip.replace(/[-\s]/g, "");
  return /^\d{10}$/.test(nipClean);
};

async function handleP24Payment(order, formData, total) {
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

    // Walidacja NIP, jeśli podano
    if (formData.companyName || formData.nip) {
      if (!formData.companyName || !formData.nip) {
        throw new Error("Nazwa firmy i NIP są wymagane dla zakupu na firmę");
      }
      if (!validateNip(formData.nip)) {
        throw new Error("NIP musi składać się z dokładnie 10 cyfr");
      }
    }

    let userId = null;
    let isGuest = true;

    if (session && session.user && session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (user) {
        userId = user.id;
        isGuest = false;
      }
    }

    const { createdOrder } = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
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
          paymentMethod: paymentMethod,
          deliveryMethod: deliveryMethod,
          deliveryCost: parseFloat(deliveryCost),
          companyName: formData.companyName || null,
          nip: formData.nip || null,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
              size: item.size,
            })),
          },
        },
      });

      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.sizes || !Array.isArray(product.sizes)) {
          throw new Error(
            `Nie można znaleźć produktu lub informacji o rozmiarach dla ID: ${item.productId}`
          );
        }

        const newSizes = [...product.sizes];
        const sizeIndex = newSizes.findIndex((s) => s.size === item.size);

        if (sizeIndex === -1) {
          throw new Error(
            `Produkt ${product.name} (ID: ${item.productId}) nie ma rozmiaru: ${item.size}`
          );
        }

        if (newSizes[sizeIndex].stock < item.quantity) {
          throw new Error(
            `Niewystarczający stan magazynowy dla ${product.name} (Rozmiar: ${item.size}). Dostępne: ${newSizes[sizeIndex].stock}, Wymagane: ${item.quantity}`
          );
        }

        newSizes[sizeIndex].stock -= item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { sizes: newSizes },
        });
      }

      return { createdOrder: order };
    });

    let redirectUrl;

    if (paymentMethod === "p24") {
      redirectUrl = await handleP24Payment(createdOrder, formData, total);
    } else {
      redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie/${createdOrder.id}`;
    }

    return NextResponse.json({ redirectUrl: redirectUrl });
  } catch (error) {
    console.error("Błąd w /api/checkout:", error);
    if (
      error instanceof Error &&
      (error.message.includes("Niewystarczający stan") ||
        error.message.includes("Nie można znaleźć") ||
        error.message.includes("NIP") ||
        error.message.includes("Nazwa firmy"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Wystąpił nieoczekiwany błąd" },
      { status: 500 }
    );
  }
}
