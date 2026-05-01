import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const ALLOWED_HOST = "pantofle-karpaty.s3.eu-central-1.amazonaws.com";

/**
 * Pobiera zdjęcie z S3 po stronie serwera i zwraca je jako binary do klienta.
 * Używane przez ImageProcessor do konwersji istniejących zdjęć na WebP
 * — pozwala uniknąć problemów z CORS po stronie przeglądarki.
 *
 * GET /api/proxy-image?url=<encodeURIComponent(s3_url)>
 */
export async function GET(request) {
  // Tylko admin (to wewnętrzne narzędzie do edycji produktów)
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Nieautoryzowany dostęp" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Brak parametru url" },
        { status: 400 },
      );
    }

    // Bezpieczeństwo: pozwól tylko na nasze S3, żeby nie zrobić open proxy
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Nieprawidłowy URL" }, { status: 400 });
    }

    if (parsed.host !== ALLOWED_HOST) {
      return NextResponse.json({ error: "Niedozwolony host" }, { status: 403 });
    }

    const s3Response = await fetch(targetUrl);
    if (!s3Response.ok) {
      return NextResponse.json(
        { error: `Błąd pobierania z S3 (HTTP ${s3Response.status})` },
        { status: 502 },
      );
    }

    const buffer = await s3Response.arrayBuffer();
    const contentType =
      s3Response.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Błąd proxy-image:", error);
    return NextResponse.json(
      { error: error.message || "Błąd serwera" },
      { status: 500 },
    );
  }
}
