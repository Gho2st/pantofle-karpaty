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
  const key = url.split(
    `https://${BUCKET_NAME}.s3.eu-central-1.amazonaws.com/`
  )[1];
  if (!key) {
    throw new Error(`Nieprawidłowy URL S3: ${url}`);
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
  console.log(`Usunięto z S3: ${key}`);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nieautoryzowany dostęp" },
      { status: 401 }
    );
  }

  const { id } = params;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ error: "ID musi być liczbą" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, images: true, deletedAt: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produkt nie znaleziony" },
        { status: 404 }
      );
    }

    if (product.deletedAt) {
      return NextResponse.json({ message: "Produkt już usunięty" });
    }

    if (product.images && product.images.length > 0) {
      console.log(`Usuwanie ${product.images.length} zdjęć z S3...`);
      await Promise.all(
        product.images.map((url) =>
          deleteFileFromS3(url).catch((err) => {
            throw err; // Przerwij, jeśli choć jedno się nie uda
          })
        )
      );
    }

    await prisma.$transaction(async (tx) => {
      // Usuń z koszyków
      await tx.cart.deleteMany({
        where: { productId },
      });

      // Soft delete produktu
      await tx.product.update({
        where: { id: productId },
        data: { deletedAt: new Date() },
      });
    });

    return NextResponse.json({
      message: "Produkt usunięty: zdjęcia z S3 + koszyki + soft delete",
      deletedProductId: productId,
    });
  } catch (error) {
    console.error("Błąd podczas usuwania produktu:", error);

    return NextResponse.json(
      {
        error: "Nie udało się usunąć produktu. Operacja przerwana.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
