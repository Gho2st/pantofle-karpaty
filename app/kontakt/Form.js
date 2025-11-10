"use client";
import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    text: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    text: false,
  });

  const [isSending, setIsSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Walidacja pola
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

  const hasError = (field) =>
    touched[field] && !validateField(field, formData[field]);

  const validateForm = () =>
    validateField("name", formData.name) &&
    validateField("email", formData.email) &&
    validateField("text", formData.text);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSending) return;

    setTouched({ name: true, email: true, text: true });

    if (!validateForm()) {
      setFormError("Proszę uzupełnić wszystkie pola poprawnie.");
      return;
    }

    setFormError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormSubmitted(true);
        setFormData({ name: "", email: "", text: "" });
        setTouched({ name: false, email: false, text: false });
      } else {
        const error = await response.json();
        setFormError(error.message || "Wystąpił błąd podczas wysyłania.");
      }
    } catch {
      setFormError("Brak połączenia. Spróbuj ponownie później.");
    } finally {
      setIsSending(false);
    }
  };

  if (formSubmitted) {
    return (
      <section className="py-16 px-6 max-w-7xl mx-auto text-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Dziękujemy za wiadomość!
        </h3>
        <p className="text-lg text-gray-700 max-w-xl mx-auto">
          Odezwiemy się tak szybko, jak to możliwe.
        </p>
      </section>
    );
  }

  return (
    <section className="py-12 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 mb-3">
          Zostaw wiadomość
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Wypełnij formularz poniżej – odpowiemy najszybciej, jak to możliwe!
        </p>
      </div>

      {/* Kontakt w ładnym bloku */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8 text-gray-700 text-lg font-medium">
        <a
          href="tel:+48535479000"
          className="flex items-center gap-2 hover:text-[#ff5353] transition-colors"
        >
          <span className="text-2xl">📞</span>
          <span>535 479 000</span>
        </a>
        <span className="hidden sm:block text-gray-400">|</span>
        <a
          href="mailto:mwidel@pantofle-karpaty.pl"
          className="flex items-center gap-2 hover:text-[#ff5353] transition-colors"
        >
          <span className="text-2xl">✉️</span>
          <span>mwidel@pantofle-karpaty.pl</span>
        </a>
      </div>

      {formError && (
        <p className="text-red-600 text-center font-medium mb-6">{formError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            {
              label: "Imię i nazwisko",
              name: "name",
              type: "text",
              placeholder: "Jan Kowalski",
            },
            {
              label: "Adres e-mail",
              name: "email",
              type: "email",
              placeholder: "jan@domena.pl",
            },
          ].map((field) => (
            <div key={field.name}>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-4 rounded-lg border text-base transition-all focus:outline-none focus:ring-2 focus:ring-[#ff5353] ${
                  hasError(field.name)
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-[#ff5353]"
                }`}
              />
              {hasError(field.name) && (
                <p className="text-red-500 text-sm mt-1.5 pl-1">
                  {field.name === "name"
                    ? "Podaj imię i nazwisko"
                    : "Podaj poprawny adres e-mail"}
                </p>
              )}
            </div>
          ))}
        </div>

        <div>
          <label
            htmlFor="text"
            className="block text-gray-800 font-medium mb-2"
          >
            Twoja wiadomość
          </label>
          <textarea
            id="text"
            name="text"
            rows={5}
            placeholder="Napisz, w czym możemy pomóc..."
            value={formData.text}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-4 rounded-lg border text-base resize-none transition-all focus:outline-none focus:ring-2 focus:ring-[#ff5353] ${
              hasError("text")
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-[#ff5353]"
            }`}
          />
          {hasError("text") && (
            <p className="text-red-500 text-sm mt-1.5 pl-1">
              Wiadomość nie może być pusta
            </p>
          )}
        </div>

        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isSending}
            className="px-8 py-3.5 bg-[#ff5353] text-white font-bold text-lg rounded-full shadow-lg hover:bg-[#ff4444] hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSending ? "Wysyłanie..." : "Wyślij wiadomość"}
          </button>
        </div>
      </form>
    </section>
  );
}
