"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/cartContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { cartItems, fetchCart, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: session?.user.email || "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  useEffect(() => {
    fetchCart(); // Pobierz koszyk przy montowaniu
  }, [fetchCart]);

  const calculateTotal = () => {
    return cartItems
      .reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
      .toFixed(2);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Krok 1: Utwórz zamówienie w bazie
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session ? session.user.id : null, // Brak userId dla gościa
          totalAmount: calculateTotal(),
          items: cartItems.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
          shippingDetails: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            street: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
            phone: formData.phone,
          },
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok)
        throw new Error(orderData.error || "Błąd podczas tworzenia zamówienia");

      // Krok 2: Utwórz transakcję P24
      const p24Response = await fetch("/api/p24/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.id,
          amount: parseFloat(calculateTotal()) * 100, // W groszach
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          address: `${formData.street}, ${formData.postalCode} ${formData.city}`,
          phone: formData.phone,
        }),
      });

      const p24Data = await p24Response.json();
      if (!p24Response.ok)
        throw new Error(
          p24Data.error || "Błąd podczas tworzenia transakcji P24"
        );

      // Przekieruj do P24 z tokenem
      const p24Url = p24Data.redirectUrl;
      window.location.href = p24Url; // Pełne przekierowanie

      // Wyczyść koszyk po sukcesie
      clearCart();
    } catch (error) {
      console.error("Błąd płatności:", error);
      toast.error("Błąd podczas przetwarzania zamówienia: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-24 px-4">
      <h1 className="text-3xl font-bold mb-6">Finalizacja zamówienia</h1>

      {/* Podsumowanie koszyka */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Podsumowanie koszyka</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-600">Twój koszyk jest pusty.</p>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between mb-2">
                <span>
                  {item.product.name} (Rozm. {item.size}, Ilość: {item.quantity}
                  )
                </span>
                <span>
                  {((item.product.price || 0) * item.quantity).toFixed(2)} PLN
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-4 font-bold text-right">
              Razem: {calculateTotal()} PLN
            </div>
          </>
        )}
      </div>

      {/* Formularz dostawy */}
      {cartItems.length > 0 && (
        <form
          onSubmit={handlePayment}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Dane dostawy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="Imię"
              value={formData.firstName}
              onChange={handleInputChange}
              className="border p-2 rounded-md"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Nazwisko"
              value={formData.lastName}
              onChange={handleInputChange}
              className="border p-2 rounded-md"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="border p-2 rounded-md"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Telefon"
              value={formData.phone}
              onChange={handleInputChange}
              className="border p-2 rounded-md"
              required
            />
            <input
              type="text"
              name="street"
              placeholder="Ulica i numer"
              value={formData.street}
              onChange={handleInputChange}
              className="border p-2 rounded-md md:col-span-2"
              required
            />
            <input
              type="text"
              name="postalCode"
              placeholder="Kod pocztowy"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="border p-2 rounded-md"
              required
            />
            <input
              type="text"
              name="city"
              placeholder="Miasto"
              value={formData.city}
              onChange={handleInputChange}
              className="border p-2 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || cartItems.length === 0}
            className="mt-6 w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading
              ? "Przetwarzanie..."
              : `Zapłać ${calculateTotal()} PLN przez Przelewy24`}
          </button>
        </form>
      )}

      <Link href="/koszyk" className="text-blue-500 hover:underline">
        ← Wróć do koszyka
      </Link>
    </div>
  );
}
