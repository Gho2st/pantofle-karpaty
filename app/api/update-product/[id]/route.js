import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
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
    Key: `products/${uniqueFileName}`, // Store in 'products/' folder
    Body: fileBuffer,
    ContentType: contentType || "application/octet-stream",
    // Removed ACL: "public-read" to avoid AccessControlListNotSupported error
  };

  console.log(`Uploading file to S3: ${uniqueFileName}`);
  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  console.log(`Successfully uploaded file: ${uniqueFileName}`);

  return `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/products/${uniqueFileName}`;
}

async function deleteFileFromS3(imageUrl) {
  console.log(`Attempting to delete image from S3: ${imageUrl}`);
  const key = imageUrl.split(
    `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/`
  )[1];
  if (!key) {
    throw new Error(`Invalid S3 URL: ${imageUrl}`);
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  console.log(`S3 Delete params:`, params);
  const command = new DeleteObjectCommand(params);
  await s3Client.send(command);
  console.log(`Successfully deleted image: ${imageUrl}`);
}

function validateSizes(sizes) {
  if (!sizes) return true; // sizes jest opcjonalne
  if (!Array.isArray(sizes)) {
    throw new Error("Pole sizes musi być tablicą");
  }
  sizes.forEach((item) => {
    if (!item.size || typeof item.stock !== "number" || item.stock < 0) {
      throw new Error("Nieprawidłowy format rozmiaru lub stanu");
    }
  });
  return true;
}

function generateSlug(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Usuń znaki specjalne
    .replace(/\s+/g, "-") // Zamień spacje na myślniki
    .replace(/-+/g, "-"); // Usuń wielokrotne myślniki
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({
      error: "Nieautoryzowany dostęp",
      status: 401,
    });
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({
        error: "ID produktu musi być liczbą",
        status: 400,
      });
    }

    // Parse FormData
    const formData = await request.formData();
    const name = formData.get("name");
    const slug = formData.get("slug") || generateSlug(name); // Pobierz slug lub wygeneruj z name
    const price = formData.get("price");
    const description = formData.get("description") || null;
    const description2 = formData.get("description2") || null;
    const additionalInfo = formData.get("additionalInfo") || null;
    const sizes = formData.get("sizes")
      ? JSON.parse(formData.get("sizes"))
      : null;
    const categoryId = formData.get("categoryId");
    const imagesToRemove = formData.get("imagesToRemove")
      ? JSON.parse(formData.get("imagesToRemove"))
      : [];
    const imagesToAdd = formData.getAll("imagesToAdd");

    // Sprawdź, czy produkt istnieje
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true, sizes: true, categoryId: true },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Produkt nie został znaleziony" },
        { status: 404 }
      );
    }

    // Walidacja podstawowych pól
    if (!name || !price) {
      return NextResponse.json(
        { error: "Nazwa i cena produktu są wymagane" },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "Cena musi być dodatnią liczbą" },
        { status: 400 }
      );
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Kategoria nie została znaleziona" },
          { status: 404 }
        );
      }
    }

    validateSizes(sizes);

    // Obsługa zdjęć
    let updatedImages = product.images || [];

    // Usuwanie zdjęć z S3 i bazy danych
    if (imagesToRemove && imagesToRemove.length > 0) {
      for (const imageUrl of imagesToRemove) {
        try {
          await deleteFileFromS3(imageUrl);
        } catch (err) {
          console.error(`Nie udało się usunąć obrazu ${imageUrl} z S3:`, err);
          // Kontynuuj, nawet jeśli usunięcie z S3 się nie powiedzie (np. obraz już nie istnieje)
        }
      }
      updatedImages = updatedImages.filter(
        (url) => !imagesToRemove.includes(url)
      );
    }

    // Dodawanie nowych zdjęć do S3
    if (imagesToAdd && imagesToAdd.length > 0) {
      const newImageUrls = [];
      for (const file of imagesToAdd) {
        if (!(file instanceof File) || !file.type.startsWith("image/")) {
          continue; // Skip non-image files
        }
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          throw new Error(`Plik ${file.name} przekracza limit 5MB`);
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const imageUrl = await uploadFileToS3(buffer, file.name, file.type);
        newImageUrls.push(imageUrl);
      }
      updatedImages = [...updatedImages, ...newImageUrls];
    }

    // Aktualizacja produktu w bazie danych
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        slug, // Zapisz slug (wygenerowany lub podany)
        price: parsedPrice,
        description,
        description2,
        additionalInfo,
        sizes,
        images: updatedImages,
        categoryId: categoryId ? parseInt(categoryId) : product.categoryId,
      },
    });

    return NextResponse.json({
      message: "Produkt zaktualizowany pomyślnie",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji produktu:", error);
    return NextResponse.json(
      { error: error.message || "Błąd serwera podczas aktualizacji produktu" },
      { status: 500 }
    );
  }
}
