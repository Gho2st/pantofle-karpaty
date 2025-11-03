"use client";
import { useState, useEffect } from "react";

export default function Form() {
  const [formData, setFormData] = useState({
    name: "",
    text: "",
    email: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    text: false,
  });

  const [isSending, setIsSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);

  // Walidacja pojedynczego pola
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim().length > 0;
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      case "text":
        return value.trim().length > 0;
      default:
        return true;
    }
  };

  // Sprawdzenie, czy pole ma błąd (i czy było dotknięte)
  const hasError = (field) => {
    return touched[field] && !validateField(field, formData[field]);
  };

  // Walidacja całego formularza
  const validateForm = () => {
    return (
      validateField("name", formData.name) &&
      validateField("email", formData.email) &&
      validateField("text", formData.text)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const sendMail = async (e) => {
    e.preventDefault();
    if (isSending) return;

    // Oznacz wszystkie pola jako dotknięte przy submit
    setTouched({ name: true, email: true, text: true });

    if (!validateForm()) {
      setFormError("Proszę uzupełnij poprawnie wszystkie wymagane pola.");
      return;
    }

    setFormError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormSubmitted(true);
        setFormData({ name: "", email: "", text: "" });
        setTouched({ name: false, email: false, text: false });
      } else {
        const errorData = await response.json();
        setFormError(`Błąd: ${errorData.message}`);
      }
    } catch (error) {
      setFormError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {!formSubmitted ? (
        <div className="flex flex-col pt-4 max-w-7xl mx-auto mt-10 px-[6%] mb-10">
          <h2 className="text-2xl xl:text-3xl font-bold mb-2">
            Zostaw Wiadomość
          </h2>
          <p className="mb-4 text-xl">
            Wypełnij formularz poniżej, a my wrócimy do Ciebie z odpowiedzią jak
            najszybciej to możliwe!
          </p>
          {formError && <p className="text-red-600 mb-4">{formError}</p>}

          <form onSubmit={sendMail} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  label: "Imię i nazwisko",
                  type: "text",
                  name: "name",
                  placeholder: "Imię i nazwisko",
                },
                {
                  label: "Adres e-mail",
                  type: "email",
                  name: "email",
                  placeholder: "email@domena.pl",
                },
              ].map((field) => (
                <div key={field.name} className="relative">
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-4 text-base rounded-md shadow-sm transition-colors ${
                      hasError(field.name)
                        ? "border border-red-500 focus:border-red-500"
                        : "border border-gray-200 focus:border-gray-400"
                    } focus:outline-none`}
                  />
                  {hasError(field.name) && (
                    <p className="text-red-500 text-sm mt-1">
                      {field.name === "name" && "Podaj imię i nazwisko"}
                      {field.name === "email" && "Podaj poprawny adres e-mail"}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="relative">
              <label htmlFor="text" className="block text-black mb-1">
                Wiadomość:
              </label>
              <textarea
                id="text"
                name="text"
                placeholder="Napisz swoją wiadomość"
                value={formData.text}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full h-[125px] p-4 text-base rounded-md shadow-sm mt-2 resize-none transition-colors ${
                  hasError("text")
                    ? "border border-red-500 focus:border-red-500"
                    : "border border-gray-200 focus:border-gray-400"
                } focus:outline-none`}
              />
              {hasError("text") && (
                <p className="text-red-500 text-sm mt-1">
                  Wiadomość nie może być pusta
                </p>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-3 rounded-full bg-[#ff5353] text-white font-semibold text-xl shadow-md transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Wysyłanie..." : "Wyślij wiadomość!"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-2xl font-bold mt-6 text-black">
            Dziękuję za przesłanie formularza!
          </h3>
          <p className="text-black mt-4 max-w-xl mx-auto">
            Postaramy się odpowiedzieć tak szybko, jak to możliwe.
          </p>
        </div>
      )}
    </>
  );
}
