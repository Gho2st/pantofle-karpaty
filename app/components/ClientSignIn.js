"use client";

import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function ClientSignIn({ providers }) {
  if (!providers) {
    return (
      <p className="text-red-500">Brak skonfigurowanych dostawców logowania.</p>
    );
  }

  return (
    <>
      {/* Mapowanie przez skonfigurowanych dostawców (w Twoim przypadku Google) */}
      {Object.values(providers).map((provider) => (
        <div key={provider.name} className="mt-4">
          <button
            onClick={() => signIn(provider.id)}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Zaloguj się przez {provider.name}
          </button>
        </div>
      ))}
    </>
  );
}
