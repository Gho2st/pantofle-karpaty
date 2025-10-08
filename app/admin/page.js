"use client";
import { useSession } from "next-auth/react";

export default function Admin() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Weryfikacja...</div>;
  }

  // Weryfikacja Roli:
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    // Przekierowanie nieautoryzowanych
    router.push("/login");
    return null;
  }

  // Jeśli jest ADMIN, renderuj panel
  return (
    <>
      ADMIN
      <div>
        <h2>Kategorie</h2>
        <div>
          <h3>Dla Kobiet</h3>
          <h3>Dla mezczyzn</h3>
          <h3>Dla Dzieci</h3>
        </div>
      </div>
    </>
  );
}
