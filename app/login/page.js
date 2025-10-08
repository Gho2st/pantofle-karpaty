// app/login/page.js
import { getProviders } from "next-auth/react";
import ClientSignIn from "../components/ClientSignIn";

// Komponent serwera do pobierania dostawców
export default async function SignInPage() {
  const providers = await getProviders();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Zaloguj się do Karpaty
        </h1>

        {/* Renderujemy komponent klienta z listą dostawców */}
        <ClientSignIn providers={providers} />

        <p className="mt-6 text-sm text-gray-500">
          Zaloguj się, aby uzyskać dostęp do panelu klienta.
        </p>
      </div>
    </div>
  );
}
