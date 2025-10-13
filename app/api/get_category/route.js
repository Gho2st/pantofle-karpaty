import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { auth } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await auth();

  console.log(session);
}
