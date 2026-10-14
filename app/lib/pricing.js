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

// Zwraca { discount } albo { error } — wspólne dla /api/discounts/validate i checkoutu
export function validateDiscount(discount, subtotal) {
  if (!discount || !discount.isActive) return { error: "Nieprawidłowy kod" };

  const now = new Date();
  if (discount.validFrom && now < discount.validFrom) {
    return { error: "Kod jeszcze nieaktywny" };
  }
  if (discount.validTo && now > discount.validTo) {
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

export function getDiscountAmount(discount, subtotal) {
  if (!discount) return 0;
  const amount =
    discount.type === "percentage"
      ? (subtotal * discount.value) / 100
      : Math.min(discount.value, subtotal);
  return round2(Math.max(0, Math.min(amount, subtotal)));
}

export { round2 };
