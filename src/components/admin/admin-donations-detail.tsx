"use client";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminBackLink, formatKoDateTime } from "@/components/admin/admin-board-ui";

type DonationDetail = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  donorName: string | null;
  donorEmail: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  createdAt: Date;
};

export function AdminDonationsDetail({ donation }: { donation: DonationDetail }) {
  return (
    <>
      <AdminPageHeader title="후원 상세" />
      <AdminBackLink href="/admin/donations" />
      <article className="border border-border p-4 md:p-6">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-muted-foreground">후원자</dt><dd className="mt-1 font-medium">{donation.donorName ?? "—"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">이메일</dt><dd className="mt-1">{donation.donorEmail ?? "—"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">금액</dt><dd className="mt-1">₹{(donation.amount / 100).toLocaleString("en-IN")}</dd></div>
          <div><dt className="text-xs text-muted-foreground">상태</dt><dd className="mt-1">{donation.status}</dd></div>
          <div><dt className="text-xs text-muted-foreground">주문 ID</dt><dd className="mt-1 break-all">{donation.razorpayOrderId}</dd></div>
          <div><dt className="text-xs text-muted-foreground">결제 ID</dt><dd className="mt-1 break-all">{donation.razorpayPaymentId ?? "—"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">일시</dt><dd className="mt-1">{formatKoDateTime(donation.createdAt)}</dd></div>
        </dl>
      </article>
    </>
  );
}
