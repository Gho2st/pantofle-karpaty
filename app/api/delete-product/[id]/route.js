import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const BUCKET_NAME = "pantofle-karpaty";

async function deleteFileFromS3(url) {
  try {
    // Wyodrębnij klucz z URL-a
    const key = url.split(
      `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/`
    )[1];
    if (!key) {
      throw new Error(`Nieprawidłowy URL S3: ${url}`);
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    console.log(`Usunięto plik z S3: ${key}`);
  } catch (error) {
    console.error(`Błąd podczas usuwania pliku z S3 (${url}):`, error);
    // Nie przerywamy usuwania produktu, tylko logujemy błąd
  }
}

export async function DELETE(request, { params }) {
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
        error: "Id produktu musi być liczbą",
        status: 400,
      });
    }

    // Pobierz produkt z polem images
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, images: true },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Produkt nie został znaleziony" },
        { status: 404 }
      );
    }

    // Usuń zdjęcia z S3, jeśli istnieją
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((url) => deleteFileFromS3(url));
      await Promise.all(deletePromises);
    }

    // Usuń produkt z bazy danych
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      message: "Produkt i powiązane zdjęcia usunięte pomyślnie",
      deletedProductId: productId,
    });
  } catch (error) {
    console.error("Błąd podczas usuwania produktu:", error);
    return NextResponse.json(
      { error: "Błąd serwera podczas usuwania produktu" },
      { status: 500 }
    );
  }
}
