// app/admin/layout.js
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { AdminProvider } from "../context/adminContext";
import Admin from "./page";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Ochrona trasy
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <AdminProvider>
      <Admin session={session} />
    </AdminProvider>
  );
}
