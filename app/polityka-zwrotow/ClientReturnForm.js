export default function ClientReturnForm() {
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
          Nie martw się! Masz <strong>30 dni</strong> na zwrot zakupionego
          towaru. Zwrot środków nastąpi{" "}
          <strong>niezwłocznie – nie później niż 14 dni</strong> od otrzymania
          zwrotu.
        </p>
      </section>

      {/* Wymiana */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-600 pb-2">
          Wymiana
        </h2>
        <p className="text-gray-700 mb-4">
          Pierwsza wymiana produktu jest całkowicie darmowa.
        </p>
        <p className="text-gray-700 mb-4">
          Aby dokonać wymiany, należy najpierw odesłać produkt za pomocą
          formularza Szybkie Zwroty InPost. W polu „Opis” prosimy wpisać, na
          jaki rozmiar oraz model ma zostać wymieniony produkt. Po otrzymaniu i
          zweryfikowaniu przesyłki niezwłocznie wyślemy nowy produkt we
          wskazanym rozmiarze lub modelu.
        </p>
        <p className="text-gray-700">
          Link do zgłoszenia:{" "}
          <a
            href="https://szybkiezwroty.pl/pl/KARPATY_Pantofle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline font-medium"
          >
            szybkiezwroty.pl/pl/KARPATY_Pantofle
          </a>
        </p>
      </section>

      {/* Zwroty */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-600 pb-2">
          Zwroty
        </h2>
        <p className="text-gray-700 mb-4">
          W przypadku zwrotu koszt przesyłki zwrotnej wynosi{" "}
          <strong>9,99 zł</strong> i zostanie potrącony z kwoty zwracanej za
          zamówienie.
        </p>
        <p className="text-gray-700 mb-6">
          Zwrot mogą Państwo wygodnie zrealizować za pomocą usługi Szybkie
          Zwroty InPost, korzystając z poniższego linku:{" "}
          <a
            href="https://szybkiezwroty.pl/pl/KARPATY_Pantofle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline font-medium"
          >
            szybkiezwroty.pl/pl/KARPATY_Pantofle
          </a>
        </p>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-medium text-gray-800 mb-4">
            Instrukcja zwrotu:
          </h3>
          <ol className="space-y-3 text-gray-700 list-decimal pl-6">
            <li>
              Prosimy przejść do powyższego linku i wypełnić formularz zwrotu.
            </li>
            <li>
              Po jego uzupełnieniu otrzymają Państwo kod zwrotu lub etykietę.
            </li>
            <li>
              Należy bezpiecznie zapakować zwracany produkt oraz dołączyć do
              przesyłki paragon.
            </li>
            <li>Przesyłkę można nadać w dowolnym Paczkomacie InPost.</li>
          </ol>
        </div>

        <p className="text-gray-700">
          Po otrzymaniu i zweryfikowaniu przesyłki zwrotnej dokonamy zwrotu
          środków w terminie do <strong>14 dni</strong>, zgodnie z
          obowiązującymi przepisami.
        </p>
      </section>

      {/* Alternatywny zwrot */}
      <section className="mb-12 bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h3 className="text-xl font-medium text-amber-900 mb-3 flex items-center">
          Zwrot na własny koszt
        </h3>
        <p className="text-gray-700">
          Jeśli wolisz, możesz odesłać towar <strong>samodzielnie</strong>{" "}
          dowolnym przewoźnikiem – wtedy <strong>nie potrącamy 9,99 zł</strong>.
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
              Zwrócimy <strong>najtańszy koszt wysyłki</strong> dostępny w
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
