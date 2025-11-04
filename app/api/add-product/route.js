import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

function validateSizes(sizes) {
  if (!sizes) return true; // sizes jest opcjonalne
  return true;
}

const s3Client = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const BUCKET_NAME = "pantofle-karpaty";

async function uploadFileToS3(fileBuffer, fileName, contentType) {
  const uniqueFileName = `${uuidv4()}-${fileName}`; // Unikalna nazwa pliku
  const params = {
    Bucket: BUCKET_NAME,
    Key: `products/${uniqueFileName}`, // Folder 'products' w buckecie
    Body: fileBuffer,
    ContentType: contentType || "application/octet-stream",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/products/${uniqueFileName}`;
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
    const slug = formData.get("slug") || generateSlug(name);
    const price = formData.get("price");
    const description = formData.get("description") || null;
    const description2 = formData.get("description2") || null;
    const additionalInfo = formData.get("additionalInfo") || null;
    const sizesJson = formData.get("sizes");
    const sizes = sizesJson ? JSON.parse(sizesJson) : null;
    const categoryId = formData.get("categoryId");
    const files = formData.getAll("files");

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Nazwa, cena i ID kategorii są wymagane" },
        { status: 400 }
      );
    }

    // === WALIDACJA SLUG ===
    const existingActiveProduct = await prisma.product.findFirst({
      where: {
        slug: slug,
        deletedAt: null, // tylko aktywne
      },
    });

    if (existingActiveProduct) {
      return NextResponse.json(
        { error: `Slug "${slug}" jest już używany przez aktywny produkt` },
        { status: 400 }
      );
    }

    // === RESZTA WALIDACJI ===
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Kategoria nie została znaleziona" },
        { status: 404 }
      );
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "Cena musi być dodatnią liczbą" },
        { status: 400 }
      );
    }

    validateSizes(sizes);

    // === UPLOAD ZDJĘĆ ===
    const uploadPromises = files.map(async (file) => {
      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        return await uploadFileToS3(buffer, file.name, file.type);
      }
      return null;
    });

    const imageUrls = (await Promise.all(uploadPromises)).filter((url) => url);

    // === TWORZENIE PRODUKTU ===
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        price: parsedPrice,
        description,
        description2,
        additionalInfo,
        sizes: sizes || null,
        images: imageUrls.length > 0 ? imageUrls : null,
        categoryId: parseInt(categoryId),
      },
    });

    return NextResponse.json({
      message: "Produkt dodany pomyślnie",
      product,
    });
  } catch (error) {
    console.error("Błąd podczas dodawania produktu:", error);
    return NextResponse.json(
      { error: error.message || "Błąd serwera podczas dodawania produktu" },
      { status: 500 }
    );
  }
}
