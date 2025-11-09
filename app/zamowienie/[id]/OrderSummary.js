// app/potwierdzenie/[id]/OrderSummary.jsx
"use client";

export default function OrderSummary({ order }) {
  // Funkcja: cena po promocji
  const getPrice = (item) => {
    if (item.promoPrice && item.promoEndDate) {
      const now = new Date();
      const end = new Date(item.promoEndDate);
      if (end >= now) {
        return item.promoPrice;
      }
    }
    return item.price;
  };

  // Suma produktów
  const subtotal = order.items.reduce((sum, item) => {
    return sum + getPrice(item) * item.quantity;
  }, 0);

  const total = subtotal + order.deliveryCost - (order.discountAmount || 0);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-800">
        Podsumowanie zamówienia
      </h2>

      <div className="space-y-4">
        {order.items.map((item) => {
          const cena = getPrice(item);
          const czyPromocja = cena < item.price;

          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b last:border-b-0"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">
                  Rozmiar: <strong>{item.size}</strong> | Ilość:{" "}
                  <strong>{item.quantity}</strong>
                  {czyPromocja ? (
                    <>
                      {" "}
                      x{" "}
                      <span className="text-red-600 font-medium">
                        {cena.toFixed(2)} PLN
                      </span>{" "}
                      <span className="text-xs text-gray-500 line-through">
                        ({item.price.toFixed(2)} PLN)
                      </span>
                    </>
                  ) : (
                    <> x {item.price.toFixed(2)} PLN</>
                  )}
                </p>
              </div>
              <p className="font-semibold text-gray-800 mt-2 sm:mt-0">
                {(cena * item.quantity).toFixed(2)} PLN
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 mt-6 space-y-2">
        {order.discountCode && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Rabat ({order.discountCode}):</span>
            <span>-{(order.discountAmount || 0).toFixed(2)} PLN</span>
          </div>
        )}

        <div className="flex justify-between text-gray-700">
          <span>Dostawa ({order.deliveryMethod})</span>
          <span>{(order.deliveryCost || 0).toFixed(2)} PLN</span>
        </div>

        <div className="flex justify-between text-xl font-bold text-gray-900">
          <span>Łącznie:</span>
          <span>{total.toFixed(2)} PLN</span>
        </div>
      </div>
    </div>
  );
}
