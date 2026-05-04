import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav/Nav";
import FreeDelivery from "./components/FreeDelivery/FreeDelivery";
import Footer from "./components/Footer/Footer";
import AuthProvider from "./providers";
import { CartProvider } from "./context/cartContext";
import { CategoriesProvider } from "./context/categoriesContext";
import CookieConsent from "./components/CookieConsent";
import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export default function RootLayout({ children }) {
  const fbPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  return (
    <html lang="pl">
      <head>
        {/* Google Consent Mode - domyślna odmowa */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'wait_for_update': 500
            });
          `}
        </Script>
      </head>
      <body
        className={`${josefinSans.className} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <CartProvider>
            <CategoriesProvider>
              <FreeDelivery />
              <Nav />
              <main className="grow">{children}</main>
              <CookieConsent />
              <GoogleTagManager gtmId="GTM-M7C454G3" />
              <Footer />
            </CategoriesProvider>
          </CartProvider>
        </AuthProvider>

        {/* Facebook Pixel noscript - dla użytkowników bez JS */}
        {fbPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr.php?id=${fbPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
      </body>
    </html>
  );
}
