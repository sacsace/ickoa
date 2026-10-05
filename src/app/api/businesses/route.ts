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

export async function POST() {
  return NextResponse.json(
    { error: "관리자 화면에서 등록해 주세요." },
    { status: 405 },
  );
}
