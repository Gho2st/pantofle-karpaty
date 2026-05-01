/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://sklep-pantofle-karpaty.pl",
  generateRobotsTxt: true, // Automatycznie wygeneruje też plik robots.txt!

  // Tu wykluczamy strony, których Google ma nie widzieć:
  exclude: ["/koszyk", "/zamowienie", "/admin", "/moje-konto"],

  // Ustawienia dla pliku robots.txt
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/koszyk", "/zamowienie", "/admin", "/moje-konto"],
      },
    ],
  },
};
