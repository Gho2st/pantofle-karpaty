import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Definicja konfiguracji (authOptions), tym razem BEZ export const
const authOptions = {
  // 1. Dostawcy uwierzytelniania
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // 2. Strategia Sesji: Użycie JWT
  session: {
    strategy: "jwt",
  },

  // 3. Strona Logowania
  pages: {
    signIn: "/login",
  },

  // 4. Callbacks
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("Użytkownik zalogowany:", user.email);
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      // Ujawnienie roli w obiekcie sesji
      session.user.role = token.role;
      return session;
    },
  },
};

// Eksportujemy funkcje handlerów, używając konfiguracji authOptions
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
