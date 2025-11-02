import { Metadata } from "next";

export const metadata = {
  title: "Regulamin Sklepu | Pantofle Karpaty",
  description:
    "Pełny regulamin sklepu internetowego KARPATY. Zasady zakupów, zwroty, reklamacje, dane osobowe. Wszystko jasno i zgodnie z prawem.",
  alternates: {
    canonical: "/regulamin",
  },
  robots: "index, follow",
};

export default function RegulaminSklepu() {
  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 lg:p-12 bg-white shadow-lg rounded-xl">
      <h1 className="text-3xl xl:text-4xl font-extrabold text-center mb-10 text-gray-900 tracking-tight">
        Regulamin Sklepu Internetowego KARPATY
      </h1>

      {/* § 1 Postanowienia wstępne */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 1 Postanowienia wstępne
        </h2>
        <ol className="list-decimal pl-6 space-y-4 text-gray-700">
          <li>
            Sklep internetowy <strong>KARPATY</strong>, dostępny pod adresem{" "}
            <a
              href="https://www.pantofle-karpaty.pl"
              className="text-blue-600 hover:text-blue-800 transition-colors underline"
            >
              www.pantofle-karpaty.pl
            </a>
            , prowadzony jest przez <strong>Macieja Wideł</strong> prowadzącego
            działalność gospodarczą pod firmą{" "}
            <strong>Firma „KARPATY” Maciej Wideł</strong>, wpisaną do Centralnej
            Ewidencji i Informacji o Działalności Gospodarczej (CEIDG), NIP:{" "}
            <strong>7371000446</strong>, REGON: <strong>490255140</strong>.
          </li>
          <li>
            Niniejszy Regulamin skierowany jest zarówno do{" "}
            <strong>Konsumentów</strong>, jak i do{" "}
            <strong>Przedsiębiorców</strong> korzystających ze Sklepu. Określa
            zasady korzystania ze Sklepu internetowego oraz tryb zawierania Umów
            Sprzedaży na odległość.
          </li>
        </ol>
      </section>

      {/* § 2 Definicje */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 2 Definicje
        </h2>
        <dl className="space-y-4 text-gray-700">
          {[
            {
              term: "Konsument",
              def: "osoba fizyczna zawierająca ze Sprzedawcą umowę niezwiązaną bezpośrednio z jej działalnością gospodarczą lub zawodową.",
            },
            {
              term: "Sprzedawca",
              def: "Maciej Wideł prowadzący działalność gospodarczą pod firmą Firma „KARPATY” Maciej Wideł, NIP 7371000446, REGON 490255140.",
            },
            {
              term: "Klient",
              def: "każdy podmiot dokonujący zakupów za pośrednictwem Sklepu.",
            },
            {
              term: "Przedsiębiorca",
              def: "osoba fizyczna, prawna lub jednostka organizacyjna niebędąca osobą prawną, posiadająca zdolność prawną, wykonująca działalność gospodarczą i korzystająca ze Sklepu.",
            },
            {
              term: "Sklep",
              def: "sklep internetowy dostępny pod adresem www.pantofle-karpaty.pl.",
            },
            {
              term: "Umowa zawarta na odległość",
              def: "umowa zawarta bez jednoczesnej obecności stron, z wykorzystaniem środków porozumiewania się na odległość.",
            },
            { term: "Regulamin", def: "niniejszy dokument." },
            {
              term: "Zamówienie",
              def: "oświadczenie woli Klienta zmierzające do zawarcia Umowy Sprzedaży.",
            },
            {
              term: "Konto",
              def: "indywidualne konto Klienta w Sklepie przechowujące dane i historię zamówień.",
            },
            {
              term: "Formularz rejestracji",
              def: "formularz umożliwiający utworzenie Konta.",
            },
            {
              term: "Formularz zamówienia",
              def: "interaktywny formularz służący do składania Zamówień.",
            },
            {
              term: "Koszyk",
              def: "element Sklepu umożliwiający podgląd i modyfikację wybranych Produktów.",
            },
            {
              term: "Produkt",
              def: "rzecz ruchoma lub usługa będąca przedmiotem Umowy Sprzedaży.",
            },
            {
              term: "Umowa Sprzedaży",
              def: "umowa sprzedaży Produktu zawierana między Klientem a Sprzedawcą za pośrednictwem Sklepu. Dokumentem potwierdzającym jest faktura VAT lub paragon fiskalny.",
            },
          ].map(({ term, def }) => (
            <div key={term} className="flex flex-col sm:flex-row">
              <dt className="font-semibold w-full sm:w-48 text-gray-800">
                {term} –
              </dt>
              <dd className="flex-1">{def}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold text-blue-800 mb-1">
            Uwaga dotycząca faktur:
          </p>
          <p>
            Zgodnie z art. 106b ust. 5 ustawy o VAT, faktura do paragonu może
            być wystawiona wyłącznie, gdy na paragonie widnieje NIP nabywcy.
            Paragony z NIP do 450 zł brutto traktowane są jako faktury
            uproszczone.
          </p>
        </div>
      </section>

      {/* § 3 Kontakt */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 3 Kontakt ze Sklepem
        </h2>
        <ul className="space-y-3 pl-6 list-disc text-gray-700">
          <li>
            <strong>Adres:</strong> Firma „KARPATY” Maciej Wideł, 34-654 Męcina
            607
          </li>
          <li>
            <strong>E-mail:</strong>{" "}
            <a
              href="mailto:mwidel@pantofle-karpaty.pl"
              className="text-blue-600 hover:text-blue-800 transition-colors underline"
            >
              mwidel@pantofle-karpaty.pl
            </a>
          </li>
          <li>
            <strong>Telefon:</strong>{" "}
            <a
              href="tel:+48608238103"
              className="text-blue-600 hover:text-blue-800 transition-colors underline"
            >
              +48 608 238 103
            </a>{" "}
            (pn–pt, 8:00–17:00)
          </li>
          <li>
            <strong>Fax:</strong> brak
          </li>
          <li>
            <strong>Konto bankowe:</strong> 06 1020 3453 0000 8602 0009 7758
            (PKO BP)
          </li>
        </ul>
      </section>

      {/* § 4 Wymagania techniczne */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 4 Wymagania techniczne
        </h2>
        <p className="text-gray-700">Aby korzystać ze Sklepu, niezbędne są:</p>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700">
          <li>
            urządzenie z dostępem do Internetu i przeglądarką (Mozilla Firefox,
            Google Chrome lub równoważną),
          </li>
          <li>aktywne konto e-mail,</li>
          <li>włączona obsługa plików cookies,</li>
          <li>zainstalowany Flash Player (opcjonalnie).</li>
        </ul>
      </section>

      {/* § 5 Informacje ogólne */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 5 Informacje ogólne
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700">
          <li>
            Sprzedawca nie ponosi odpowiedzialności za zakłócenia spowodowane
            siłą wyższą, działaniami osób trzecich lub niekompatybilnością
            Sklepu z urządzeniem Klienta.
          </li>
          <li>
            Przeglądanie asortymentu nie wymaga Konta. Zamówienia można składać
            z Kontem lub bez.
          </li>
          <li>Ceny podane są w PLN, zawierają VAT (cena brutto i netto).</li>
          <li>
            Zdjęcia Produktów są poglądowe i mogą nie odzwierciedlać
            rzeczywistego wyglądu.
          </li>
        </ol>
      </section>

      {/* § 6 Zakładanie Konta */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 6 Zakładanie Konta w Sklepie
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700">
          <li>
            Aby założyć Konto, wypełnij Formularz rejestracji (imię, nazwisko,
            firma, NIP, adres, telefon, e-mail).
          </li>
          <li>Założenie Konta jest darmowe.</li>
          <li>Logowanie odbywa się za pomocą loginu i hasła.</li>
          <li>
            Klient może usunąć Konto w dowolnym momencie, bez podawania
            przyczyny.
          </li>
        </ol>
      </section>

      {/* § 7 Zasady składania Zamówienia */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 7 Zasady składania Zamówienia
        </h2>
        <p className="text-gray-700">Aby złożyć Zamówienie:</p>
        <ol className="list-decimal pl-6 mt-2 space-y-3 text-gray-700">
          <li>(opcjonalnie) zaloguj się do Sklepu,</li>
          <li>wybierz Produkt i kliknij „Do koszyka”,</li>
          <li>zaloguj się lub kontynuuj bez rejestracji,</li>
          <li>
            wypełnij dane odbiorcy, adres dostawy, sposób wysyłki i płatności,
          </li>
          <li>
            kliknij „Zamawiam i płacę” oraz potwierdź zamówienie linkiem z
            e-maila,
          </li>
          <li>opłać zamówienie w wybranym terminie.</li>
        </ol>
      </section>

      {/* § 8 Metody dostawy i płatności */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 8 Oferowane metody dostawy i płatności
        </h2>

        <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
          Dostawa:
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Przesyłka kurierska</li>
          <li>Przesyłka kurierska za pobraniem*</li>
          <li>Odbiór osobisty: Męcina 607, 34-654 Męcina</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
          Płatność:
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Płatność za pobraniem*</li>
          <li>Przelew tradycyjny</li>
          <li>
            Płatności elektroniczne przez <strong>Stripe</strong> (BLIK, karta
            płatnicza, Google Pay, Apple Pay, Przelewy24)
          </li>
        </ul>

        <p className="mt-4 text-sm italic text-gray-600">
          * Nie dotyczy produktów „do produkcji”.
        </p>
      </section>

      {/* § 9 Wykonanie umowy sprzedaży */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 9 Wykonanie umowy sprzedaży
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700">
          <li>
            Zawarcie Umowy następuje po złożeniu Zamówienia i jego potwierdzeniu
            przez Sprzedawcę e-mailem.
          </li>
          <li>
            Termin płatności: 7 dni (przelew/płatności online) lub przy odbiorze
            (pobranie/gotówka).
          </li>
          <li>
            Termin dostawy liczony od zaksięgowania płatności lub zawarcia Umowy
            (pobranie). Najdłuższy termin przy różnych Produktach.
          </li>
          <li>
            Dostawa tylko na terenie Polski. Koszty dostawy podane w zakładce
            „Koszty dostawy”.
          </li>
          <li>
            Przesyłki ubezpieczone. W razie uszkodzeń – spisać protokół z
            kurierem.
          </li>
          <li>Odbiór osobisty – bezpłatny.</li>
        </ol>
      </section>

      {/* § 10 Prawo odstąpienia od umowy */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 10 Prawo odstąpienia od umowy
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700">
          <li>
            Konsument może odstąpić od Umowy w terminie <strong>14 dni</strong>{" "}
            bez podawania przyczyny.
          </li>
          <li>Termin biegnie od otrzymania Produktu.</li>
          <li>
            Oświadczenie o odstąpieniu można złożyć e-mailem, pocztą lub przez
            formularz (załącznik nr 1).
          </li>
          <li>Sprzedawca potwierdza otrzymanie oświadczenia e-mailem.</li>
          <li>
            Od 1 stycznia 2021 r. prawo to przysługuje także jednoosobowym
            działalnościom gospodarczym (jeśli zakup niezwiązany z profilem
            działalności).
          </li>
        </ol>

        <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
          § 10a Skutki odstąpienia
        </h3>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700">
          <li>Umowa uważana jest za niezawartą.</li>
          <li>Zwrot płatności w ciągu 14 dni (tę samą metodą).</li>
          <li>
            Sprzedawca może wstrzymać zwrot do otrzymania Produktu lub dowodu
            odesłania.
          </li>
          <li>Konsument odsyła Produkt w ciągu 14 dni z dokumentem zakupu.</li>
          <li>Konsument ponosi koszt zwrotu.</li>
          <li>
            Odpowiedzialność tylko za zmniejszenie wartości Produktu ponad
            niezbędne sprawdzenie.
          </li>
          <li>
            Częściowy zwrot możliwy (z wyjątkiem zestawów). Minimalna jednostka
            zakupowa podana w karcie Produktu.
          </li>
          <li>Przy częściowym zwrocie nie zwraca się kosztów wysyłki.</li>
          <li>
            Przy spadku wartości zamówienia poniżej progu promocyjnego –
            pomniejszenie zwrotu o wartość promocji.
          </li>
        </ol>
      </section>

      {/* § 11 Wyjątki od prawa odstąpienia */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 11 Wyjątki od prawa odstąpienia
        </h2>
        <p className="text-gray-700">
          Prawo odstąpienia <strong>nie przysługuje</strong> w przypadku:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700">
          <li>produktów na zamówienie („do produkcji”),</li>
          <li>
            produktów w zapieczętowanym opakowaniu otwartym po dostawie
            (higiena, zdrowie),
          </li>
          <li>produktów szybko psujących się,</li>
          <li>produktów sprowadzanych na indywidualne zamówienie,</li>
          <li>usług wykonanych za wyraźną zgodą Konsumenta,</li>
          <li>przedsiębiorców (z wyjątkiem JDG na zasadach § 10 pkt 7).</li>
        </ul>
      </section>

      {/* § 12 Reklamacja i gwarancja */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 12 Reklamacja i gwarancja
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700">
          <li>
            Produkty są nowe. Reklamacja na podstawie rękojmi (Kodeks cywilny).
          </li>
          <li>Zgłoś reklamację pisemnie lub e-mailem (załącznik nr 2).</li>
          <li>Zalecane: opis wady, data, dane, żądanie.</li>
          <li>Sprzedawca odpowiada w ciągu 14 dni (Konsument).</li>
          <li>Towar reklamacyjny wysyłaj na adres z § 3.</li>
        </ol>
      </section>

      {/* § 13 Pozasądowe rozstrzyganie sporów */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 13 Pozasądowe sposoby rozpatrywania reklamacji
        </h2>
        <p className="text-gray-700">Konsument może skorzystać z:</p>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700">
          <li>stałego polubownego sądu konsumenckiego,</li>
          <li>mediacji przy WIIH,</li>
          <li>
            bezpłatnej pomocy rzecznika konsumentów lub organizacji
            konsumenckich.
          </li>
        </ul>
        <p className="mt-3 text-gray-700">
          Szczegóły:{" "}
          <a
            href="http://www.uokik.gov.pl"
            className="text-blue-600 hover:text-blue-800 transition-colors underline"
          >
            www.uokik.gov.pl
          </a>
        </p>
      </section>

      {/* § 14 Dane osobowe */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 14 Dane osobowe
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700">
          <li>Administratorem danych jest Sprzedawca.</li>
          <li>
            Dane przetwarzane w celu realizacji Umowy (i marketingu za zgodą).
          </li>
          <li>Odbiorcy: przewoźnicy, operatorzy płatności (w tym Stripe).</li>
          <li>Klient ma prawo dostępu i poprawiania danych.</li>
          <li>
            Podanie danych jest dobrowolne, ale niezbędne do zawarcia Umowy.
          </li>
        </ol>
      </section>

      {/* § 15 Promocje i rabaty */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 15 Promocje i rabaty
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700">
          <li>
            Kody rabatowe i promocje działają tylko przy zamówieniach online.
          </li>
          <li>Obowiązują do wyczerpania zapasów lub końca promocji.</li>
          <li>Rabaty się nie łączą (chyba że wyraźnie wskazano inaczej).</li>
          <li>Nie podlegają wymianie na gotówkę.</li>
          <li>Reklamacje błędów w naliczaniu promocji – zgłoś obsłudze.</li>
        </ol>
      </section>

      {/* § 16 Postanowienia końcowe */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-5 border-b-2 border-blue-600 pb-2">
          § 16 Postanowienia końcowe
        </h2>
        <ol className="list-decimal pl-6 space-y-3 text-gray-700">
          <li>Umowy zawierane w języku polskim.</li>
          <li>
            Sprzedawca może zmieniać Regulamin z ważnych przyczyn (np. zmiana
            prawa). Informacja z 7-dniowym wyprzedzeniem.
          </li>
          <li>Stosuje się prawo polskie.</li>
          <li>
            Klient może skorzystać z platformy ODR:{" "}
            <a
              href="https://ec.europa.eu/"
              className="text-blue-600 hover:text-blue-800 transition-colors underline"
            >
              ec.europa.eu
            </a>
          </li>
        </ol>
      </section>

      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>Regulamin obowiązuje od dnia publikacji na stronie Sklepu.</p>
      </footer>
    </div>
  );
}
