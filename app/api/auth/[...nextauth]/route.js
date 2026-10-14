import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/app/lib/prisma";

const ROLE_REFRESH_MS = 5 * 60 * 1000;

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
        },
      },
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

      // Dane z bazy odświeżamy przy logowaniu i potem co 5 minut, a nie przy
      // każdym żądaniu — zmiana roli (np. odebranie admina) działa najpóźniej po 5 min.
      const isFresh =
        !user &&
        token.id &&
        Date.now() - (token.refreshedAt || 0) < ROLE_REFRESH_MS;
      if (isFresh) return token;

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
        token.refreshedAt = Date.now();
      } else {
        // Użytkownik usunięty z bazy — nie zostawiamy mu starej roli w tokenie
        token.id = null;
        token.role = null;
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
      // Jeśli URL jest z tej samej domeny – pozwól na niego wrócić
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // W przeciwnym razie przekieruj na stronę po logowaniu
      return baseUrl + "/profil"; // albo "/profile", albo "/"
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
