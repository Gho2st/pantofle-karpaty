"use client";
import React from "react";
import InPostGeowidget from "../components/InpostMap";

const InputField = ({
  label,
  name,
  type = "text",
  required,
  value = "",
  onChange,
  error,
  touched,
  setTouchedFields,
  validateField,
  setErrors,
  ...rest
}) => {
  const [internalTouched, setInternalTouched] = React.useState(false);
  const isTouched = touched || internalTouched;

  const handleBlur = () => {
    setInternalTouched(true);
    setTouchedFields?.((prev) => ({ ...prev, [name]: true }));

    if (validateField && setErrors) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        className={`w-full px-3 py-2 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          error && isTouched
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500"
        }`}
        {...rest}
      />
      {error && isTouched && (
        <p className="mt-1 text-sm text-red-600 animate-in fade-in duration-200">
          {error}
        </p>
      )}
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
  errors,
  touchedFields,
  setTouchedFields,
  validateField,
  setErrors,
}) {
  // <<< NAJWAŻNIEJSZE: stabilna funkcja przez useRef – nigdy się nie zmienia! >>>
  const onPointSelectRef = React.useRef();

  React.useEffect(() => {
    onPointSelectRef.current = (point) => {
      handlePointSelection(point);
      setTouchedFields((prev) => ({ ...prev, parcelLocker: true }));
      setErrors((prev) => ({
        ...prev,
        parcelLocker: point ? undefined : "Wybierz paczkomat",
      }));
    };
  }, [handlePointSelection, setTouchedFields, setErrors]);

  // Walidacja telefonu – dokładnie 9 cyfr
  const validatePhone = (value) => {
    const cleaned = value.replace(/[\s\-\+]/g, "");
    if (cleaned.length !== 9 || !/^\d+$/.test(cleaned)) {
      return "Podaj numer telefonu – dokładnie 9 cyfr (np. 666521401)";
    }
    return undefined;
  };

  const getFieldError = (name, value) => {
    if (name === "phone") return validatePhone(value);
    return validateField(name, value);
  };

  return (
    <>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in.fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>

      <h2 className="text-xl font-semibold mb-4">Dane dostawy</h2>

      <div className="mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isCompanyPurchase}
            onChange={handleCompanyPurchaseToggle}
            className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">
            Zakup na firmę (faktura VAT)
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isCompanyPurchase && (
          <>
            <InputField
              label="Nazwa firmy"
              name="companyName"
              required
              value={formData.companyName || ""}
              onChange={handleInputChange}
              error={errors.companyName}
              touched={touchedFields.companyName}
              setTouchedFields={setTouchedFields}
              validateField={getFieldError}
              setErrors={setErrors}
              placeholder="np. Firma Łączność Sp. z o.o."
            />
            <InputField
              label="NIP"
              name="nip"
              required
              value={formData.nip || ""}
              onChange={handleInputChange}
              error={errors.nip}
              touched={touchedFields.nip}
              setTouchedFields={setTouchedFields}
              validateField={getFieldError}
              setErrors={setErrors}
              placeholder="1234567890"
            />
          </>
        )}

        <InputField
          label="Imię"
          name="firstName"
          required={!isCompanyPurchase}
          value={formData.firstName || ""}
          onChange={handleInputChange}
          error={errors.firstName}
          touched={touchedFields.firstName}
          setTouchedFields={setTouchedFields}
          validateField={getFieldError}
          setErrors={setErrors}
        />

        <InputField
          label="Nazwisko"
          name="lastName"
          required={!isCompanyPurchase}
          value={formData.lastName || ""}
          onChange={handleInputChange}
          error={errors.lastName}
          touched={touchedFields.lastName}
          setTouchedFields={setTouchedFields}
          validateField={getFieldError}
          setErrors={setErrors}
        />

        <div>
          <InputField
            label="E-mail"
            name="email"
            type="email"
            required
            value={formData.email || ""}
            onChange={handleInputChange}
            error={errors.email}
            touched={touchedFields.email}
            setTouchedFields={setTouchedFields}
            validateField={getFieldError}
            setErrors={setErrors}
          />
          {session?.user?.email && formData.email !== session.user.email && (
            <p className="mt-1 text-sm text-amber-600">
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
          required
          value={formData.phone || ""}
          onChange={handleInputChange}
          error={errors.phone}
          touched={touchedFields.phone}
          setTouchedFields={setTouchedFields}
          validateField={getFieldError}
          setErrors={setErrors}
          placeholder="666521401"
        />

        <div className="md:col-span-2">
          <InputField
            label="Ulica i numer"
            name="street"
            required
            value={formData.street || ""}
            onChange={handleInputChange}
            error={errors.street}
            touched={touchedFields.street}
            setTouchedFields={setTouchedFields}
            validateField={getFieldError}
            setErrors={setErrors}
            placeholder="np. Marszałkowska 1/2"
          />
        </div>

        <InputField
          label="Kod pocztowy"
          name="postalCode"
          required
          value={formData.postalCode || ""}
          onChange={handleInputChange}
          error={errors.postalCode}
          touched={touchedFields.postalCode}
          setTouchedFields={setTouchedFields}
          validateField={getFieldError}
          setErrors={setErrors}
          placeholder="np. 12-345 lub 12345"
        />

        <InputField
          label="Miasto"
          name="city"
          required
          value={formData.city || ""}
          onChange={handleInputChange}
          error={errors.city}
          touched={touchedFields.city}
          setTouchedFields={setTouchedFields}
          validateField={getFieldError}
          setErrors={setErrors}
        />

        {/* PACZKOMAT – JUŻ NIGDY NIE MIGA! */}
        {deliveryMethod === "paczkomat" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wybierz Paczkomat <span className="text-red-500">*</span>
            </label>

            <InPostGeowidget
              key="inpost-permanent" // klucz stały
              token={INPOST_TOKEN}
              language="pl"
              config="parcelCollectPayment"
              onPointSelect={onPointSelectRef.current} // zawsze ta sama funkcja!
            />

            {errors.parcelLocker && touchedFields.parcelLocker && (
              <p className="mt-1 text-sm text-red-600 animate-in fade-in duration-200">
                {errors.parcelLocker}
              </p>
            )}
          </div>
        )}

        {/* KURIER */}
        {deliveryMethod === "kurier" && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dodatkowe informacje dla kuriera (opcjonalne)
            </label>
            <textarea
              name="courierInstructions"
              value={formData.courierInstructions || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              rows={3}
              placeholder="Np. zostaw paczkę u sąsiada pod numerem 5"
            />
          </div>
        )}
      </div>
    </>
  );
}
