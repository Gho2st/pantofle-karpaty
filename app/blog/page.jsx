// app/(app)/blog/page.jsx
import Link from "next/link";
import Image from "next/image";
import { PrismaClient } from "@prisma/client";
import BlogProducts from "./blogProducts";

const prisma = new PrismaClient();

export const metadata = {
  title: "Blog o obuwiu skórzanym | Pantofle Karpaty",
  description:
    "Porady dotyczące obuwia skórzanego, pielęgnacji kapci i regionalnego rzemiosła z Karpat.",
  alternates: { canonical: "/blog" },
};

async function getPosts() {
  return prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });
}

async function getRandomProducts() {
  const count = await prisma.product.count({ where: { deletedAt: null } });
  const skip = Math.max(0, Math.floor(Math.random() * Math.max(1, count - 4)));
  return prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      promoPrice: true,
      promoStartDate: true,
      promoEndDate: true,
      lowestPrice: true,
      images: true,
    },
    skip,
    take: 4,
  });
}

export default async function BlogPage() {
  const [posts, products] = await Promise.all([
    getPosts(),
    getRandomProducts(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
      {/* Nagłówek */}
      <div className="mb-14">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">
          Pantofle Karpaty
        </p>
        <h1 className="text-4xl lg:text-5xl font-light text-gray-900">
          Blog o obuwiu
        </h1>
        <p className="mt-4 text-base text-gray-500 max-w-xl leading-relaxed">
          Porady, inspiracje i wiedza o naturalnych materiałach, pielęgnacji
          kapci i góralskim rzemiośle.
        </p>
      </div>

      {/* Wpisy */}
      {posts.length === 0 ? (
        <p className="text-gray-400 text-sm">Brak opublikowanych wpisów.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col"
            >
              <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-5 relative">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                    Brak zdjęcia
                  </div>
                )}
              </div>

              {post.publishedAt && (
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                  {new Date(post.publishedAt).toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              <h2 className="text-base font-medium text-gray-900 group-hover:text-red-700 transition-colors mb-2 leading-snug">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                  {post.excerpt}
                </p>
              )}

              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-700 group-hover:text-red-800 transition-colors">
                Czytaj dalej
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Produkty — client component z CollectionTitle */}
      <BlogProducts products={products} />
    </div>
  );
}
