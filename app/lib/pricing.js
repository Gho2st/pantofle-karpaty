// app/lib/pricing.js
// Logika cen liczona po stronie serwera — musi zgadzać się z koszykiem
// (app/context/cartContext.js, app/koszyk/CartContent.js).

export const FREE_DELIVERY_THRESHOLD = 200;
export const DELIVERY_COSTS = { paczkomat: 13.99, kurier: 15.99 };

const round2 = (n) => Math.round(n * 100) / 100;

export function getCurrentPrice(product) {
  if (!product) return 0;
  if (!product.promoEndDate || !product.promoPrice) return product.price;

  const promoEnd = new Date(product.promoEndDate);
  if (isNaN(promoEnd.getTime())) return product.price;

  const isPromoActive =
    product.promoPrice < product.price && promoEnd >= new Date();
  return isPromoActive ? product.promoPrice : product.price;
}

export function getDeliveryCost(deliveryMethod, subtotal) {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return DELIVERY_COSTS[deliveryMethod];
}

// Data jako "RRRR-MM-DD" — do porównywania samych dni kalendarzowych
function polishDate(date, timeZone = "Europe/Warsaw") {
  return new Date(date).toLocaleDateString("sv-SE", { timeZone });
}

// Zwraca { discount } albo { error } — wspólne dla /api/discounts/validate i checkoutu
export function validateDiscount(discount, subtotal) {
  if (!discount || !discount.isActive) return { error: "Nieprawidłowy kod" };

  // Daty "od"/"do" to pełne dni w czasie polskim, włącznie z ostatnim dniem.
  // (W bazie są zapisane jako północ UTC — porównanie z godziną ucinało cały ostatni dzień.)
  const today = polishDate(new Date());
  if (discount.validFrom && today < polishDate(discount.validFrom, "UTC")) {
    return { error: "Kod jeszcze nieaktywny" };
  }
  if (discount.validTo && today > polishDate(discount.validTo, "UTC")) {
    return { error: "Kod wygasł" };
  }
  if (discount.minOrderValue && subtotal < discount.minOrderValue) {
    return { error: `Minimalna kwota: ${discount.minOrderValue} PLN` };
  }
  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return { error: "Kod wyczerpany" };
  }
  return { discount };
}

export function getDiscountAmount(discount, subtotal, deliveryCost = 0) {
  if (!discount) return 0;
  // Darmowa dostawa: rabat równy kosztowi dostawy (0, gdy dostawa i tak darmowa)
  if (discount.type === "free_delivery") return round2(deliveryCost);
  const amount =
    discount.type === "percentage"
      ? (subtotal * discount.value) / 100
      : Math.min(discount.value, subtotal);
  return round2(Math.max(0, Math.min(amount, subtotal)));
}

export { round2 };
