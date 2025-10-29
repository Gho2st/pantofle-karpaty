import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
    const urlParts = new URL(imageUrl);
    const key = decodeURIComponent(urlParts.pathname.slice(1));

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`Usunięto z S3: ${key}`);
  } catch (error) {
    console.error(`Błąd S3: ${imageUrl}`, error);
    throw new Error(`Nie udało się usunąć obrazu z S3: ${error.message}`);
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nieautoryzowany dostęp" },
      { status: 401 }
    );
  }

  try {
    const { id } = params;
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "ID kategorii musi być liczbą" },
        { status: 400 }
      );
    }

    // 1. Zbierz wszystkie obrazy (z kategorii i podkategorii)
    const collectImages = async (catId, tx) => {
      const category = await tx.category.findUnique({
        where: { id: catId },
        include: {
          products: { where: { deletedAt: null } }, // tylko aktywne produkty
          subcategories: {
            include: {
              products: { where: { deletedAt: null } },
              subcategories: true,
            },
          },
        },
      });

      if (!category) throw new Error("Kategoria nie znaleziona");

      // Blokada: jeśli są aktywne produkty → nie usuwaj
      if (category.products.length > 0) {
        throw new Error(
          "Nie można usunąć kategorii z aktywnymi produktami. Najpierw usuń lub przenieś produkty."
        );
      }

      const images = [];
      if (category.image) images.push(category.image);

      for (const sub of category.subcategories) {
        const subImages = await collectImages(sub.id, tx);
        images.push(...subImages);
      }

      return images;
    };

    // 2. Soft delete rekurencyjnie
    const softDeleteCategoryRecursively = async (catId, tx) => {
      const category = await tx.category.findUnique({
        where: { id: catId },
        include: { subcategories: true },
      });

      if (!category) return;

      // Najpierw podkategorie
      for (const sub of category.subcategories) {
        await softDeleteCategoryRecursively(sub.id, tx);
      }

      // Potem bieżąca kategoria
      await tx.category.update({
        where: { id: catId },
        data: { deletedAt: new Date() },
      });
    };

    // 3. Transakcja: usuń obrazy + soft delete
    const result = await prisma.$transaction(async (tx) => {
      const imagesToDelete = await collectImages(categoryId, tx);

      // Usuń obrazy z S3
      await Promise.all(imagesToDelete.map(deleteS3Image));

      // Soft delete kategorii i podkategorii
      await softDeleteCategoryRecursively(categoryId, tx);

      return { deletedCategoryId: categoryId };
    });

    return NextResponse.json({
      message: "Kategoria i podkategorie zostały usunięte (soft delete)",
      deletedCategoryId: result.deletedCategoryId,
    });
  } catch (error) {
    console.error("Błąd podczas usuwania kategorii:", error);
    return NextResponse.json(
      { error: error.message || "Błąd serwera" },
      { status: 500 }
    );
  }
}
