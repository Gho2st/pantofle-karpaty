import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Pomocnicza funkcja do konwersji daty
function parseDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date)) return null;
  return date;
}

// GET – pobieranie wszystkich kodów
export async function GET() {
  try {
    const codes = await prisma.discountCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Konwertuj Date → string dla JSON
    const formattedCodes = codes.map((code) => ({
      ...code,
      validFrom: code.validFrom
        ? code.validFrom.toISOString().split("T")[0]
        : null,
      validTo: code.validTo ? code.validTo.toISOString().split("T")[0] : null,
    }));

    return new Response(JSON.stringify(formattedCodes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/discounts error:", error);
    return new Response(
      JSON.stringify({ error: "Błąd serwera – nie można pobrać kodów" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST – dodawanie kodu
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Nieprawidłowy JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.code || !body.value) {
    return new Response(
      JSON.stringify({ error: "Kod i wartość są wymagane" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const code = await prisma.discountCode.create({
      data: {
        code: body.code.toUpperCase().trim(),
        type: body.type || "percentage",
        value: parseFloat(body.value),
        minOrderValue: body.minOrderValue
          ? parseFloat(body.minOrderValue)
          : null,
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        validFrom: parseDate(body.validFrom),
        validTo: parseDate(body.validTo),
        isActive: body.isActive !== false,
      },
    });

    return new Response(JSON.stringify(code), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/discounts error:", error);

    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({ error: "Kod rabatowy już istnieje" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Błąd serwera – nie można dodać kodu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
