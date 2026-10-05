import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const boards = await prisma.board.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(boards);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardSlug, title, content } = await request.json();
  const board = await prisma.board.findUnique({ where: { slug: boardSlug } });
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const post = await prisma.post.create({
    data: {
      boardId: board.id,
      authorId: session.user.id,
      title,
      content,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
