import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/app/lib/prisma";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // KLUCZOWE: Wymuś otwieranie w przeglądarce 
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        },
      },
      // DODAJ TO:
      checks: ["none"], // Wyłącza weryfikację stanu w WebView .
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Dostosuj logikę, aby obsługiwać email z Facebooka
      const email = user.email || profile.email;
      if (!email) {
        console.error("❌ Brak emaila w danych użytkownika");
        return false;
      }

      try {
        // 🔹 Krok 1: Sprawdzamy, czy użytkownik istnieje
        let dbUser = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!dbUser) {
          // 🔹 Krok 2: Jeśli nie, tworzymy go w naszej bazie (z domyślną rolą 'USER')
          await prisma.user.create({
            data: {
              email: email,
              name: user.name ?? profile.name ?? null,
              image: user.image ?? profile.picture?.data?.url ?? null, // Facebook zwraca obrazek w profile.picture.data.url
              role: "USER",
            },
          });
          console.log("✅ Utworzono nowego użytkownika:", email);
        } else {
          console.log("ℹ️ Użytkownik już istnieje:", email);
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
      console.log("ℹ️ Przekierowanie na stronę główną:", baseUrl);
      // Uwaga: Usuń hardcoded URL, jeśli nie jest potrzebny
      return baseUrl; // Zwraca np. http://localhost:3000/
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
