import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import { randomUUID } from "crypto";

export async function GET() {
  const events = await prisma.event.findMany({
    include: {
      _count: { select: { registrations: true } },
    },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await request.json();
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event._count.registrations >= event.maxAttendees) {
    return NextResponse.json({ error: "Event is full" }, { status: 400 });
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: {
      eventId_userId: { eventId, userId: session.user.id },
    },
  });

  if (existing) {
    const qrDataUrl = await QRCode.toDataURL(existing.qrCode);
    return NextResponse.json({ ...existing, qrDataUrl });
  }

  const qrCode = randomUUID();
  const registration = await prisma.eventRegistration.create({
    data: {
      eventId,
      userId: session.user.id,
      qrCode,
    },
  });

  const qrDataUrl = await QRCode.toDataURL(qrCode);
  return NextResponse.json({ ...registration, qrDataUrl }, { status: 201 });
}
