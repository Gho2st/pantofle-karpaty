// app/api/blog/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// GET — lista wszystkich wpisów (tylko admin)
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    slug,
    excerpt,
    content,
    coverImage,
    status,
    publishedAt,
    ctaTitle,
    ctaDescription,
    ctaPrimaryLabel,
    ctaPrimaryUrl,
    ctaSecondaryLabel,
    ctaSecondaryUrl,
  } = body;

  if (!title || !slug || !content) {
    return NextResponse.json(
      { error: "Brakuje wymaganych pól" },
      { status: 400 },
    );
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverImage: coverImage || null,
      status: status || "draft",
      publishedAt:
        status === "published"
          ? publishedAt
            ? new Date(publishedAt)
            : new Date()
          : null,
      ctaTitle: ctaTitle || null,
      ctaDescription: ctaDescription || null,
      ctaPrimaryLabel: ctaPrimaryLabel || null,
      ctaPrimaryUrl: ctaPrimaryUrl || null,
      ctaSecondaryLabel: ctaSecondaryLabel || null,
      ctaSecondaryUrl: ctaSecondaryUrl || null,
    },
  });
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);

  return NextResponse.json(post, { status: 201 });
}
