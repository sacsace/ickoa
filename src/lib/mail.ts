import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export type MailSettingPublic = {
  id: string;
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  hasPassword: boolean;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  contactEmail: string;
};

const DEFAULT_CONTACT = "edit@ickoa.org";

export async function getOrCreateMailSetting() {
  return prisma.mailSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      contactEmail: DEFAULT_CONTACT,
    },
  });
}

export function toPublicMailSetting(
  setting: Awaited<ReturnType<typeof getOrCreateMailSetting>>,
): MailSettingPublic {
  return {
    id: setting.id,
    enabled: setting.enabled,
    host: setting.host,
    port: setting.port,
    secure: setting.secure,
    username: setting.username,
    hasPassword: Boolean(setting.password),
    fromEmail: setting.fromEmail,
    fromName: setting.fromName,
    replyTo: setting.replyTo,
    contactEmail: setting.contactEmail || DEFAULT_CONTACT,
  };
}

export async function getContactEmail() {
  const setting = await getOrCreateMailSetting();
  return setting.contactEmail?.trim() || DEFAULT_CONTACT;
}

export async function sendSiteMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const setting = await getOrCreateMailSetting();
  if (!setting.enabled) {
    throw new Error("메일 발송이 비활성화되어 있습니다.");
  }
  if (!setting.host.trim() || !setting.fromEmail.trim()) {
    throw new Error("SMTP 호스트와 발신 메일을 설정해 주세요.");
  }

  const transporter = nodemailer.createTransport({
    host: setting.host.trim(),
    port: setting.port || 587,
    secure: setting.secure,
    auth:
      setting.username.trim() || setting.password
        ? {
            user: setting.username.trim(),
            pass: setting.password,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: setting.fromName.trim()
      ? `"${setting.fromName.trim()}" <${setting.fromEmail.trim()}>`
      : setting.fromEmail.trim(),
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    replyTo: options.replyTo || setting.replyTo || undefined,
  });
}
