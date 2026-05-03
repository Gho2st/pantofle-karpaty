// app/api/blog/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";

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

// POST — utwórz nowy wpis
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, excerpt, content, coverImage, status, publishedAt } =
    body;

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
    },
  });
  revalidatePath("/blog");

  return NextResponse.json(post, { status: 201 });
}
