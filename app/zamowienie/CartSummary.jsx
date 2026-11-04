"use client";
import { useCart } from "@/app/context/cartContext";
import {
  CARD,
  ProductLine,
  SectionTitle,
  SummaryRow,
  formatPrice,
} from "@/app/components/checkout/CheckoutUI";

const DELIVERY_LABELS = { paczkomat: "Paczkomat InPost", kurier: "Kurier InPost" };

export default function CartSummary({
  cartItems,
  deliveryMethod,
  calculateSubtotal,
  calculateDeliveryCost,
  calculateTotal,
  discountCode,
  discountValue = 0,
}) {
  const { getCurrentPrice } = useCart();
  const deliveryCost = calculateDeliveryCost();

  return (
    <div className={CARD}>
      <SectionTitle>Twoje zamówienie</SectionTitle>

      {cartItems.length === 0 ? (
        <p className="text-sm text-gray-600">Twój koszyk jest pusty.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-100">
            {cartItems.map((item) => (
              <ProductLine
                key={`${item.product.id}-${item.size}`}
                image={item.product.images?.[0]}
                name={item.product.name}
                size={item.size}
                quantity={item.quantity}
                unitPrice={getCurrentPrice(item.product)}
                regularPrice={item.product.price}
              />
            ))}
          </ul>

          <div className="mt-5 pt-5 border-t border-gray-200 space-y-2.5">
            <SummaryRow
              label="Produkty"
              value={formatPrice(calculateSubtotal())}
            />
            {discountCode && (
              <SummaryRow
                label={`Rabat (${discountCode})`}
                value={`-${formatPrice(discountValue)}`}
                tone="discount"
              />
            )}
            <SummaryRow
              label={`Dostawa (${DELIVERY_LABELS[deliveryMethod] || deliveryMethod})`}
              value={deliveryCost === 0 ? "Gratis" : formatPrice(deliveryCost)}
            />
          </div>
          <SummaryRow
            label="Do zapłaty"
            value={formatPrice(calculateTotal())}
            tone="total"
          />
        </>
      )}
    </div>
  );
}
