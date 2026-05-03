// app/api/blog/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// GET — pojedynczy wpis
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!post)
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  return NextResponse.json(post);
}

// PUT — edytuj wpis
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, excerpt, content, coverImage, status, publishedAt } =
    body;

  const post = await prisma.post.update({
    where: { id: parseInt(params.id) },
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverImage: coverImage || null,
      status,
      publishedAt:
        status === "published"
          ? publishedAt
            ? new Date(publishedAt)
            : new Date()
          : null,
      updatedAt: new Date(),
    },
  });
  revalidatePath("/blog"); // ← lista
  revalidatePath(`/blog/${post.slug}`); // ← strona posta
  return NextResponse.json(post);
}

// DELETE — usuń wpis
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(params.id) },
    select: { slug: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
  }

  const { slug } = post; // ← zapisz slug przed usunięciem

  await prisma.post.delete({
    where: { id: parseInt(params.id) },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`); // ← używaj slug, nie post.slug

  return NextResponse.json({ success: true });
}
