export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/koszyk/",
        "/zamowienie/",
        "/login/",
        "/admin/",
        "/moje-konto/",
        "/api/",
      ],
    },
    sitemap: "https://sklep-pantofle-karpaty.pl/sitemap.xml",
  };
}
