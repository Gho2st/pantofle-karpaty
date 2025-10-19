import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const BUCKET_NAME = "pantofle-karpaty";

async function uploadFileToS3(fileBuffer, fileName, contentType) {
  const uniqueFileName = `${uuidv4()}-${fileName}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: `categories/${uniqueFileName}`,
    Body: fileBuffer,
    ContentType: contentType || "application/octet-stream",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/categories/${uniqueFileName}`;
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nieautoryzowany dostęp" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description") || null;
    const parentId = formData.get("parentId");
    const slug = formData.get("slug") || null;
    const imageFile = formData.get("image");

    if (!name) {
      return NextResponse.json(
        { error: "Nazwa kategorii jest wymagana" },
        { status: 400 }
      );
    }

    // Sprawdzanie, czy parentId wskazuje na podkategorię
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parseInt(parentId) },
        select: { parentId: true },
      });

      if (parentCategory && parentCategory.parentId !== null) {
        return NextResponse.json(
          { error: "Nie można dodawać podkategorii do podkategorii" },
          { status: 400 }
        );
      }
    }

    // Generowanie slugu, jeśli nie podano
    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, "-");

    // Upload zdjęcia do S3, jeśli podano
    let imageUrl = null;
    if (imageFile instanceof File) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = await uploadFileToS3(buffer, imageFile.name, imageFile.type);
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        parentId: parentId ? parseInt(parentId) : null,
        slug: generatedSlug,
        image: imageUrl,
      },
    });

    return NextResponse.json({
      message: "Kategoria utworzona pomyślnie",
      category,
    });
  } catch (error) {
    console.error("Błąd podczas tworzenia kategorii:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas tworzenia kategorii" },
      { status: 500 }
    );
  }
}
