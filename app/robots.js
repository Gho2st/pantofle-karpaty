import { SITE_URL } from "@/app/lib/site";

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
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
