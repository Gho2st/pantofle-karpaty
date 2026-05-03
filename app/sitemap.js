export const revalidate = 0;
import prisma from "@/app/lib/prisma";

export default async function sitemap() {
  const baseUrl = "https://sklep-pantofle-karpaty.pl";

  // 1. Pobieramy wszystkie aktywne produkty
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { slug: true }, // Brak updatedAt w schemacie dla Product
  });

  // 2. Pobieramy wszystkie aktywne kategorie (wraz z informacją o rodzicu)
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: {
      slug: true,
      parent: {
        select: { slug: true },
      },
    },
  });

  // 3. Pobieramy wszystkie OPUBLIKOWANE wpisy na blogu
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    select: {
      slug: true,
      updatedAt: true, // Post ma updatedAt, więc możemy to wykorzystać!
    },
  });

  // 4. Mapujemy PRODUKTY na linki sitemapy
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/produkty/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 5. Mapujemy KATEGORIE na linki sitemapy
  const categoryUrls = categories.map((category) => {
    // Sprawdzamy, czy to kategoria główna, czy podkategoria (np. /kategorie/dla-kobiet/kapcie)
    const categoryPath = category.parent
      ? `/kategorie/${category.parent.slug}/${category.slug}`
      : `/kategorie/${category.slug}`;

    return {
      url: `${baseUrl}${categoryPath}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    };
  });

  // 6. Mapujemy WPISY NA BLOGU
  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // 7. Definiujemy najważniejsze linki STATYCZNE
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/kategorie`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/o-nas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/regulamin`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/polityka-prywatnosci`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/polityka-zwrotow`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 8. Zwracamy wszystko połączone w jedną sitemapę
  return [...staticUrls, ...categoryUrls, ...productUrls, ...postUrls];
}
