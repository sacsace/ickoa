import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const region = searchParams.get("region");

  const news = await prisma.news.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
      ...(region ? { region } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(news);
}

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const news = await prisma.news.create({ data: body });
  return NextResponse.json(news, { status: 201 });
}
