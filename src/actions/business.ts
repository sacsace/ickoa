"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveMapsUrlCoords } from "@/lib/google-maps-url";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";

function normalizeWebsite(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^https?:\/\//, "");
}

function normalizeMapsUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

type BusinessPayload = {
  name: string;
  nameEn?: string;
  category: string;
  products?: string;
  region?: string;
  address: string;
  website?: string;
  parentCompany?: string;
  ceoName?: string;
  ceoTitle?: string;
  contactName?: string;
  contactTitle?: string;
  contactPhone?: string;
  contactEmail?: string;
  mapsUrl: string;
  description?: string;
  hideParentCompany?: boolean;
  hideCeo?: boolean;
  hideContactPerson?: boolean;
  hideContactPhone?: boolean;
  hideContactEmail?: boolean;
  hideWebsite?: boolean;
  hideAddress?: boolean;
  hideMapsUrl?: boolean;
};

async function prepareOwnedBusinessData(data: BusinessPayload) {
  const name = data.name.trim();
  const category = data.category.trim();
  const address = data.address.trim();
  const mapsUrl = normalizeMapsUrl(data.mapsUrl);
  const region = data.region?.trim() || "Chennai";
  const contactPhone = data.contactPhone?.trim() || null;
  const contactEmail = data.contactEmail?.trim() || null;

  if (!name || !category || !address || !mapsUrl) {
    throw new Error("한글 법인명, 업태, 주소, 구글맵 링크는 필수입니다.");
  }
  if (!contactPhone && !contactEmail) {
    throw new Error("실무자 연락처 또는 이메일을 입력해 주세요.");
  }

  const coords = await resolveMapsUrlCoords(mapsUrl);

  return {
    name,
    nameEn: data.nameEn?.trim() || null,
    category,
    products: data.products?.trim() || null,
    region,
    address,
    parentCompany: data.parentCompany?.trim() || null,
    ceoName: data.ceoName?.trim() || null,
    ceoTitle: data.ceoTitle?.trim() || null,
    contactName: data.contactName?.trim() || null,
    contactTitle: data.contactTitle?.trim() || null,
    contactPhone,
    contactEmail,
    phone: contactPhone,
    website: normalizeWebsite(data.website),
    mapsUrl,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    description: data.description?.trim() || data.products?.trim() || null,
    hideParentCompany: !!data.hideParentCompany,
    hideCeo: !!data.hideCeo,
    hideContactPerson: !!data.hideContactPerson,
    hideContactPhone: !!data.hideContactPhone,
    hideContactEmail: !!data.hideContactEmail,
    hideWebsite: !!data.hideWebsite,
    hideAddress: !!data.hideAddress,
    hideMapsUrl: !!data.hideMapsUrl,
  };
}

async function requireBusinessOwner(businessId: string) {
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) {
    throw new Error("로그인이 필요합니다.");
  }
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new Error("기업을 찾을 수 없습니다.");
  if (!canManageSiteResource(siteUser, business.ownerId)) {
    throw new Error("본인이 등록한 기업만 수정·삭제할 수 있습니다.");
  }
  return { session, business, siteUser };
}

export async function submitBusiness(data: BusinessPayload) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  const prepared = await prepareOwnedBusinessData(data);

  const existing = await prisma.business.findFirst({
    where: { name: { equals: prepared.name, mode: "insensitive" } },
    select: { id: true, name: true },
  });
  if (existing) {
    throw new Error(
      `이미 등록된 기업입니다: 「${existing.name}」. 디렉토리에서 검색해 주세요.`,
    );
  }

  const business = await prisma.business.create({
    data: {
      ...prepared,
      ownerId: session.user.id,
    },
  });

  revalidatePath("/business");
  revalidatePath("/business/map");
  revalidatePath("/");
  revalidatePath("/admin/businesses");
  return business;
}

export async function updateOwnedBusiness(id: string, data: BusinessPayload) {
  await requireBusinessOwner(id);
  const prepared = await prepareOwnedBusinessData(data);

  const conflict = await prisma.business.findFirst({
    where: {
      id: { not: id },
      name: { equals: prepared.name, mode: "insensitive" },
    },
    select: { id: true, name: true },
  });
  if (conflict) {
    throw new Error(`이미 등록된 기업명입니다: 「${conflict.name}」`);
  }

  const business = await prisma.business.update({
    where: { id },
    data: prepared,
  });

  revalidatePath("/business");
  revalidatePath("/business/map");
  revalidatePath(`/business/${id}`);
  revalidatePath(`/business/${id}/edit`);
  revalidatePath("/");
  revalidatePath("/admin/businesses");
  return business;
}

export async function deleteOwnedBusiness(id: string) {
  await requireBusinessOwner(id);
  await prisma.business.delete({ where: { id } });
  revalidatePath("/business");
  revalidatePath("/business/map");
  revalidatePath("/");
  revalidatePath("/admin/businesses");
}
