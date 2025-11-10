"use client";

import { useState } from "react";
import InPostGeowidget from "../components/InpostMap";


export default function ClientReturnForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    product: "",
    reason: "",
  });
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [selectedPaczkomat, setSelectedPaczkomat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message && !isSuccess) setMessage(null);
  };

  const handlePointSelect = (point) => {
    setSelectedPaczkomat(point);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPaczkomat) {
      setMessage("Proszę wybrać paczkomat do zwrotu.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/zwrot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          acceptPolicy,
          paczkomat: {
            name: selectedPaczkomat.name,
            address: `${selectedPaczkomat.fullData.address_details.street} ${selectedPaczkomat.fullData.address_details.building_number}, ${selectedPaczkomat.fullData.address_details.post_code} ${selectedPaczkomat.fullData.address_details.city}`,
            pointId: selectedPaczkomat.fullData.name, // np. KRA01N
          },
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage(result.message || "Zgłoszenie zwrotu przyjęte!");
      } else {
        setMessage(result.message || "Wystąpił błąd. Spróbuj ponownie.");
      }
    } catch (error) {
      setMessage("Błąd połączenia. Sprawdź internet i spróbuj ponownie.");
      console.error("Submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // === SUKCES ===
  if (isSuccess) {
    return (
      <div className="max-w-5xl mx-auto p-6 sm:p-8 lg:p-12 bg-white shadow-lg rounded-xl min-h-screen flex items-center justify-center">
        <section className="w-full max-w-md bg-green-50 p-8 rounded-lg border border-green-200 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-green-800 mb-3">
            Zgłoszenie przyjęte!
          </h3>
          <p className="text-gray-700 mb-4">{message}</p>
          <p className="text-sm text-gray-600">
            Etykieta zwrotna na paczkomat{" "}
            <strong>{selectedPaczkomat?.name}</strong> zostanie wysłana na{" "}
            <strong>{formData.email}</strong> w ciągu 24h.
            <br />
            Sprawdź folder SPAM, jeśli nie dojdzie.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Zgłoś kolejny zwrot
          </button>
        </section>
      </div>
    );
  }

  // === GŁÓWNA TREŚĆ + FORMULARZ ===
  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 lg:p-12 bg-white shadow-lg rounded-xl">
      <h1 className="text-3xl xl:text-4xl font-extrabold text-center mb-10 text-gray-900 tracking-tight">
        Polityka Zwrotów i Reklamacji
      </h1>

      {/* Wstęp */}
      <section className="mb-12 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-semibold text-blue-900 mb-3">
          Kupiłaś/eś, przymierzyłaś/eś i nie pasuje?
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Nie martw się! Masz <strong>14 dni</strong> na zwrot zakupionego
          towaru. Zwrot środków nastąpi{" "}
          <strong>niezwłocznie – nie później niż 14 dni</strong> od otrzymania
          zwrotu.
        </p>
      </section>

      {/* Zwrot z etykietą */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-600 pb-2">
          Łatwe i szybkie zwroty – etykieta od nas
        </h2>
        <p className="text-gray-700 mb-4">
          Nie musisz martwić się o organizowanie przesyłki. Wyślemy Ci gotową
          etykietę mailowo. Koszt zwrotu do Paczkomatu InPost:{" "}
          <strong>13,99 zł</strong> (zostanie potrącony z kwoty zwrotu).
        </p>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-medium text-gray-800 mb-4">
            Zwrot krok po kroku:
          </h3>
          <ol className="space-y-5 text-gray-700">
            {[
              { step: "Zgłoś zwrot", desc: "Wypełnij poniższy formularz." },
              {
                step: "Wybierz paczkomat",
                desc: "Wskaż paczkomat, do którego chcesz odesłać paczkę.",
              },
              {
                step: "Pobierz etykietę",
                desc: "Wyślemy Ci gotową etykietę zwrotną na e-mail.",
              },
              {
                step: "Spakuj produkt",
                desc: "Produkt musi być nieużywany, z metkami, w oryginalnym opakowaniu. Dołącz paragon!",
              },
              { step: "Naklej etykietę", desc: "Umieść etykietę na paczce." },
              {
                step: "Nadaj paczkę",
                desc: "Zanieś do wybranego Paczkomatu InPost.",
              },
              { step: "Śledź zwrot", desc: "Otrzymasz link do śledzenia." },
              {
                step: "Zwrot pieniędzy",
                desc: "Po sprawdzeniu towaru, zwrócimy środki (pomniejszone o 13,99 zł).",
              },
            ].map((item, i) => (
              <li key={i} className="flex items-start">
                <span className="shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                  {i + 1}
                </span>
                <div>
                  <strong className="block text-gray-800">{item.step}</strong>
                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* WYBÓR PACZKOMATU */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Wybierz paczkomat do zwrotu
          </h3>
          <InPostGeowidget
            token={process.env.NEXT_PUBLIC_INPOST_TOKEN} // ← dodaj w .env
            onPointSelect={handlePointSelect}
            config="parcelCollect"
          />
        </div>

        {/* FORMULARZ */}
        <div className="bg-white p-6 border border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Dane do zgłoszenia
          </h3>

          {message && (
            <div
              className={`p-4 rounded-lg mb-4 text-sm font-medium ${
                isSuccess
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
          >
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Imię i nazwisko"
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Adres e-mail"
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleInputChange}
              placeholder="Numer zamówienia"
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              placeholder="Produkt do zwrotu"
              required
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              className="p-3 border border-gray-300 rounded-lg md:col-span-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Wybierz powód zwrotu</option>
              <option value="Zły rozmiar">Zły rozmiar</option>
              <option value="Nie spodobał się fason">
                Nie spodobał się fason
              </option>
              <option value="Inny kolor niż na zdjęciu">
                Inny kolor niż na zdjęciu
              </option>
              <option value="Inne">Inne</option>
            </select>

            <label className="flex items-center md:col-span-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={acceptPolicy}
                onChange={(e) => setAcceptPolicy(e.target.checked)}
                required
                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              Akceptuję politykę zwrotów
            </label>

            <button
              type="submit"
              disabled={isLoading || !acceptPolicy || !selectedPaczkomat}
              className={`md:col-span-2 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
                isLoading || !acceptPolicy || !selectedPaczkomat
                  ? "bg-gray-400 cursor-not-allowed text-gray-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Wysyłanie...
                </>
              ) : (
                "Wyślij zgłoszenie"
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Alternatywny zwrot */}
      <section className="mb-12 bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h3 className="text-xl font-medium text-amber-900 mb-3 flex items-center">
          Zwrot na własny koszt
        </h3>
        <p className="text-gray-700">
          Jeśli wolisz, możesz odesłać towar <strong>samodzielnie</strong>{" "}
          dowolnym przewoźnikiem – wtedy <strong>nie potrącamy 13,99 zł</strong>
          .
        </p>
        <p className="mt-2 font-medium">
          Adres zwrotów:
          <br />
          Firma „KARPATY” Maciej Wideł
          <br />
          34-654 Męcina 607
          <br />
          tel.:{" "}
          <a href="tel:+48608238103" className="text-blue-600 underline">
            +48 608 238 103
          </a>
        </p>
      </section>

      {/* Reklamacja */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-red-600 pb-2">
          Reklamacja – coś poszło nie tak?
        </h2>
        <p className="text-gray-700 mb-4">
          Otrzymałaś/eś produkt z wadą? Skontaktuj się z nami{" "}
          <strong>
            najszybciej, jak to możliwe – nie później niż 24 godziny od odbioru
          </strong>
          . Zlecimy odbiór paczki.
        </p>

        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="text-xl font-medium text-red-900 mb-4">
            Zasady reklamacji:
          </h3>
          <ol className="space-y-3 text-gray-700 list-decimal pl-6">
            <li>
              <strong>Dobrze zapakuj i zabezpiecz</strong> produkt. Obuwie musi
              wrócić w oryginalnym kartonie.
            </li>
            <li>
              Reklamowany produkt <strong>musi być czysty</strong>.
            </li>
            <li>
              W przypadku <strong>uzasadnionej reklamacji</strong>: naprawimy,
              wymienimy na nowy lub zwrócimy koszt.
            </li>
            <li>
              Zwrócimy <strong>najtaniejszy koszt wysyłki</strong> dostępny w
              sklepie.
            </li>
            <li>Zwrot środków – tą samą metodą płatności.</li>
            <li>
              <strong>Nie przyjmujemy przesyłek za pobraniem</strong>.
            </li>
          </ol>
        </div>

        <div className="mt-6 p-5 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium text-gray-800">
            Obuwie domowe przeznaczone jest{" "}
            <strong>wyłącznie do użytku wewnętrznego</strong>.<br />
            Reklamacje dotyczące śladów użytkowania na zewnątrz{" "}
            <strong>nie będą rozpatrywane pozytywnie</strong>.
          </p>
        </div>
      </section>

      {/* Kontakt */}
      <section className="mb-12 text-center">
        <p className="text-gray-600">
          Masz pytania? Napisz:{" "}
          <a
            href="mailto:mwidel@pantofle-karpaty.pl"
            className="text-blue-600 underline font-medium"
          >
            mwidel@pantofle-karpaty.pl
          </a>
          <br />
          lub zadzwoń:{" "}
          <a
            href="tel:+48608238103"
            className="text-blue-600 underline font-medium"
          >
            +48 608 238 103
          </a>{" "}
          (pn–pt, 8:00–17:00)
        </p>
      </section>

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>
          Polityka zwrotów i reklamacji obowiązuje od dnia publikacji na stronie
          Sklepu.
        </p>
      </footer>
    </div>
  );
}
