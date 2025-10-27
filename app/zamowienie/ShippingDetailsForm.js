import React from "react";
import InPostGeowidget from "../components/InpostMap";

const InputField = ({
  label,
  name,
  type = "text",
  required,
  value,
  onChange,
  ...rest
}) => {
  const validateField = (name, value) => {
    if (!value && required) return `${label} wymagane`;

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
        for (let i = 0; i < 9; i++) {
          sum += parseInt(nip[i]) * weights[i];
        }
        const checksum = sum % 11;
        if (checksum !== parseInt(nip[9])) return "Nieprawidłowy numer NIP";
        break;

      case "firstName":
      case "lastName":
        if (value.length < 2) return `${label} musi mieć co najmniej 2 znaki`;
        if (!/^[a-zA-ZąĄćĆęĘłŁńŃóÓśŚźŹżŻ\s-]+$/.test(value))
          return `${label} może zawierać tylko litery (w tym polskie znaki), spacje lub myślniki`;
        break;

      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Podaj prawidłowy adres e-mail, np. jan.kowalski@example.com";
        break;

      case "phone":
        const cleanedPhone = value.replace(/[\s-]/g, "");
        if (!/^\+?[0-9]{9,12}$/.test(cleanedPhone))
          return "Numer telefonu musi mieć 9-12 cyfr, np. +48123456789 lub 123456789";
        if (cleanedPhone.startsWith("+") && cleanedPhone.length < 10)
          return "Numer z kodem kraju musi mieć co najmniej 10 cyfr, np. +48123456789";
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

  const error = validateField(name, value);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`border p-2 rounded-md w-full ${
          error ? "border-red-500" : ""
        }`}
        required={required}
        {...rest}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default function ShippingDetailsForm({
  formData,
  handleInputChange,
  isCompanyPurchase,
  handleCompanyPurchaseToggle,
  deliveryMethod,
  INPOST_TOKEN,
  handlePointSelection,
  session,
}) {
  return (
    <>
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
            <InputField
              label="Nazwa firmy"
              name="companyName"
              required={true}
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="np. Firma Łączność Sp. z o.o."
            />
            <InputField
              label="NIP"
              name="nip"
              required={true}
              value={formData.nip}
              onChange={handleInputChange}
            />
          </>
        )}
        <InputField
          label="Imię"
          name="firstName"
          required={!isCompanyPurchase}
          value={formData.firstName}
          onChange={handleInputChange}
        />
        <InputField
          label="Nazwisko"
          name="lastName"
          required={!isCompanyPurchase}
          value={formData.lastName}
          onChange={handleInputChange}
        />
        <div>
          <InputField
            label="E-mail"
            name="email"
            type="email"
            required={true}
            value={formData.email}
            onChange={handleInputChange}
          />
          {session?.user?.email && formData.email !== session.user.email && (
            <p className="text-sm text-gray-600 mt-1">
              Uwaga: Wprowadzony e-mail różni się od e-maila Twojego konta (
              {session.user.email}). Zamówienie zostanie zapisane z nowym
              e-mailem.
            </p>
          )}
        </div>
        <InputField
          label="Telefon"
          name="phone"
          type="tel"
          required={true}
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+48123456789 lub 123456789"
        />
        <div className="md:col-span-2">
          <InputField
            label="Ulica i numer"
            name="street"
            required={true}
            value={formData.street}
            onChange={handleInputChange}
          />
        </div>
        <InputField
          label="Kod pocztowy"
          name="postalCode"
          required={true}
          value={formData.postalCode}
          onChange={handleInputChange}
          placeholder="np. 12-345 lub 12345"
        />
        <InputField
          label="Miasto"
          name="city"
          required={true}
          value={formData.city}
          onChange={handleInputChange}
        />
        {deliveryMethod === "paczkomat" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wybierz Paczkomat *
            </label>
            <InPostGeowidget
              token={INPOST_TOKEN}
              language="pl"
              config="parcelCollectPayment"
              onPointSelect={handlePointSelection}
            />
          </div>
        )}
        {deliveryMethod === "kurier" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dodatkowe informacje dla kuriera (opcjonalne)
            </label>
            <textarea
              name="courierInstructions"
              value={formData.courierInstructions}
              onChange={handleInputChange}
              className="border p-2 rounded-md w-full"
              rows="3"
              placeholder="Np. zostaw paczkę u sąsiada pod numerem 5"
            />
          </div>
        )}
      </div>
    </>
  );
}
