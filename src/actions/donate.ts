"use server";

import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getRazorpayClient,
  getRazorpayKeyId,
  inrToPaise,
  isRazorpayConfigured,
} from "@/lib/razorpay";

const MIN_INR = 100;
const MAX_INR = 500_000;

export async function createDonationOrder(data: {
  amountInr: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  message?: string;
}) {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay 결제가 아직 설정되지 않았습니다. 관리자에게 문의해 주세요.");
  }

  const amountInr = Math.round(data.amountInr);
  if (amountInr < MIN_INR || amountInr > MAX_INR) {
    throw new Error(`후원 금액은 ₹${MIN_INR.toLocaleString()} ~ ₹${MAX_INR.toLocaleString()} 사이여야 합니다.`);
  }

  const donorName = data.donorName.trim();
  const donorEmail = donEmailTrim(data.donorEmail);
  if (!donorName) throw new Error("이름을 입력해 주세요.");
  if (!donorEmail) throw new Error("이메일을 입력해 주세요.");

  const session = await auth();
  const amount = inrToPaise(amountInr);
  const receipt = `don_${Date.now()}`;

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt,
    notes: {
      purpose: "ICKOA Donation",
      donorName,
      donorEmail,
    },
  });

  const donation = await prisma.donation.create({
    data: {
      amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "pending",
      donorName,
      donorEmail,
      donorPhone: data.donorPhone?.trim() || null,
      message: data.message?.trim() || null,
      userId: session?.user?.id ?? null,
    },
  });

  return {
    donationId: donation.id,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: getRazorpayKeyId(),
    donorName,
    donorEmail,
    donorPhone: data.donorPhone?.trim() || "",
  };
}

export async function verifyDonationPayment(data: {
  donationId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay 결제가 설정되지 않았습니다.");
  }

  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const body = `${data.razorpayOrderId}|${data.razorpayPaymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (expected !== data.razorpaySignature) {
    throw new Error("결제 검증에 실패했습니다.");
  }

  const donation = await prisma.donation.findUnique({
    where: { id: data.donationId },
  });

  if (!donation || donation.razorpayOrderId !== data.razorpayOrderId) {
    throw new Error("후원 내역을 찾을 수 없습니다.");
  }

  if (donation.status === "paid") {
    return { success: true, amountInr: donation.amount / 100 };
  }

  await prisma.donation.update({
    where: { id: donation.id },
    data: {
      status: "paid",
      razorpayPaymentId: data.razorpayPaymentId,
    },
  });

  return { success: true, amountInr: donation.amount / 100 };
}

function donEmailTrim(email: string) {
  return email.trim().toLowerCase();
}

export async function getDonationsAdmin() {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  return prisma.donation.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
