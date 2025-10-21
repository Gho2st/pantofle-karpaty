"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/cartContext";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import InpostMap from "../components/InpostGeowidget";
import InPostGeowidget from "../components/InpostGeowidget";

export default function CheckoutForm() {
  const { data: session } = useSession();
  const { cartItems, fetchCart, clearCart } = useCart();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isCompanyPurchase, setIsCompanyPurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("p24");
  const [orderId, setOrderId] = useState(null);
  const [formData, setFormData] = useState({
    email: session?.user.email || "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    postalCode: "",
    phone: "",
    companyName: "",
    nip: "",
    parcelLocker: "",
    courierInstructions: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState(
    searchParams.get("deliveryMethod") || "paczkomat"
  );

  useEffect(() => {
    fetchCart(); // Pobierz koszyk przy montowaniu
  }, [fetchCart]);

  useEffect(() => {
    // Aktualizuj email, jeśli session się zmieni
    if (session?.user.email) {
      setFormData((prev) => ({ ...prev, email: session.user.email }));
    }
  }, [session]);

  const calculateSubtotal = () => {
    return cartItems
      .reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
      .toFixed(2);
  };

  const calculateDeliveryCost = () => {
    const subtotal = parseFloat(calculateSubtotal());
    if (subtotal >= 200) return 0; // Darmowa dostawa powyżej 200 PLN
    return deliveryMethod === "paczkomat" ? 13.99 : 15.99;
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const deliveryCost = calculateDeliveryCost();
    return (subtotal + deliveryCost).toFixed(2);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompanyPurchaseToggle = () => {
    setIsCompanyPurchase(!isCompanyPurchase);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session ? session.user.id : null,
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
            ...(isCompanyPurchase && {
              companyName: formData.companyName,
              nip: formData.nip,
            }),
            ...(deliveryMethod === "paczkomat" && {
              parcelLocker: formData.parcelLocker,
            }),
            ...(deliveryMethod === "kurier" && {
              courierInstructions: formData.courierInstructions,
            }),
          },
          paymentMethod,
          deliveryMethod,
          deliveryCost: calculateDeliveryCost(),
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok)
        throw new Error(orderData.error || "Błąd podczas tworzenia zamówienia");

      setOrderId(orderData.id);

      if (paymentMethod === "p24") {
        const p24Response = await fetch("/api/p24/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.id,
            amount: parseFloat(calculateTotal()) * 100,
            email: formData.email,
            name: isCompanyPurchase
              ? formData.companyName
              : `${formData.firstName} ${formData.lastName}`,
            address: `${formData.street}, ${formData.postalCode} ${formData.city}`,
            phone: formData.phone,
            ...(isCompanyPurchase && { nip: formData.nip }),
          }),
        });

        const p24Data = await p24Response.json();
        if (!p24Response.ok)
          throw new Error(
            p24Data.error || "Błąd podczas tworzenia transakcji P24"
          );

        const p24Url = p24Data.redirectUrl;
        window.location.href = p24Url;
      } else {
        toast.success(
          "Zamówienie zostało złożone! Sprawdź poniższe instrukcje przelewu."
        );
      }

      clearCart();
    } catch (error) {
      console.error("Błąd płatności:", error);
      toast.error("Błąd podczas przetwarzania zamówienia: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePointSelection = (point) => {
    console.log("Wybrano punkt:", point);
    alert(`Wybrano Paczkomat: ${point.name} (${point.location_description})`);
    // Tutaj możesz zapisać wybrany punkt w stanie React lub Redux
  };

  return (
    <>
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
            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between">
                <span>Suma produktów:</span>
                <span>{calculateSubtotal()} PLN</span>
              </div>
              <div className="flex justify-between">
                <span>Koszt dostawy ({deliveryMethod}):</span>
                <span>{calculateDeliveryCost().toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Razem:</span>
                <span>{calculateTotal()} PLN</span>
              </div>
            </div>
          </>
        )}
      </div>

      {cartItems.length > 0 && (
        <form
          onSubmit={handlePayment}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Dane dostawy</h2>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isCompanyPurchase}
                onChange={handleCompanyPurchaseToggle}
                className="mr-2"
              />
              Zakup na firmę (faktura VAT)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isCompanyPurchase && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa firmy *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md w-full"
                    required={isCompanyPurchase}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIP *
                  </label>
                  <input
                    type="text"
                    name="nip"
                    value={formData.nip}
                    onChange={handleInputChange}
                    className="border p-2 rounded-md w-full"
                    required={isCompanyPurchase}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imię{!isCompanyPurchase && " *"}
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="border p-2 rounded-md w-full"
                required={!isCompanyPurchase}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwisko{!isCompanyPurchase && " *"}
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="border p-2 rounded-md w-full"
                required={!isCompanyPurchase}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="border p-2 rounded-md w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="border p-2 rounded-md w-full"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ulica i numer *
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="border p-2 rounded-md w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kod pocztowy *
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="border p-2 rounded-md w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miasto *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="border p-2 rounded-md w-full"
                required
              />
            </div>
            {deliveryMethod === "paczkomat" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wybierz Paczkomat *
                </label>
                <InPostGeowidget
                  token={process.env.NEXT_PUBLIC_INPOST_SANDBOX_TOKEN} // Zmień na swój token
                  language="pl"
                  config="parcelCollect"
                  onPointSelect={handlePointSelection}
                />
              </div>
            )}
            {deliveryMethod === "kurier" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dodatkowe informacje dla kuriera
                </label>
                <textarea
                  name="courierInstructions"
                  value={formData.courierInstructions}
                  onChange={handleInputChange}
                  className="border p-2 rounded-md w-full"
                  rows="3"
                />
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Metoda płatności</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="p24"
                  checked={paymentMethod === "p24"}
                  onChange={handlePaymentMethodChange}
                  className="mr-2"
                />
                Przelewy24
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="traditional"
                  checked={paymentMethod === "traditional"}
                  onChange={handlePaymentMethodChange}
                  className="mr-2"
                />
                Przelew tradycyjny
              </label>
            </div>
          </div>

          {paymentMethod === "traditional" && orderId && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold mb-2">
                Instrukcje przelewu tradycyjnego
              </h3>
              <p>
                Proszę dokonać przelewu na poniższe dane w ciągu 7 dni
                roboczych:
              </p>
              <ul className="list-disc ml-5 mt-2">
                <li>
                  <strong>Nazwa odbiorcy:</strong> Twoja Firma Sp. z o.o.
                </li>
                <li>
                  <strong>Numer konta:</strong> PL12 3456 7890 1234 5678 9012
                  3456
                </li>
                <li>
                  <strong>Kwota:</strong> {calculateTotal()} PLN
                </li>
                <li>
                  <strong>Tytuł przelewu:</strong> Zamówienie #{orderId}
                </li>
              </ul>
              <p className="mt-2">
                Po zaksięgowaniu płatności Twoje zamówienie zostanie
                zrealizowane. Faktura VAT (jeśli wybrano) zostanie przesłana na
                podany adres email.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              cartItems.length === 0 ||
              (deliveryMethod === "paczkomat" && !formData.parcelLocker)
            }
            className="mt-6 w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading
              ? "Przetwarzanie..."
              : paymentMethod === "p24"
              ? `Zapłać ${calculateTotal()} PLN przez Przelewy24`
              : `Złóż zamówienie (${calculateTotal()} PLN)`}
          </button>
        </form>
      )}
    </>
  );
}
