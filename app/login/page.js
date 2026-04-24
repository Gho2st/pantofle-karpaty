// app/login/page.js
import { getProviders } from "next-auth/react";
import ClientSignIn from "./ClientSignIn";
import AnimatedLock from "./AnimatedLock";

export const metadata = {
  title: "Logowanie | Pantofle Karpaty",
  description: "Zaloguj się bezpiecznie przez Google.",
  alternates: { canonical: "/login" },
  robots: "noindex, nofollow",
};

export default async function SignInPage() {
  const providers = await getProviders();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white border border-gray-100 rounded-md max-w-sm w-full text-center px-8 py-10 sm:px-10">
        {/* Logo / ikona */}
        <div className="flex justify-center mb-8">
          <AnimatedLock />
        </div>

        {/* Nagłówek */}
        <h1 className="text-2xl uppercase font-medium tracking-wide text-gray-900 mb-2">
          Witaj
        </h1>
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-8">
          Sklep Pantofle Karpaty
        </p>

        {/* Przycisk logowania */}
        <ClientSignIn providers={providers} />

        {/* Stopka */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            Korzystamy z bezpiecznego logowania Google.
            <br />
            Nigdy nie przechowujemy Twojego hasła.
          </p>
        </div>
      </div>
    </div>
  );
}
