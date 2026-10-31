"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  getOrCreateMailSetting,
  sendSiteMail,
  toPublicMailSetting,
} from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { plainTextFromHtml, sanitizePostHtml } from "@/lib/sanitize-html";
import { adminHasRole } from "@/lib/session-kind";

async function requireSuperAdmin() {
  const session = await auth();
  if (!adminHasRole(session, ["SUPER_ADMIN"])) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getMailSettingAction() {
  await requireSuperAdmin();
  const setting = await getOrCreateMailSetting();
  return toPublicMailSetting(setting);
}

export async function updateMailSetting(data: {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  contactEmail: string;
}) {
  await requireSuperAdmin();
  const existing = await getOrCreateMailSetting();

  const host = data.host.trim();
  const fromEmail = data.fromEmail.trim();
  const contactEmail = data.contactEmail.trim() || "edit@ickoa.org";
  const port = Number.isFinite(data.port) ? data.port : 587;

  if (data.enabled && (!host || !fromEmail)) {
    throw new Error("메일 사용 시 SMTP 호스트와 발신 메일은 필수입니다.");
  }

  const password =
    data.password && data.password.trim()
      ? data.password.trim()
      : existing.password;

  await prisma.mailSetting.update({
    where: { id: "default" },
    data: {
      enabled: data.enabled,
      host,
      port,
      secure: data.secure,
      username: data.username.trim(),
      password,
      fromEmail,
      fromName: data.fromName.trim(),
      replyTo: data.replyTo.trim(),
      contactEmail,
    },
  });

  revalidatePath("/admin/mail");
  revalidatePath("/contact");
  revalidatePath("/");
  return { ok: true };
}

export async function sendTestMail(to: string) {
  await requireSuperAdmin();
  const target = to.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
    throw new Error("테스트 수신 메일 주소를 확인해 주세요.");
  }

  await sendSiteMail({
    to: target,
    subject: "[KAIC] 메일 설정 테스트",
    text: "첸나이한인회 사이트 메일 설정 테스트입니다. 이 메일이 도착했다면 SMTP 설정이 정상입니다.",
  });

  return { ok: true };
}

export async function submitContactInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const name = data.name.trim();
  const email = data.email.trim();
  const phone = data.phone?.trim() || null;
  const subject = data.subject.trim();
  const messageHtml = sanitizePostHtml(data.message.trim());
  const messageText = plainTextFromHtml(messageHtml);

  if (!name || !email || !subject || !messageText) {
    throw new Error("이름, 메일, 제목, 내용을 입력해 주세요.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("메일 주소 형식을 확인해 주세요.");
  }

  const setting = await getOrCreateMailSetting();
  const inquiry = await prisma.contactInquiry.create({
    data: { name, email, phone, subject, message: messageHtml },
  });

  let mailed = false;
  if (setting.enabled) {
    try {
      const to = setting.contactEmail.trim() || setting.fromEmail.trim();
      if (!to) throw new Error("수신 메일이 없습니다.");
      await sendSiteMail({
        to,
        subject: `[문의] ${subject}`,
        text: [
          `이름: ${name}`,
          `메일: ${email}`,
          `전화: ${phone || "-"}`,
          `제목: ${subject}`,
          "",
          messageText,
        ].join("\n"),
        html: [
          `<p><strong>이름</strong>: ${name}</p>`,
          `<p><strong>메일</strong>: ${email}</p>`,
          `<p><strong>전화</strong>: ${phone || "-"}</p>`,
          `<p><strong>제목</strong>: ${subject}</p>`,
          `<hr/>`,
          messageHtml,
        ].join(""),
        replyTo: email,
      });
      mailed = true;
      await prisma.contactInquiry.update({
        where: { id: inquiry.id },
        data: { mailed: true },
      });
    } catch {
      // 문의 접수는 유지하고 메일 실패는 관리자 화면에서 확인
    }
  }

  revalidatePath("/admin/mail");
  revalidatePath("/admin/inquiries");
  return { id: inquiry.id, mailed };
}

export async function deleteContactInquiry(id: string) {
  await requireSuperAdmin();
  const existing = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");
  await prisma.contactInquiry.delete({ where: { id } });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/mail");
  return { ok: true };
}
