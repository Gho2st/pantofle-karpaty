// app/zamowienie/[id]/OrderSummary.js
import {
  CARD,
  ProductLine,
  SectionTitle,
  SummaryRow,
  formatPrice,
} from "@/app/components/checkout/CheckoutUI";

const DELIVERY_LABELS = { paczkomat: "Paczkomat InPost", kurier: "Kurier InPost" };

export default function OrderSummary({ order }) {
  // Cena zapłacona: promoPrice jest zapisywane tylko, gdy promocja obowiązywała przy zakupie
  const getPrice = (item) => item.promoPrice || item.price;
  const subtotal = order.items.reduce(
    (sum, item) => sum + getPrice(item) * item.quantity,
    0,
  );

  return (
    <div className={CARD}>
      <SectionTitle>Zamówienie #{order.id}</SectionTitle>
      <ul className="divide-y divide-gray-100">
        {order.items.map((item) => (
          <ProductLine
            key={item.id}
            image={item.product?.images?.[0]}
            name={item.name}
            size={item.size}
            quantity={item.quantity}
            unitPrice={getPrice(item)}
            regularPrice={item.price}
          />
        ))}
      </ul>

      <div className="mt-5 pt-5 border-t border-gray-200 space-y-2.5">
        <SummaryRow label="Produkty" value={formatPrice(subtotal)} />
        {order.discountAmount > 0 && (
          <SummaryRow
            label={`Rabat${order.discountCode ? ` (${order.discountCode})` : ""}`}
            value={`-${formatPrice(order.discountAmount)}`}
            tone="discount"
          />
        )}
        <SummaryRow
          label={`Dostawa (${DELIVERY_LABELS[order.deliveryMethod] || order.deliveryMethod})`}
          value={
            order.deliveryCost === 0 ? "Gratis" : formatPrice(order.deliveryCost)
          }
        />
      </div>
      {/* Kwota zawsze z zamówienia — to ją pobrał Stripe / podano w przelewie */}
      <SummaryRow
        label="Razem"
        value={formatPrice(order.totalAmount)}
        tone="total"
      />
    </div>
  );
}
