// app/api/orders/[id]/stripe/route.js
// Stan płatności Stripe dla zamówienia — panel admina pokazuje go bez logowania do Stripe
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Kody odmowy z banku i błędy płatności → zrozumiały opis
const DECLINE_REASONS = {
  card_velocity_exceeded:
    "Przekroczony limit karty (dzienny limit transakcji lub brak środków)",
  insufficient_funds: "Brak środków na karcie",
  withdrawal_count_limit_exceeded: "Przekroczony limit transakcji na karcie",
  generic_decline: "Bank odrzucił płatność bez podania przyczyny",
  do_not_honor: "Bank odrzucił płatność bez podania przyczyny",
  expired_card: "Karta wygasła",
  incorrect_cvc: "Błędny kod CVC",
  incorrect_number: "Błędny numer karty",
  lost_card: "Karta zastrzeżona (zgubiona)",
  stolen_card: "Karta zastrzeżona (skradziona)",
  pickup_card: "Karta zablokowana przez bank",
  fraudulent: "Płatność zablokowana jako podejrzana",
  card_not_supported: "Karta nie obsługuje tego typu płatności",
  currency_not_supported: "Karta nie obsługuje płatności w PLN",
  processing_error:
    "Błąd przetwarzania po stronie banku — można spróbować ponownie",
  authentication_required:
    "Wymagana weryfikacja 3D Secure, której nie dokończono",
  payment_intent_authentication_failure:
    "Nieudana weryfikacja 3D Secure (np. nie potwierdzono w aplikacji banku)",
};

const METHOD_NAMES = { card: "karta", blik: "BLIK", link: "Link" };

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    select: { paymentMethod: true, paymentId: true },
  });
  if (!order?.paymentId || order.paymentMethod !== "stripe") {
    return NextResponse.json({ error: "Brak płatności Stripe" }, { status: 404 });
  }

  try {
    const checkout = await stripe.checkout.sessions.retrieve(order.paymentId, {
      expand: ["payment_intent"],
    });
    const intent = checkout.payment_intent;
    const lastError = intent?.last_payment_error;
    const reasonCode = lastError?.decline_code || lastError?.code;

    return NextResponse.json({
      sessionStatus: checkout.status, // open | complete | expired
      paid: checkout.payment_status === "paid",
      expiresAt: new Date(checkout.expires_at * 1000).toISOString(),
      // Brak PaymentIntent = klient nie zatwierdził jeszcze żadnej metody płatności
      attempted: !!intent,
      failure: lastError
        ? {
            reason:
              DECLINE_REASONS[reasonCode] ||
              lastError.message ||
              "Płatność nie powiodła się",
            code: reasonCode || null,
            method:
              METHOD_NAMES[lastError.payment_method?.type] ||
              lastError.payment_method?.type ||
              null,
          }
        : null,
    });
  } catch (error) {
    console.error(`Błąd pobierania sesji Stripe dla zamówienia #${id}:`, error);
    return NextResponse.json(
      { error: "Nie udało się pobrać danych ze Stripe" },
      { status: 502 }
    );
  }
}
