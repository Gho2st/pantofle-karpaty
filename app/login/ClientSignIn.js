"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

const GoogleIcon = () => (
  <svg
    className="w-5 h-5 mr-3"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* ... (kod SVG bez zmian) ... */}
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.119-11.383-7.376l-6.571 4.819C9.656 39.663 16.318 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.712 34.621 44 28.099 44 20c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

export default function ClientSignIn({ providers }) {
  // Stan, aby pokazać przycisk tylko wtedy, gdy nie przekierowujemy
  const [showLoginButton, setShowLoginButton] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const currentUrl = window.location.href;

    // Detekcja iOS (iPhone, iPad, iPod)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    // Detekcja Messengera
    const isInMessenger = /fbav|fb_iab|messenger/i.test(userAgent);

    if (isIOS && isInMessenger) {
      // ✅ Jesteśmy w Messengerze na iOS. Próbujemy uciec do Safari.
      // Nie pokazujemy przycisku, bo strona zaraz zniknie.
      setShowLoginButton(false);
      window.location.href = `x-safari-${currentUrl}`;
      return; // Kończymy działanie skryptu
    }

    // ⛔ Jeśli nie jesteśmy w Messengerze na iOS (np. Android, PC, lub już w Safari),
    // po prostu pokaż normalny przycisk logowania.
    setShowLoginButton(true);
  }, []); // Uruchom tylko raz przy załadowaniu komponentu

  // Nie renderuj niczego, dopóki nie skończymy sprawdzania
  // lub jeśli nie ma dostawcy Google.
  if (!showLoginButton || !providers?.google) {
    // Można tu wstawić spinner ładowania, jeśli chcemy
    return null;
  }

  // Ten kod renderuje się tylko wtedy, gdy showLoginButton === true
  return (
    <div className="space-y-4">
      <button
        onClick={() => signIn("google", { callbackUrl: "/", redirect: true })}
        className="w-full flex items-center justify-center px-4 py-2.5 text-base font-medium rounded-lg shadow-sm transition-all bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
      >
        <GoogleIcon />
        Zaloguj się przez Google
      </button>
    </div>
  );
}
