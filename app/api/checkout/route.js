import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const validateNip = (nip) => {
  if (!nip) return false;
  const nipClean = nip.replace(/[-\s]/g, "");
  return /^\d{10}$/.test(nipClean);
};

async function handleStripePayment(order, formData, cartItems) {
  console.log("handleStripePayment - dane wejściowe:", {
    order,
    formData,
    cartItems,
  });

  // Validate environment variables
  console.log("Zmienne środowiskowe:", {
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  });
  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error(
      "Brak konfiguracji Stripe lub NEXT_PUBLIC_BASE_URL w zmiennych środowiskowych"
    );
  }

  // Validate cartItems
  if (!Array.isArray(cartItems)) {
    console.error("cartItems nie jest tablicą:", cartItems);
    throw new Error("Pozycje koszyka muszą być tablicą");
  }

  if (cartItems.length === 0) {
    throw new Error("Koszyk jest pusty");
  }

  // Validate item structure
  for (const item of cartItems) {
    console.log("Walidacja item:", item);
    if (
      !item.productId ||
      !item.product ||
      !item.product.name ||
      !item.product.price ||
      !item.quantity ||
      !item.size
    ) {
      throw new Error(
        `Nieprawidłowe dane pozycji koszyka dla produktu ID: ${item.productId}`
      );
    }
  }

  // Create Stripe Checkout session
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "blik", "p24"],
      mode: "payment",
      currency: "pln",
      customer_email: formData.email,
      metadata: {
        orderId: order.id.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie/${order.id}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie/${order.id}?status=error`,
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "pln",
          product_data: {
            name: item.product.name,
            description: `Rozmiar: ${item.size}`,
          },
          unit_amount: Math.round(item.product.price * 100), // Cena w groszach
        },
        quantity: item.quantity,
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(order.deliveryCost * 100),
              currency: "pln",
            },
            display_name:
              order.deliveryMethod === "paczkomat" ? "Paczkomat" : "Kurier",
          },
        },
      ],
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: session.id, status: "PENDING" },
    });

    return session.url;
  } catch (stripeError) {
    console.error("Błąd Stripe:", stripeError);
    throw new Error(`Błąd Stripe: ${stripeError.message}`);
  }
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

    console.log("Ciało żądania:", body);

    // Validate request body
    if (!Array.isArray(cartItems)) {
      console.error("Invalid cartItems received:", cartItems);
      return NextResponse.json(
        { error: "Pozycje koszyka muszą być tablicą" },
        { status: 400 }
      );
    }

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Koszyk jest pusty" }, { status: 400 });
    }

    // Validate required form fields
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.street ||
      !formData.city ||
      !formData.postalCode ||
      !formData.phone ||
      !deliveryMethod ||
      !paymentMethod ||
      !deliveryCost ||
      !total
    ) {
      return NextResponse.json(
        { error: "Brak wymaganych danych zamówienia" },
        { status: 400 }
      );
    }

    // Validate NIP if companyName or nip is provided
    if (formData.companyName || formData.nip) {
      if (!formData.companyName || !formData.nip) {
        return NextResponse.json(
          { error: "Nazwa firmy i NIP są wymagane dla zakupu na firmę" },
          { status: 400 }
        );
      }
      if (!validateNip(formData.nip)) {
        return NextResponse.json(
          { error: "NIP musi składać się z dokładnie 10 cyfr" },
          { status: 400 }
        );
      }
    }

    // Determine user ID and guest status
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

    // Create order in transaction
    const { createdOrder } = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          user: userId ? { connect: { id: userId } } : undefined,
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
          status: "PENDING",
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

      // Update product stock
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        console.log("Produkt z bazy:", product);

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

    // Handle payment method
    if (paymentMethod === "stripe") {
      const redirectUrl = await handleStripePayment(
        createdOrder,
        formData,
        cartItems
      );
      return NextResponse.json({ redirectUrl });
    } else {
      const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/zamowienie/${createdOrder.id}`;
      return NextResponse.json({ redirectUrl });
    }
  } catch (error) {
    console.error("Błąd w /api/checkout:", error);
    if (
      error instanceof Error &&
      (error.message.includes("Niewystarczający stan") ||
        error.message.includes("Nie można znaleźć") ||
        error.message.includes("NIP") ||
        error.message.includes("Nazwa firmy") ||
        error.message.includes("Brak konfiguracji Stripe") ||
        error.message.includes("Pozycje koszyka") ||
        error.message.includes("Koszyk jest pusty"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: `Wystąpił nieoczekiwany błąd: ${error.message}` }, // Dodano error.message dla lepszej diagnozy
      { status: 500 }
    );
  }
}
