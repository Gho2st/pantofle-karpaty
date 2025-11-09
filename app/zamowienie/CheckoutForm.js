"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useCart } from "@/app/context/cartContext";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import CartSummary from "./CartSummary";
import ShippingDetailsForm from "./ShippingDetailsForm";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { ToastContainer } from "react-toastify";

const PageLoader = ({ text }) => (
  <div className="container mx-auto py-20 flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="mt-4 text-lg text-gray-700">{text}</span>
  </div>
);

const splitName = (fullName = "") => {
  const parts = (fullName || "").trim().split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
};

export default function CheckoutForm({
  primaryAddress,
  userName,
  discountCode: initialDiscountCode,
  discountValue: initialDiscountValue,
}) {
  const INPOST_TOKEN = process.env.NEXT_PUBLIC_INPOST_TOKEN;

  const { data: session, status: sessionStatus } = useSession();
  const {
    cartItems,
    clearCart,
    loading: isCartLoading,
    getCurrentPrice,
  } = useCart();
  const searchParams = useSearchParams();

  const [isStripeProcessing, setIsStripeProcessing] = useState(false);
  const [isCompanyPurchase, setIsCompanyPurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const { firstName, lastName } = splitName(userName);

  const [formData, setFormData] = useState({
    email: session?.user?.email || "",
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

  const [deliveryMethod] = useState(
    searchParams.get("deliveryMethod") || "paczkomat"
  );

  // RABAT
  const [discountCode] = useState(initialDiscountCode || "");
  const [discountValue] = useState(initialDiscountValue || 0);

  const [touchedFields, setTouchedFields] = useState({});
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    if (session?.user?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: session.user.email }));
    }
  }, [session, formData.email]);

  // UŻYWAMY getCurrentPrice Z KONTEXTU
  const calculateSubtotal = useCallback(() => {
    return cartItems
      .reduce((sum, item) => {
        const currentPrice = getCurrentPrice(item.product);
        return sum + currentPrice * item.quantity;
      }, 0)
      .toFixed(2);
  }, [cartItems, getCurrentPrice]);

  const calculateDeliveryCost = useCallback(() => {
    const subtotal = parseFloat(calculateSubtotal());
    if (subtotal >= 200) return 0;
    return deliveryMethod === "paczkomat" ? 13.99 : 15.99;
  }, [calculateSubtotal, deliveryMethod]);

  const calculateTotal = useCallback(() => {
    const subtotal = parseFloat(calculateSubtotal());
    const deliveryCost = calculateDeliveryCost();
    const discount = discountValue || 0;
    return (subtotal + deliveryCost - discount).toFixed(2);
  }, [calculateSubtotal, calculateDeliveryCost, discountValue]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

  const validateField = (name, value) => {
    const labels = {
      firstName: "Imię",
      lastName: "Nazwisko",
      email: "E-mail",
      phone: "Telefon",
      street: "Ulica i numer",
      postalCode: "Kod pocztowy",
      city: "Miasto",
      companyName: "Nazwa firmy",
      nip: "NIP",
    };

    const required = [
      "email",
      "phone",
      "street",
      "postalCode",
      "city",
      ...(isCompanyPurchase ? ["companyName", "nip"] : []),
      ...(!isCompanyPurchase ? ["firstName", "lastName"] : []),
    ];

    if (!value && required.includes(name)) {
      return `${labels[name]} wymagane`;
    }

    switch (name) {
      case "companyName":
        if (value.length < 2)
          return "Nazwa firmy musi mieć co najmniej 2 znaki";
        if (!/^[a-zA-ZąĄćĆęĘłŁńŃóÓśŚźŹżŻ0-9\s.,&-]+$/.test(value))
          return "Nazwa firmy może zawierać litery (w tym polskie znaki), cyfry, spacje, kropki, przecinki, & lub -";
        break;

      case "nip":
        const nip = value.replace(/[\s-]/g, "");
        if (nip.length !== 10) return "NIP musi mieć dokładnie 10 cyfr";
        if (!/^\d{10}$/.test(nip)) return "NIP może zawierać tylko cyfry";
        const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(nip[i]) * weights[i];
        const checksum = sum % 11;
        if (checksum !== parseInt(nip[9])) return "Nieprawidłowy numer NIP";
        break;

      case "firstName":
      case "lastName":
        if (value.length < 2)
          return `${labels[name]} musi mieć co najmniej 2 znaki`;
        if (!/^[a-zA-ZąĄćĆęĘłŁńŃóÓśŚźŹżŻ\s-]+$/.test(value))
          return `${labels[name]} może zawierać tylko litery (w tym polskie znaki), spacje lub myślniki`;
        break;

      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Podaj prawidłowy adres e-mail, np. jan.kowalski@example.com";
        break;

      case "phone":
        const cleaned = value.replace(/[\s-]/g, "");
        if (!/^\+?[0-9]{9,12}$/.test(cleaned))
          return "Numer telefonu musi mieć 9-12 cyfr, np. +48123456789 lub 123456789";
        if (cleaned.startsWith("+") && cleaned.length < 10)
          return "Numer z kodem kraju musi mieć co najmniej 10 cyfr";
        break;

      case "street":
        if (value.length < 3)
          return "Ulica i numer muszą mieć co najmniej 3 znaki";
        break;

      case "postalCode":
        if (!/^[0-9-]{2,10}$/.test(value))
          return "Podaj prawidłowy kod pocztowy, np. 12-345 lub 12345";
        break;

      case "city":
        if (value.length < 2) return "Miasto musi mieć co najmniej 2 znaki";
        if (!/^[a-zA-ZąĄćĆęĘłŁńŃóÓśŚźŹżŻ\s-]+$/.test(value))
          return "Miasto może zawierać tylko litery (w tym polskie znaki), spacje lub myślniki";
        break;

      default:
        break;
    }
    return "";
  };

  const validateAll = () => {
    const fieldsToValidate = [
      "email",
      "phone",
      "street",
      "postalCode",
      "city",
      ...(isCompanyPurchase ? ["companyName", "nip"] : []),
      ...(!isCompanyPurchase ? ["firstName", "lastName"] : []),
    ];

    const newErrors = {};
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (deliveryMethod === "paczkomat" && !formData.parcelLocker) {
      newErrors.parcelLocker = "Wybierz paczkomat";
    }

    setErrors(newErrors);
    setTouchedFields(
      Object.fromEntries(fieldsToValidate.map((f) => [f, true]))
    );

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error("Wypełnij poprawnie wszystkie wymagane pola.");
      setTimeout(() => {
        const firstError = document.querySelector(".text-red-600");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    setIsStripeProcessing(true);

    const total = calculateTotal();
    const deliveryCost = calculateDeliveryCost();

    // WYSYŁAMY RZECZYWISTE CENY (po promocji)
    const itemsWithCurrentPrice = cartItems.map((item) => ({
      ...item,
      currentPrice: getCurrentPrice(item.product),
    }));

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application-json" },
        body: JSON.stringify({
          cartItems: itemsWithCurrentPrice, // ← z ceną po promocji
          formData,
          total,
          deliveryCost,
          paymentMethod,
          deliveryMethod,
          discountCode,
          discountValue,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Błąd serwera");

      clearCart();
      window.location.href = data.redirectUrl;
    } catch (error) {
      toast.error(error.message || "Wystąpił błąd. Spróbuj ponownie.");
      setIsStripeProcessing(false);
    }
  };

  if (isCartLoading || sessionStatus === "loading") {
    return <PageLoader text="Ładowanie danych zamówienia..." />;
  }

  return (
    <div className="container mx-auto py-8">
      <CartSummary
        cartItems={cartItems}
        deliveryMethod={deliveryMethod}
        calculateSubtotal={calculateSubtotal}
        calculateDeliveryCost={calculateDeliveryCost}
        calculateTotal={calculateTotal}
        isProcessing={isStripeProcessing}
        discountCode={discountCode}
        discountValue={discountValue}
      />
      {cartItems.length > 0 && (
        <form
          ref={formRef}
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
            session={session}
            errors={errors}
            touchedFields={touchedFields}
            setTouchedFields={setTouchedFields}
            validateField={validateField}
            setErrors={setErrors}
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
              isStripeProcessing ||
              cartItems.length === 0 ||
              (deliveryMethod === "paczkomat" && !formData.parcelLocker)
            }
            className="mt-6 w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 disabled:opacity-50 transition"
          >
            {isStripeProcessing
              ? "Przetwarzanie..."
              : `Złóż zamówienie i zapłać (${calculateTotal()} PLN)`}
          </button>
        </form>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
