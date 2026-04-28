"use client";
import { useState } from "react";
import { Phone, Mail, Clock } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", text: "" });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    text: false,
  });
  const [isSending, setIsSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

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
      <section className="py-20 lg:py-32 px-6 max-w-6xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">
          Kontakt
        </p>
        <h3 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6">
          Dziękujemy za <span className="text-red-700">wiadomość!</span>
        </h3>
        <p className="text-lg text-gray-500 leading-relaxed max-w-md mx-auto">
          Odezwiemy się tak szybko, jak to możliwe — zazwyczaj tego samego dnia
          roboczego.
        </p>
      </section>
    );
  }

  const inputClass = (field) =>
    `w-full border rounded-xl px-5 py-4 text-base text-gray-900 placeholder-gray-300 focus:outline-none transition-colors ${
      hasError(field)
        ? "border-red-300 focus:border-red-400 bg-red-50/30"
        : "border-gray-200 focus:border-gray-400 bg-white"
    }`;

  return (
    <section className="py-20 2xl:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-16 lg:gap-24 items-start">
          {/* Lewa kolumna — info */}
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">
              Kontakt
            </p>
            <h1 className="text-4xl lg:text-5xl font-light text-gray-900 leading-tight mb-6">
              Napisz do <span className="text-red-700">nas.</span>
            </h1>
            <p className="text-base text-gray-500 leading-relaxed mb-10">
              Odpowiemy najszybciej jak to możliwe — zazwyczaj tego samego dnia
              roboczego.
            </p>

            {/* Dane kontaktowe */}
            <div className="flex flex-col gap-5">
              <a
                href="tel:+48535479000"
                className="group flex items-center gap-4 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:border-gray-200 group-hover:bg-white transition-all">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">
                    Telefon
                  </p>
                  <p className="text-base font-medium">535 479 000</p>
                </div>
              </a>

              <a
                href="mailto:mwidel@pantofle-karpaty.pl"
                className="group flex items-center gap-4 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:border-gray-200 group-hover:bg-white transition-all">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">
                    E-mail
                  </p>
                  <p className="text-base font-medium">
                    mwidel@pantofle-karpaty.pl
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4 text-gray-700">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">
                    Godziny pracy
                  </p>
                  <p className="text-base font-medium">Pn–Pt, 8:00–17:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prawa kolumna — formularz */}
          <div className="lg:col-span-3 bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-sm">
            {formError && (
              <p className="text-red-500 text-sm mb-6 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Jan Kowalski"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass("name")}
                  />
                  {hasError("name") && (
                    <p className="text-red-400 text-xs mt-2 pl-1">
                      Podaj imię i nazwisko
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                    Adres e-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="jan@domena.pl"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass("email")}
                  />
                  {hasError("email") && (
                    <p className="text-red-400 text-xs mt-2 pl-1">
                      Podaj poprawny adres e-mail
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
                  Wiadomość
                </label>
                <textarea
                  id="text"
                  name="text"
                  rows={6}
                  placeholder="Napisz, w czym możemy pomóc…"
                  value={formData.text}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass("text")} resize-none`}
                />
                {hasError("text") && (
                  <p className="text-red-400 text-xs mt-2 pl-1">
                    Wiadomość nie może być pusta
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full sm:w-auto px-10 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {isSending ? "Wysyłanie…" : "Wyślij wiadomość →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
