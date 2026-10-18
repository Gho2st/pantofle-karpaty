"use client";
import { useEffect } from "react";
import { trackPixel, pixelContents } from "@/app/lib/metaPixel";

// Meta Pixel: zakup. Raz na zamówienie — localStorage chroni przed ponownym
// wysłaniem przy odświeżeniu, a eventID pozwoli Meta odduplikować zdarzenie
// z przyszłym Conversions API (serwerowym).
export default function PurchaseTracker({ orderId, value, items }) {
  useEffect(() => {
    const key = `pixel_purchase_${orderId}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // brak localStorage (tryb prywatny) — eventID i tak zapobiega dublom w Meta
    }

    trackPixel(
      "Purchase",
      {
        ...pixelContents(items),
        num_items: items.reduce((sum, i) => sum + i.quantity, 0),
        value,
      },
      `order-${orderId}`
    );
  }, [orderId, value, items]);

  return null;
}
