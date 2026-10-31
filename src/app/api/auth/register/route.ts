import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "이미 가입된 이메일입니다. 로그인해주세요." },
      { status: 409 },
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email: normalizedEmail, password: hashed },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
