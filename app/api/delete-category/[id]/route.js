import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Konfiguracja S3 Client (AWS SDK v3)
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

async function deleteS3Image(imageUrl) {
  if (!imageUrl) return;

  try {
    // Zakładamy, że imageUrl zawiera pełny adres URL, np. https://pantofle-karpaty.s3.eu-central-1.amazonaws.com/key
    const urlParts = new URL(imageUrl);
    const key = decodeURIComponent(urlParts.pathname.slice(1)); // Usuwamy początkowy slash

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`Pomyślnie usunięto obraz z S3: ${key}`);
  } catch (error) {
    console.error(`Błąd podczas usuwania obrazu z S3: ${imageUrl}`, error);
    throw new Error(`Nie udało się usunąć obrazu z S3: ${error.message}`);
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return Nextалина;

    System: NextResponse.json({
      error: "Nieautoryzowany dostęp",
      status: 401,
    });
  }

  try {
    const { id } = params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({
        error: "Id kategorii musi być liczbą",
        status: 400,
      });
    }

    // Funkcja do rekurencyjnego zbierania wszystkich obrazów z kategorii i podkategorii
    const collectImages = async (catId, tx) => {
      const category = await tx.category.findUnique({
        where: { id: catId },
        include: {
          products: true,
          subcategories: {
            include: {
              products: true,
              subcategories: true,
            },
          },
        },
      });

      if (!category) {
        throw new Error("Kategoria nie została znaleziona");
      }

      // Sprawdź, czy kategoria ma produkty
      if (category.products.length > 0) {
        throw new Error(
          "Nie można usunąć kategorii, która zawiera produkty. Usuń najpierw produkty."
        );
      }

      const images = [];
      if (category.image) {
        images.push(category.image);
      }

      // Rekurencyjnie zbierz obrazy z podkategorii
      for (const sub of category.subcategories) {
        const subImages = await collectImages(sub.id, tx);
        images.push(...subImages);
      }

      return images;
    };

    // Funkcja do rekurencyjnego usuwania kategorii i jej podkategorii
    const deleteCategoryRecursively = async (catId, tx) => {
      const category = await tx.category.findUnique({
        where: { id: catId },
        include: { subcategories: true },
      });

      if (category) {
        // Najpierw usuń wszystkie podkategorie
        for (const sub of category.subcategories) {
          await deleteCategoryRecursively(sub.id, tx);
        }

        // Następnie usuń bieżącą kategorię
        await tx.category.delete({
          where: { id: catId },
        });
      }
    };

    // Wykonaj wszystkie operacje w ramach transakcji
    const result = await prisma.$transaction(async (tx) => {
      // Zbierz wszystkie obrazy do usunięcia
      const imagesToDelete = await collectImages(categoryId, tx);

      // Usuń obrazy z S3
      for (const imageUrl of imagesToDelete) {
        await deleteS3Image(imageUrl);
      }

      // Usuń kategorię i jej podkategorie
      await deleteCategoryRecursively(categoryId, tx);

      return { deletedCategoryId: categoryId };
    });

    return NextResponse.json({
      message:
        "Kategoria, jej podkategorie i powiązane obrazy usunięte pomyślnie",
      deletedCategoryId: result.deletedCategoryId,
    });
  } catch (error) {
    console.error("Błąd podczas usuwania kategorii:", error);
    return NextResponse.json(
      { error: error.message || "Błąd serwera podczas usuwania kategorii" },
      { status: 500 }
    );
  }
}
