import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminHasRole } from "@/lib/session-kind";

export async function POST(request: Request) {
  const session = await auth();
  if (!adminHasRole(session, ["SUPER_ADMIN", "EVENT_ADMIN"])) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { qrCode } = await request.json();
  const registration = await prisma.eventRegistration.findUnique({
    where: { qrCode },
    include: {
      event: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!registration) {
    return NextResponse.json({ error: "Invalid QR code" }, { status: 404 });
  }

  if (registration.checkedIn) {
    return NextResponse.json({ error: "Already checked in", registration }, { status: 400 });
  }

  const updated = await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { checkedIn: true },
    include: {
      event: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(updated);
}
