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
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && "*"}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="border p-2 rounded-md w-full"
      required={required}
      {...rest}
    />
  </div>
);

export default function ShippingDetailsForm({
  formData,
  handleInputChange,
  isCompanyPurchase,
  handleCompanyPurchaseToggle,
  deliveryMethod,
  parcelLockerDetails,
  INPOST_TOKEN,
  handlePointSelection,
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
            {/* 3. Przekaż 'value' i 'onChange' do każdego InputField */}
            <InputField
              label="Nazwa firmy"
              name="companyName"
              required={true}
              value={formData.companyName}
              onChange={handleInputChange}
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
        <InputField
          label="Email"
          name="email"
          type="email"
          required={true}
          value={formData.email}
          onChange={handleInputChange}
        />
        <InputField
          label="Telefon"
          name="phone"
          type="tel"
          required={true}
          value={formData.phone}
          onChange={handleInputChange}
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
            {/* Przekazanie handlePointSelection do widgetu InPost */}
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
    </>
  );
}
