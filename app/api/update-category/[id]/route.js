import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const BUCKET_NAME = "pantofle-karpaty";

const s3Client = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

async function uploadFileToS3(fileBuffer, fileName, contentType) {
  const uniqueFileName = `${uuidv4()}-${fileName}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: `categories/${uniqueFileName}`,
    Body: fileBuffer,
    ContentType: contentType || "application/octet-stream",
  };

  console.log(`Przesyłanie pliku do S3: ${uniqueFileName}`);
  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log(`Pomyślnie przesłano plik: ${uniqueFileName}`);
  } catch (err) {
    console.error(`Nie udało się przesłać pliku ${uniqueFileName} do S3:`, err);
    throw new Error(`Nie udało się przesłać pliku do S3: ${err.message}`);
  }

  return `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/categories/${uniqueFileName}`;
}

async function deleteFileFromS3(imageUrl) {
  console.log(`Próba usunięcia obrazu z S3: ${imageUrl}`);
  const key = imageUrl.split(
    `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/`
  )[1];
  if (!key) {
    throw new Error(`Nieprawidłowy URL S3: ${imageUrl}`);
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  console.log(`Parametry usuwania S3:`, params);
  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    console.log(`Pomyślnie usunięto obraz: ${imageUrl}`);
  } catch (err) {
    console.error(`Nie udało się usunąć obrazu ${imageUrl} z S3:`, err);
    // Kontynuuj, nawet jeśli usunięcie nie powiedzie się (np. obraz nie istnieje)
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nieautoryzowany dostęp" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "ID kategorii musi być liczbą" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description") || null;
    const slug = formData.get("slug") || null;
    const imageFile = formData.get("image");
    const imageToRemove = formData.get("imageToRemove") || null;

    if (!name) {
      return NextResponse.json(
        { error: "Nazwa kategorii jest wymagana" },
        { status: 400 }
      );
    }

    // Sprawdź, czy kategoria istnieje
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { image: true },
    });
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategoria nie została znaleziona" },
        { status: 404 }
      );
    }

    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, "-");
    let imageUrl = existingCategory.image;

    // Usuwanie istniejącego zdjęcia, jeśli podano imageToRemove
    if (imageToRemove && imageUrl) {
      await deleteFileFromS3(imageUrl);
      imageUrl = null; // Usuń zdjęcie z bazy danych
    }

    // Dodawanie nowego zdjęcia, jeśli przesłano plik
    if (imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > 5 * 1024 * 1024) {
        // Limit 5MB
        throw new Error(`Plik ${imageFile.name} przekracza limit 5MB`);
      }
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = await uploadFileToS3(buffer, imageFile.name, imageFile.type);
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        description,
        slug: generatedSlug,
        image: imageUrl, // Może być null, jeśli zdjęcie usunięto i nie dodano nowego
      },
    });

    return NextResponse.json({
      message: "Kategoria zaktualizowana pomyślnie",
      category,
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji kategorii:", error);
    return NextResponse.json(
      { error: error.message || "Błąd serwera podczas aktualizacji kategorii" },
      { status: 500 }
    );
  }
}
