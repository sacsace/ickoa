"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/s3";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const AVATAR_EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function isUploadBlob(value: FormDataEntryValue | null): value is Blob {
  return !!value && typeof value === "object" && "arrayBuffer" in value && (value as Blob).size > 0;
}

function resolveAvatarMime(file: Blob) {
  if (file.type && ALLOWED_AVATAR_TYPES.has(file.type)) return file.type;
  const name = "name" in file ? String((file as File).name ?? "") : "";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return AVATAR_EXT_MIME[ext] ?? "";
}

export async function updateSiteProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("이름을 입력해 주세요.");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Not found");

  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();
  const email = emailRaw || null;
  if (email) {
    const taken = await prisma.user.findFirst({
      where: { email, id: { not: user.id } },
    });
    if (taken) throw new Error("이미 사용 중인 이메일입니다.");
  }

  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const nameEn = String(formData.get("nameEn") ?? "").trim() || null;
  const company = String(formData.get("company") ?? "").trim() || null;
  const jobTitle = String(formData.get("jobTitle") ?? "").trim() || null;
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  const updateData: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    nameEn: string | null;
    company: string | null;
    jobTitle: string | null;
    password?: string;
    image?: string;
  } = { name, email, phone, address, nameEn, company, jobTitle };

  const avatar = formData.get("avatar");
  if (isUploadBlob(avatar)) {
    const mimeType = resolveAvatarMime(avatar);
    if (!mimeType || !ALLOWED_AVATAR_TYPES.has(mimeType)) {
      throw new Error("프로필 사진은 JPEG, PNG, WebP, GIF만 업로드할 수 있습니다.");
    }
    if (avatar.size > MAX_AVATAR_BYTES) {
      throw new Error("프로필 사진은 5MB 이하로 업로드해 주세요.");
    }
    const filename = "name" in avatar ? String((avatar as File).name || "avatar.jpg") : "avatar.jpg";
    const buffer = Buffer.from(await avatar.arrayBuffer());
    updateData.image = await uploadFile(buffer, filename, mimeType);
  }

  if (newPassword.trim()) {
    if (!currentPassword.trim()) {
      throw new Error("현재 비밀번호를 입력해 주세요.");
    }
    if (!user.password) {
      throw new Error("비밀번호를 변경할 수 없는 계정입니다.");
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error("현재 비밀번호가 올바르지 않습니다.");
    if (newPassword.trim().length < 6) {
      throw new Error("새 비밀번호는 6자 이상이어야 합니다.");
    }
    updateData.password = await bcrypt.hash(newPassword.trim(), 10);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: { name: true, email: true, image: true },
  });

  revalidatePath("/account");
  revalidatePath("/");
  return {
    ok: true as const,
    name: updated.name,
    email: updated.email,
    image: updated.image,
  };
}
