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
    Key: `products/${uniqueFileName}`,
    Body: fileBuffer,
    ContentType: contentType || "application/octet-stream",
  };

  console.log(`Przesyłanie pliku do S3: ${uniqueFileName}`);
  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  console.log(`Pomyślnie przesłano plik: ${uniqueFileName}`);
  return `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/products/${uniqueFileName}`;
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
  const command = new DeleteObjectCommand(params);
  await s3Client.send(command);
  console.log(`Pomyślnie usunięto obraz: ${imageUrl}`);
}

function validateSizes(sizes) {
  if (!sizes) return true;
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
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
// ... reszta importów bez zmian

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  const awaitedParams = await params;
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nieautoryzowany dostęp" },
      { status: 401 }
    );
  }

  try {
    const { id } = awaitedParams;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID produktu musi być liczbą" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const slug = formData.get("slug") || generateSlug(name);
    const price = formData.get("price");
    const description = formData.get("description") || null;
    const description2 = formData.get("description2") || null;
    const additionalInfo = formData.get("additionalInfo") || null;
    let sizes = formData.get("sizes");
    const categoryId = formData.get("categoryId");
    let imagesToRemove = formData.get("imagesToRemove");
    const imagesToAdd = formData.getAll("imagesToAdd");
    const promoPrice = formData.get("promoPrice");
    const promoStartDate = formData.get("promoStartDate") || null;
    const promoEndDate = formData.get("promoEndDate") || null;
    const sortOrder = formData.get("sortOrder");

    // === WALIDACJA SLUG (KLUCZOWA ZMIANA!) ===
    const existingActiveProduct = await prisma.product.findFirst({
      where: {
        slug: slug,
        deletedAt: null,
        id: { not: productId }, // wyklucz bieżący produkt
      },
    });

    if (existingActiveProduct) {
      return NextResponse.json(
        { error: `Slug "${slug}" jest już używany przez inny aktywny produkt` },
        { status: 400 }
      );
    }

    // === RESZTA WALIDACJI ===
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

    // === WALIDACJA PROMO PRICE ===
    let parsedPromoPrice = null;
    if (promoPrice !== null && promoPrice !== "") {
      parsedPromoPrice = parseFloat(promoPrice);
      if (isNaN(parsedPromoPrice) || parsedPromoPrice <= 0) {
        return NextResponse.json(
          { error: "Cena promocyjna musi być dodatnią liczbą" },
          { status: 400 }
        );
      }
      if (parsedPromoPrice >= parsedPrice) {
        return NextResponse.json(
          { error: "Cena promocyjna musi być niższa niż regularna" },
          { status: 400 }
        );
      }
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

    try {
      sizes = sizes ? JSON.parse(sizes) : null;
    } catch (e) {
      return NextResponse.json(
        { error: "Nieprawidłowy format rozmiarów" },
        { status: 400 }
      );
    }
    validateSizes(sizes);

    try {
      imagesToRemove = imagesToRemove ? JSON.parse(imagesToRemove) : [];
    } catch (e) {
      return NextResponse.json(
        { error: "Nieprawidłowy format imagesToRemove" },
        { status: 400 }
      );
    }

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

    // === USUWANIE ZDJĘĆ ===
    let updatedImages = product.images || [];
    if (imagesToRemove.length > 0) {
      for (const imageUrl of imagesToRemove) {
        try {
          await deleteFileFromS3(imageUrl);
        } catch (err) {
          console.error(`Nie udało się usunąć obrazu ${imageUrl}:`, err);
        }
      }
      updatedImages = updatedImages.filter(
        (url) => !imagesToRemove.includes(url)
      );
    }

    // === DODAWANIE ZDJĘĆ ===
    if (imagesToAdd && imagesToAdd.length > 0) {
      const newImageUrls = [];
      for (const file of imagesToAdd) {
        if (!(file instanceof File) || !file.type.startsWith("image/")) {
          console.warn(`Pomijanie pliku niebędącego obrazem: ${file.name}`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Plik ${file.name} przekracza limit 5MB`);
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const imageUrl = await uploadFileToS3(buffer, file.name, file.type);
        newImageUrls.push(imageUrl);
      }
      updatedImages = [...updatedImages, ...newImageUrls];
    }

    // === AKTUALIZACJA PRODUKTU ===
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        price: parsedPrice,
        promoPrice: parsedPromoPrice,
        promoStartDate: promoStartDate ? new Date(promoStartDate) : null,
        promoEndDate: promoEndDate ? new Date(promoEndDate) : null,
        description,
        description2,
        additionalInfo,
        sizes,
        images: updatedImages,
        categoryId: categoryId ? parseInt(categoryId) : product.categoryId,
        sortOrder: sortOrder ? parseInt(sortOrder) : null,
      },
    });

    return NextResponse.json({
      message: "Produkt zaktualizowany pomyślnie",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji produktu:", error.stack);
    return NextResponse.json(
      { error: error.message || "Błąd serwera podczas aktualizacji produktu" },
      { status: 500 }
    );
  }
}
