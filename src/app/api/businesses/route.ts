import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const region = searchParams.get("region");
  const q = searchParams.get("q");

  const businesses = await prisma.business.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(region ? { region } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { address: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(businesses);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const business = await prisma.business.create({
    data: { ...body, ownerId: session.user.id },
  });
  return NextResponse.json(business, { status: 201 });
}
