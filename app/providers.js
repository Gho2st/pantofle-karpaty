// app/providers.js
"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AuthProvider({ children }) {
  return (
    <SessionProvider>
      {children}
      {/* Jedyny kontener powiadomień w aplikacji — toast() działa na każdej stronie */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </SessionProvider>
  );
}
