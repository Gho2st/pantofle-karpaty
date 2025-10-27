"use client";
import { useState } from "react";

export default function Form() {
  const [formData, setFormData] = useState({
    name: "",
    text: "",
    email: "",
  });

  const [isSending, setIsSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);
  const [errorFields, setErrorFields] = useState([]);

  function validateForm(data) {
    const errors = [];
    if (!data.name.trim()) errors.push("name");
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.push("email");
    if (!data.text.trim()) errors.push("text");

    setErrorFields(errors);
    return errors.length === 0;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const sendMail = async (e) => {
    e.preventDefault();
    if (isSending) return;

    if (!validateForm(formData)) {
      setFormError("Proszę uzupełnij wszystkie wymagane pola.");
      return;
    }

    setFormError(null);

    setIsSending(true);

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...formData }),
      });

      if (response.ok) {
        setFormSubmitted(true);
        setFormData({
          text: "",
          name: "",
          email: "",
        });
        onFormSubmit();
      } else {
        const errorData = await response.json();
        setFormError(`Error: ${errorData.message}`);
      }
    } catch (error) {
      setFormError("Niespodziewany błąd.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <>
        {!formSubmitted ? (
          <div className="flex flex-col pt-4 max-w-7xl mx-auto mt-10 px-[4%]">
            <h2 className="text-2xl xl:text-3xl font-bold mb-2">
              Zostaw Wiadomość
            </h2>
            <p className="mb-4 text-xl">
              Wypełnij formularz poniżej, a my wrócimy do Ciebie z odpowiedzią
              jak najszybciej to możliwe!
            </p>
            {formError && <p className="text-red-600 mb-4">{formError}</p>}

            <form onSubmit={sendMail} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    label: "Imię i nazwisko",
                    type: "text",
                    name: "name",
                    value: formData.name,
                  },
                  {
                    label: "Adres e-mail",
                    type: "email",
                    name: "email",
                    value: formData.email,
                  },
                ].map((field, index) => (
                  <input
                    key={index}
                    type={field.type}
                    name={field.name}
                    placeholder={field.label}
                    value={field.value}
                    onChange={handleChange}
                    className={`w-full p-4 text-base rounded-md shadow-sm ${
                      errorFields.includes(field.name)
                        ? "border border-red-500"
                        : "border border-gray-200"
                    }`}
                  />
                ))}
              </div>

              <div>
                <label htmlFor="text" className="block text-black">
                  Wiadomość:
                </label>
                <textarea
                  id="text"
                  name="text"
                  placeholder="Napisz swoją wiadomość"
                  value={formData.text}
                  onChange={handleChange}
                  className={`w-full h-[125px] p-4 text-base rounded-md shadow-sm mt-2 resize-none ${
                    errorFields.includes("text")
                      ? "border border-red-500"
                      : "border border-gray-200"
                  }`}
                />
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-3 rounded-full bg-[#ff5353] text-white font-semibold text-xl shadow-md transition-transform hover:scale-105 disabled:opacity-50"
                >
                  {isSending ? "Wysyłanie..." : "Wyślij wiadomość!"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center">
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
    </>
  );
}
