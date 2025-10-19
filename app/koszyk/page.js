"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/app/context/cartContext";
import { ToastContainer } from "react-toastify";

export default function Checkout() {
  const { data: session } = useSession();
  const { cartItems, loading, fetchCart, updateQuantity, removeFromCart } =
    useCart();

  useEffect(() => {
    fetchCart(); // Pobierz koszyk (z bazy lub localStorage)
  }, [fetchCart]);

  // Oblicz sumę koszyka
  const calculateTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-24 px-4">
        <h1 className="text-3xl font-bold mb-6">Koszyk</h1>
        <p className="text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-24 px-4">
      <h1 className="text-3xl font-bold mb-6">Koszyk</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Twój koszyk jest pusty.</p>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-6 p-4 bg-white rounded-lg shadow-md"
            >
              <div className="w-24 h-24">
                <Image
                  src={item.product.images?.[0] || "/placeholder.png"}
                  width={96}
                  height={96}
                  alt={item.product.name}
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.product.name}</h2>
                <p className="text-gray-600">Rozmiar: {item.size}</p>
                <p className="text-gray-600">
                  Cena: {item.product.price.toFixed(2)} PLN
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-gray-600">Ilość:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="border border-gray-300 rounded-md p-1 w-16"
                  />
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-lg font-medium">
                  {(item.product.price * item.quantity).toFixed(2)} PLN
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="mt-2 text-red-500 hover:text-red-700"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <div className="p-4 bg-gray-100 rounded-md">
              <p className="text-xl font-bold">Suma: {calculateTotal()} PLN</p>
              <Link
                href="/zamowienie"
                className="mt-4 block bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 text-center"
              >
                Przejdź do finalizacji zamówienia
              </Link>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
