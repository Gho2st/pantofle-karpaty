import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/app/lib/prisma";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (!user.email) {
        console.error("❌ Brak emaila w danych użytkownika");
        return false;
      }

      try {
        // 🔹 Krok 1: Sprawdzamy, czy użytkownik istnieje
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          // 🔹 Krok 2: Jeśli nie, tworzymy go w naszej bazie (z domyślną rolą 'USER')
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
              role: "USER",
            },
          });
          console.log("✅ Utworzono nowego użytkownika:", user.email);
        } else {
          console.log("ℹ️ Użytkownik już istnieje:", user.email);
        }

        return true; // Kontynuuj logowanie
      } catch (err) {
        console.error("❌ Błąd podczas logowania/zapisu do DB:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (!token.email) return token;

      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
        select: {
          id: true,
          role: true,
          gender: true,
        },
      });

      if (dbUser) {
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.profileComplete = !!dbUser.gender;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.profileComplete = token.profileComplete;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔍 Callback redirect: url=", url, "baseUrl=", baseUrl);
      // 🔹 Zawsze przekieruj na stronę główną po udanym logowaniu
      console.log("ℹ️ Przekierowanie na stronę główną:", baseUrl);
      return baseUrl; // Zwraca np. http://localhost:3000/
    },
  },
};

const handler = NextAuth(authOptions);
const auth = NextAuth(authOptions);

export { handler as GET, handler as POST, auth };
