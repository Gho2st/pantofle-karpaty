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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-slate-200 max-w-sm w-full text-center">
        <div className="flex justify-center mb-6">
          <AnimatedLock />
        </div>

        <h1 className="text-3xl font-bold mb-2 text-slate-900">Witaj!</h1>
        <p className="text-slate-600 mb-8 text-sm">
          Zaloguj się do panelu Pantofle Karpaty
        </p>

        {/* PRZENOSIMY CAŁĄ LOGIKĘ DO KLIENTA */}
        <ClientSignIn providers={providers} />

        <div className="mt-8 text-xs lg:text-base text-slate-600 border-t border-slate-200 pt-6">
          <p className="text-slate-500 text-xs">
            Korzystamy z bezpiecznego logowania Google. Nigdy nie przechowujemy
            Twojego hasła.
          </p>
        </div>
      </div>
    </div>
  );
}
