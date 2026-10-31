import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebase";
import { adminHasRole, getSiteUser } from "@/lib/session-kind";

export async function GET() {
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: siteUser.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!adminHasRole(session, ["SUPER_ADMIN"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, title, body, link, fcmToken } = await request.json();

  const notification = await prisma.notification.create({
    data: { userId, title, body, link },
  });

  if (fcmToken) {
    await sendPushNotification(fcmToken, title, body, link);
  }

  return NextResponse.json(notification, { status: 201 });
}
