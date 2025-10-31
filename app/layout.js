import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav/Nav";
import FreeDelivery from "./components/FreeDelivery/FreeDelivery";
import Footer from "./components/Footer/Footer";
import AuthProvider from "./providers";
import { CartProvider } from "./context/cartContext";
import { AdminProvider } from "./context/adminContext";
import { CategoriesProvider } from "./context/categoriesContext";
import CookieConsent from "./components/CookieConsent";

// Konfiguracja czcionki Josefin Sans
const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Pantofle Karpaty - Kapcie Skórzane i Wełniane | Producent",
  description:
    "Sklep Pantofle Karpaty - producent tradycyjnych kapci domowych. Znajdź ciepłe i wygodne pantofle regionalne, bambosze i laczki z naturalnej skóry i wełny.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body
        className={`${josefinSans.className} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <CartProvider>
            <CategoriesProvider>
              <AdminProvider>
                <FreeDelivery />
                <Nav />
                <main className="grow">{children}</main>
                <CookieConsent />
                <Footer />
              </AdminProvider>
            </CategoriesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
