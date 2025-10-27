// app/login/page.js
import { getProviders } from "next-auth/react";
import ClientSignIn from "./ClientSignIn";
import AnimatedLock from "./AnimatedLock";
// Możemy dodać ikonę tarczy dla wzmocnienia przekazu
import { ShieldCheck } from "lucide-react";

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

        {/* Komponent klienta renderuje przyciski */}
        <ClientSignIn providers={providers} />

        <div className="mt-8 text-xs lg:text-base text-slate-600 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-semibold">
              Twoje bezpieczeństwo jest dla nas kluczowe
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            Korzystamy wyłącznie z bezpiecznego logowania Google. Oznacza to, że
            <strong className="text-slate-700">
              {" "}
              nigdy nie przechowujemy Twojego hasła{" "}
            </strong>
            na naszych serwerach. Pełna obsługa logowania leży po stronie
            Google.
          </p>
        </div>
      </div>
    </div>
  );
}
