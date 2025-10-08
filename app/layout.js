import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav/Nav";
import FreeDelivery from "./components/FreeDelivery/FreeDelivery";
import Footer from "./components/Footer/Footer";

// Konfiguracja czcionki Josefin Sans
const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  // Możesz dodać zmienną CSS, jeśli planujesz używać jej w stylach CSS
  // variable: "--font-josefin-sans",
  weight: ["200", "300", "400", "500", "600", "700"], // Dodaj wagi, których faktycznie używasz
});

export const metadata = {
  title: "Pantofle Karpaty",
  description: "dasdas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body className={`${josefinSans.className} antialiased`}>
        <FreeDelivery />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
