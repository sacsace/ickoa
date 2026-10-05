import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "ickoa_vid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function normalizePath(path: unknown) {
  if (typeof path !== "string" || !path.startsWith("/")) return "/";
  return path.split("?")[0].slice(0, 500);
}

function normalizeReferrer(referrer: unknown) {
  if (typeof referrer !== "string" || !referrer.trim()) return null;
  return referrer.trim().slice(0, 500);
}

export async function POST(request: Request) {
  let body: { path?: string; referrer?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = normalizePath(body.path);
  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const cookieStore = await cookies();
  let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
  const isNewVisitor = !visitorId;

  if (!visitorId) {
    visitorId = crypto.randomUUID();
  }

  await prisma.pageView.create({
    data: {
      visitorId,
      path,
      referrer: normalizeReferrer(body.referrer),
    },
  });

  const response = NextResponse.json({ ok: true });
  if (isNewVisitor) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return response;
}
