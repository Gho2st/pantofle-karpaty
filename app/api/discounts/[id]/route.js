import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function PUT(request, { params }) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Nieprawidłowy JSON" }), {
      status: 400,
    });
  }

  try {
    const code = await prisma.discountCode.update({
      where: { id: parseInt(params.id) },
      data: {
        code: body.code.toUpperCase().trim(),
        type: body.type || "percentage",
        value: parseFloat(body.value),
        minOrderValue: body.minOrderValue
          ? parseFloat(body.minOrderValue)
          : null,
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validTo: body.validTo ? new Date(body.validTo) : null,
        isActive: body.isActive !== false,
      },
    });

    return new Response(JSON.stringify(code), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PUT /api/discounts error:", error);
    if (error.code === "P2002") {
      return new Response(JSON.stringify({ error: "Kod już istnieje" }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ error: "Błąd aktualizacji" }), {
      status: 500,
    });
  }
}

export async function DELETE(request, { params }) {
  await prisma.discountCode.delete({
    where: { id: parseInt(params.id) },
  });
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
