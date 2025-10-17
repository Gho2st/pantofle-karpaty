import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({
      error: "Nieautoryzowany dostęp",
      status: 401,
    });
  }

  try {
    // Walidacja zmiennych środowiskowych
    if (!process.env.AWS_ID) {
      throw new Error("Zmienna AWS_ID nie jest zdefiniowana");
    }
    if (!process.env.AWS_SECRET) {
      throw new Error("Zmienna AWS_SECRET nie jest zdefiniowana");
    }
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new Error("Zmienna AWS_S3_BUCKET_NAME nie jest zdefiniowana");
    }
    if (!process.env.AWS_S3_REGION) {
      throw new Error("Zmienna AWS_S3_REGION nie jest zdefiniowana");
    }

    // Listowanie folderów w buckecie pantofle-karpaty
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delimiter: "/", // Grupuje obiekty w foldery
    });
    const response = await s3Client.send(listObjectsCommand);

    // Pobierz foldery (prefiksy)
    const folders = response.CommonPrefixes
      ? response.CommonPrefixes.map((prefix) => prefix.Prefix)
      : [];

    return NextResponse.json({
      success: true,
      message: "Foldery w buckecie pantofle-karpaty pobrane pomyślnie",
      folders,
      bucketName: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_S3_REGION,
    });
  } catch (error) {
    console.error("Błąd podczas listowania folderów S3:", {
      message: error.message,
      code: error.code || "UNKNOWN",
      stack: error.stack,
      awsId: process.env.AWS_ID ? "zdefiniowana" : "niezdefiniowana",
      awsSecret: process.env.AWS_SECRET ? "zdefiniowana" : "niezdefiniowana",
      bucketName: process.env.AWS_S3_BUCKET_NAME || "niezdefiniowana",
      region: process.env.AWS_S3_REGION || "niezdefiniowana",
    });
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code || "UNKNOWN",
        awsId: process.env.AWS_ID ? "zdefiniowana" : "niezdefiniowana",
        awsSecret: process.env.AWS_SECRET ? "zdefiniowana" : "niezdefiniowana",
        bucketName: process.env.AWS_S3_BUCKET_NAME || "niezdefiniowana",
        region: process.env.AWS_S3_REGION || "niezdefiniowana",
      },
      { status: 500 }
    );
  }
}
