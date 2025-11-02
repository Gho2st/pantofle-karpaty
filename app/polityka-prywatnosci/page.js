// app/polityka-prywatnosci/page.js
import { Metadata } from "next";

export const metadata = {
  title: "Polityka Prywatności | Pantofle Karpaty",
  description:
    "Pełna polityka prywatności sklepu Pantofle Karpaty. Dowiedz się, jakie dane zbieramy, jak je chronimy i jakie masz prawa. Bezpieczeństwo i RODO.",
  alternates: {
    canonical: "/polityka-prywatnosci",
  },
  robots: "index, follow",
};

export default function PolitykaPrywatnosci() {
  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 lg:p-12 bg-white shadow-lg rounded-xl">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900 tracking-tight">
        Polityka Prywatności
      </h1>

      <p className="text-sm text-gray-500 text-center mb-12">
        Ostatnia aktualizacja: <strong>31 października 2025</strong>
      </p>

      {/* § 1 Administrator */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 1 Administrator danych osobowych
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Administratorem Twoich danych osobowych jest:
          <br />
          <strong>Maciej Wideł</strong>, prowadzący działalność gospodarczą pod
          firmą
          <br />
          <strong>„KARPATY” Maciej Wideł</strong>
          <br />
          34-654 Męcina 607
          <br />
          NIP: <strong>7371000446</strong>, REGON: <strong>490255140</strong>
        </p>
        <p className="mt-4 text-gray-700">
          Kontakt:
          <br />
          E-mail:{" "}
          <a
            href="mailto:mwidel@pantofle-karpaty.pl"
            className="text-blue-600 underline hover:text-blue-800"
          >
            mwidel@pantofle-karpaty.pl
          </a>
          <br />
          Telefon:{" "}
          <a
            href="tel:+48608238103"
            className="text-blue-600 underline hover:text-blue-800"
          >
            +48 608 238 103
          </a>
        </p>
      </section>

      {/* § 2 Jakie dane zbieramy */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 2 Jakie dane zbieramy?
        </h2>

        <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
          A. Dane podane przez Ciebie:
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Rejestracja / logowanie przez Google:</strong> imię, e-mail,
            zdjęcie profilowe
          </li>
          <li>
            <strong>Zamówienie:</strong> imię, nazwisko, e-mail, telefon, adres
            dostawy (ulica, miasto, kod pocztowy), paczkomat (opcjonalnie), dane
            do faktury (firma, NIP)
          </li>
          <li>
            <strong>Koszyk:</strong> wybrane produkty, rozmiary, ilości
          </li>
          <li>
            <strong>Płatności:</strong> ID sesji płatności (Stripe –{" "}
            <strong>nie przechowujemy danych karty!</strong>)
          </li>
        </ul>

        <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
          B. Dane zbierane automatycznie:
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Google Analytics 4 (GA4):</strong> adres IP
            (zanonimizowany), zachowanie na stronie, urządzenie, przeglądarka,
            czas sesji
          </li>
          <li>
            <strong>Logi serwera:</strong> adres IP, data wizyty, błędy
            systemowe
          </li>
        </ul>
      </section>

      {/* § 3 Cel przetwarzania */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 3 W jakim celu przetwarzamy dane?
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[600px]">
            <thead className="text-xs uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-2">Cel</th>
                <th className="px-4 py-2">Podstawa prawna</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2">Realizacja zamówienia i dostawy</td>
                <td className="px-4 py-2">Art. 6 ust. 1 lit. b RODO</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Obsługa konta</td>
                <td className="px-4 py-2">Art. 6 ust. 1 lit. b RODO</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Wystawienie faktury</td>
                <td className="px-4 py-2">Art. 6 ust. 1 lit. c RODO</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Zwroty i reklamacje</td>
                <td className="px-4 py-2">Art. 6 ust. 1 lit. b i c</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Analityka (GA4)</td>
                <td className="px-4 py-2">
                  Art. 6 ust. 1 lit. f (prawnie uzasadniony interes)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* § 4 Odbiorcy danych */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 4 Komu przekazujemy dane?
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Stripe, Inc.</strong> – płatności (dane karty nie trafiają
            do nas)
          </li>
          <li>
            <strong>InPost</strong> – dostawa do paczkomatu
          </li>
          <li>
            <strong>Kurier Inpost</strong> – dostawa
          </li>
          <li>
            <strong>Google Ireland Ltd.</strong> – GA4 (dane zanonimizowane)
          </li>
          <li>
            <strong>Neon / Vercel</strong> – hosting bazy danych
          </li>
        </ul>
      </section>

      {/* § 5 Transfer poza EOG */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 5 Czy dane trafiają poza EOG?
        </h2>
        <p className="text-gray-700">Tak – ale z zabezpieczeniami:</p>
        <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
          <li>
            <strong>Stripe (USA):</strong> Standardowe klauzule umowne (SCC)
          </li>
          <li>
            <strong>Google (USA):</strong> SCC + zanonimizowany IP
          </li>
          <li>
            <strong>Neon/Vercel (USA):</strong> SCC
          </li>
        </ul>
      </section>

      {/* § 6 Okres przechowywania */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 6 Jak długo przechowujemy dane?
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Dane konta: do usunięcia + 30 dni</li>
          <li>
            Zamówienia/faktury: <strong>10 lat</strong> (obowiązek podatkowy)
          </li>
          <li>Koszyk niezrealizowany: 30 dni</li>
          <li>Logi: 90 dni</li>
          <li>
            GA4: <strong>14 miesięcy</strong> (automatyczne usuwanie)
          </li>
        </ul>
      </section>

      {/* § 7 Prawa użytkownika */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 7 Twoje prawa
        </h2>
        <p className="text-gray-700 mb-3">Masz prawo do:</p>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>dostępu do danych</li>
          <li>sprostowania</li>
          <li>usunięcia („bycia zapomnianym”)</li>
          <li>ograniczenia przetwarzania</li>
          <li>przenoszenia danych</li>
          <li>sprzeciwu wobec analityki</li>
        </ul>
        <p className="mt-4 text-gray-700">
          Napisz:{" "}
          <a
            href="mailto:mwidel@pantofle-karpaty.pl"
            className="text-blue-600 underline hover:text-blue-800"
          >
            mwidel@pantofle-karpaty.pl
          </a>
        </p>
      </section>

      {/* § 8 Bezpieczeństwo */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 8 Bezpieczeństwo
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Szyfrowanie HTTPS (TLS 1.3)</li>
          <li>Hashowanie haseł (bcrypt)</li>
          <li>
            Dane karty – <strong>nigdy nie trafiają na nasz serwer</strong>
          </li>
          <li>Backupy i ograniczone IP</li>
        </ul>
      </section>

      {/* § 9 Cookies */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 9 Pliki cookies i zgoda
        </h2>
        <p className="text-gray-700 mb-3">
          Używamy tylko <strong>analitycznych cookies</strong> z Google
          Analytics 4.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[500px]">
            <thead className="text-xs uppercase bg-gray-100">
              <tr>
                <th className="px-3 py-2">Cookie</th>
                <th className="px-3 py-2">Cel</th>
                <th className="px-3 py-2">Czas</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              <tr>
                <td className="px-3 py-2">next-auth.session-token</td>
                <td className="px-3 py-2">Logowanie</td>
                <td className="px-3 py-2">30 dni</td>
              </tr>
              <tr>
                <td className="px-3 py-2">cart</td>
                <td className="px-3 py-2">Koszyk gościa</td>
                <td className="px-3 py-2">30 dni</td>
              </tr>
              <tr>
                <td className="px-3 py-2">_ga, _gid</td>
                <td className="px-3 py-2">Google Analytics 4</td>
                <td className="px-3 py-2">2 lata / 24h</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Zgoda na cookies zbierana jest przez baner na dole strony. Możesz ją
          zmienić w każdej chwili.
        </p>
      </section>

      {/* § 10 Zmiany */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 10 Zmiany w polityce
        </h2>
        <p className="text-gray-700">
          O zmianach poinformujemy e-mailem lub na stronie sklepu.
        </p>
      </section>

      {/* § 11 Kontakt */}
      <section className="mb-12 text-center bg-blue-50 p-6 rounded-lg border border-blue-200">
        <p className="text-gray-700">
          Masz pytania?
          <br />
          <a
            href="mailto:mwidel@pantofle-karpaty.pl"
            className="text-blue-600 underline font-medium hover:text-blue-800"
          >
            mwidel@pantofle-karpaty.pl
          </a>
          <br />
          <a
            href="tel:+48608238103"
            className="text-blue-600 underline font-medium hover:text-blue-800"
          >
            +48 608 238 103
          </a>
        </p>
      </section>

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>© 2025 Sklep Internetowy KARPATY. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </div>
  );
}
