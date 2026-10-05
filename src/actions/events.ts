"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function revalidateEvents(eventId?: string) {
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/admin/events");
  if (eventId) {
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/admin/events/${eventId}`);
  }
}

export async function createSiteEvent(data: {
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number;
  image?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const title = data.title.trim();
  const description = data.description.trim();
  const location = data.location.trim();
  const date = new Date(data.date);
  const maxAttendees = Number(data.maxAttendees);

  if (!title || !description || !location) {
    throw new Error("제목, 내용, 장소를 입력해 주세요.");
  }
  if (Number.isNaN(date.getTime())) {
    throw new Error("일시를 확인해 주세요.");
  }
  if (!Number.isFinite(maxAttendees) || maxAttendees < 1) {
    throw new Error("정원은 1명 이상이어야 합니다.");
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      location,
      date,
      maxAttendees,
      image: data.image?.trim() || null,
      createdById: session.user.id,
    },
  });

  revalidateEvents(event.id);
  return { id: event.id };
}

export async function deleteSiteEvent(eventId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Not found");
  if (event.createdById !== session.user.id) throw new Error("Forbidden");

  await prisma.event.delete({ where: { id: eventId } });
  revalidateEvents(eventId);
  return { ok: true as const };
}
