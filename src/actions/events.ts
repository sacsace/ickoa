"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveMapsUrlCoords } from "@/lib/google-maps-url";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";
import {
  firstImageSrcFromHtml,
  plainTextFromHtml,
  sanitizePostHtml,
} from "@/lib/sanitize-html";

function normalizeMapsUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function revalidateEvents(eventId?: string) {
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/admin/events");
  if (eventId) {
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/admin/events/${eventId}`);
  }
}

type EventPayload = {
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number;
  image?: string;
  mapsUrl?: string;
};

async function prepareEventData(data: EventPayload) {
  const title = data.title.trim();
  const description = sanitizePostHtml(data.description.trim());
  const location = data.location.trim();
  const date = new Date(data.date);
  const maxAttendees = Number(data.maxAttendees);
  const mapsUrl = normalizeMapsUrl(data.mapsUrl);

  if (!title || !plainTextFromHtml(description) || !location) {
    throw new Error("제목, 내용, 장소를 입력해 주세요.");
  }
  if (Number.isNaN(date.getTime())) {
    throw new Error("일시를 확인해 주세요.");
  }
  if (!Number.isFinite(maxAttendees) || maxAttendees < 1) {
    throw new Error("정원은 1명 이상이어야 합니다.");
  }

  const coords = mapsUrl ? await resolveMapsUrlCoords(mapsUrl) : null;
  const image =
    data.image?.trim() || firstImageSrcFromHtml(description) || null;

  return {
    title,
    description,
    location,
    date,
    maxAttendees,
    image,
    mapsUrl,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  };
}

export async function createSiteEvent(data: EventPayload) {
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) throw new Error("Unauthorized");

  const prepared = await prepareEventData(data);

  const event = await prisma.event.create({
    data: {
      ...prepared,
      createdById: siteUser.id,
    },
  });

  revalidateEvents(event.id);
  return { id: event.id };
}

export async function updateSiteEvent(eventId: string, data: EventPayload) {
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) throw new Error("Unauthorized");

  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) throw new Error("Not found");
  if (!canManageSiteResource(siteUser, existing.createdById)) {
    throw new Error("Forbidden");
  }

  const prepared = await prepareEventData(data);

  await prisma.event.update({
    where: { id: eventId },
    data: prepared,
  });

  revalidateEvents(eventId);
  revalidatePath(`/events/${eventId}/edit`);
  return { id: eventId };
}

export async function deleteSiteEvent(eventId: string) {
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) throw new Error("Unauthorized");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Not found");
  if (!canManageSiteResource(siteUser, event.createdById)) {
    throw new Error("Forbidden");
  }

  await prisma.event.delete({ where: { id: eventId } });
  revalidateEvents(eventId);
  return { ok: true as const };
}
