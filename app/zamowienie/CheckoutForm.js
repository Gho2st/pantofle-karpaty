"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/app/context/cartContext";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import CartSummary from "./CartSummary";
import ShippingDetailsForm from "./ShippingDetailsForm";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { ToastContainer } from "react-toastify";

// --- Komponenty ładowania ---
// Loader dla całej strony (ukrywa mignięcie pustego koszyka)
const PageLoader = ({ text }) => (
  <div className="container mx-auto py-20 flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="mt-4 text-lg text-gray-700">{text}</span>
  </div>
);
// ---

const splitName = (fullName = "") => {
  const parts = (fullName || "").split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
};

export default function CheckoutForm({ primaryAddress, userName }) {
  const INPOST_TOKEN = process.env.NEXT_PUBLIC_INPOST_SANDBOX_TOKEN;

  // 1. Pobierz status sesji
  const { data: session, status: sessionStatus } = useSession();

  // 2. Zmień nazwę 'loading' z useCart na 'isCartLoading'
  const { cartItems, clearCart, loading: isCartLoading } = useCart();

  const searchParams = useSearchParams();

  // 3. Zmień nazwę 'loading' na 'isStripeProcessing'
  const [isStripeProcessing, setIsStripeProcessing] = useState(false);

  const [isCompanyPurchase, setIsCompanyPurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const { firstName, lastName } = splitName(userName);

  const [formData, setFormData] = useState({
    email: session?.user.email || "",
    firstName: firstName || "",
    lastName: lastName || "",
    street: primaryAddress?.street || "",
    city: primaryAddress?.city || "",
    postalCode: primaryAddress?.postalCode || "",
    phone: primaryAddress?.phone || "",
    companyName: "",
    nip: "",
    parcelLocker: primaryAddress?.paczkomat || "",
    parcelLockerDetails: null,
    courierInstructions: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState(
    searchParams.get("deliveryMethod") || "paczkomat"
  );

  // Aktualizuj email w formData, gdy sesja się załaduje
  useEffect(() => {
    if (session?.user?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: session.user.email }));
    }
  }, [session, formData.email]);

  const calculateSubtotal = useCallback(() => {
    return cartItems
      .reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
      .toFixed(2);
  }, [cartItems]);

  const calculateDeliveryCost = useCallback(() => {
    const subtotal = parseFloat(calculateSubtotal());
    if (subtotal >= 200) return 0;
    return deliveryMethod === "paczkomat" ? 13.99 : 15.99;
  }, [cartItems, deliveryMethod, calculateSubtotal]);

  const calculateTotal = useCallback(() => {
    const subtotal = parseFloat(calculateSubtotal());
    const deliveryCost = calculateDeliveryCost();
    return (subtotal + deliveryCost).toFixed(2);
  }, [calculateSubtotal, calculateDeliveryCost]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyPurchaseToggle = () => {
    setIsCompanyPurchase((prev) => !prev);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePointSelection = useCallback((point) => {
    if (point && point.name) {
      setFormData((prev) => ({
        ...prev,
        parcelLocker: point.name,
        parcelLockerDetails: point.fullData,
      }));
      toast.success(`Wybrano paczkomat: ${point.name}`);
    } else {
      setFormData((prev) => ({
        ...prev,
        parcelLocker: "",
        parcelLockerDetails: null,
      }));
      toast.warn("Nie wybrano paczkomatu.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 4. Użyj 'isStripeProcessing'
    setIsStripeProcessing(true);

    const total = calculateTotal();
    const deliveryCost = calculateDeliveryCost();

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          formData,
          total,
          deliveryCost,
          paymentMethod,
          deliveryMethod,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Błąd serwera");

      clearCart();

      if (paymentMethod === "stripe" && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      toast.error(error.message || "Wystąpił błąd. Spróbuj ponownie.");
      // 5. Użyj 'isStripeProcessing'
      setIsStripeProcessing(false);
    }
  };

  // 6. GŁÓWNA BLOKADA RENDEROWANIA
  // Czekaj, aż załaduje się koszyk ORAZ sesja użytkownika
  if (isCartLoading || sessionStatus === "loading") {
    return <PageLoader text="Ładowanie danych zamówienia..." />;
  }

  // Renderuj stronę dopiero, gdy dane są gotowe
  return (
    <div className="container mx-auto py-8">
      <CartSummary
        cartItems={cartItems}
        deliveryMethod={deliveryMethod}
        calculateSubtotal={calculateSubtotal}
        calculateDeliveryCost={calculateDeliveryCost}
        calculateTotal={calculateTotal}
        // 7. Przekaż stan przetwarzania Stripe do CartSummary
        isProcessing={isStripeProcessing}
      />
      {cartItems.length > 0 && (
        <form
          className="bg-white rounded-lg shadow-md p-6 mb-6"
          onSubmit={handleSubmit}
        >
          <ShippingDetailsForm
            formData={formData}
            handleInputChange={handleInputChange}
            isCompanyPurchase={isCompanyPurchase}
            handleCompanyPurchaseToggle={handleCompanyPurchaseToggle}
            deliveryMethod={deliveryMethod}
            INPOST_TOKEN={INPOST_TOKEN}
            handlePointSelection={handlePointSelection}
            parcelLockerDetails={formData.parcelLockerDetails}
            session={session}
          />
          <div className="mt-6">
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              handlePaymentMethodChange={handlePaymentMethodChange}
            />
          </div>
          <button
            type="submit"
            disabled={
              // 8. Użyj 'isStripeProcessing'
              isStripeProcessing ||
              cartItems.length === 0 ||
              (deliveryMethod === "paczkomat" && !formData.parcelLocker)
            }
            className="mt-6 w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isStripeProcessing // 9. Użyj 'isStripeProcessing'
              ? "Przetwarzanie..."
              : `Złóż zamówienie i zapłać (${calculateTotal()} PLN)`}
          </button>
        </form>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
