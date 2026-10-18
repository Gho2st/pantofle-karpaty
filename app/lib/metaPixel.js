// app/lib/metaPixel.js
// Zdarzenia Meta Pixel. Pixel ładuje się dopiero po zgodzie na cookies
// (CookieConsent). Zdarzenia wysłane wcześniej czekają w kolejce i są
// wysyłane po załadowaniu — bez zgody nigdy nie wychodzą.

const MAX_QUEUE = 50;

export function trackPixel(event, params = {}, eventId) {
  if (typeof window === "undefined") return;
  const args = ["track", event, params, ...(eventId ? [{ eventID: eventId }] : [])];

  if (window.fbq) {
    window.fbq(...args);
  } else {
    window.__pixelQueue = window.__pixelQueue || [];
    if (window.__pixelQueue.length < MAX_QUEUE) window.__pixelQueue.push(args);
  }
}

// Wywoływane przez CookieConsent zaraz po inicjalizacji Pixela
export function flushPixelQueue() {
  const queue = window.__pixelQueue || [];
  window.__pixelQueue = [];
  for (const args of queue) window.fbq(...args);
}

// Wspólny format danych produktów dla Meta (content_ids = ID produktu w sklepie)
export function pixelContents(items) {
  return {
    content_ids: items.map((i) => String(i.id)),
    contents: items.map((i) => ({
      id: String(i.id),
      quantity: i.quantity,
      item_price: i.price,
    })),
    content_type: "product",
    currency: "PLN",
  };
}
