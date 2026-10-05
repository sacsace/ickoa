"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyRow, formatKoDateTime } from "@/components/admin/admin-board-ui";

type DonationRow = {
  id: string;
  amount: number;
  status: string;
  donorName: string | null;
  donorEmail: string | null;
  createdAt: Date;
};

export function AdminDonationsList({ donations }: { donations: DonationRow[] }) {
  const paidTotal = donations.filter((d) => d.status === "paid").reduce((sum, d) => sum + d.amount, 0);

  return (
    <>
      <AdminPageHeader title="후원 내역" subtitle="Razorpay 결제 기록" />
      <div className="mb-6 border border-border p-4">
        <p className="text-sm text-muted-foreground">완료된 후원 합계</p>
        <p className="text-xl font-semibold">₹{(paidTotal / 100).toLocaleString("en-IN")}</p>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-3 py-2.5 text-center font-medium text-muted-foreground">번호</th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">후원자</th>
              <th className="w-28 px-3 py-2.5 text-center font-medium text-muted-foreground">금액</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">상태</th>
              <th className="w-36 px-3 py-2.5 text-center font-medium text-muted-foreground">일시</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d, index) => (
              <tr key={d.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-3 text-center text-muted-foreground">{donations.length - index}</td>
                <td className="px-3 py-3">
                  <Link href={`/admin/donations/${d.id}`} className="font-medium hover:text-brand hover:underline">
                    {d.donorName ?? "—"}
                  </Link>
                  {d.donorEmail && <p className="text-xs text-muted-foreground">{d.donorEmail}</p>}
                </td>
                <td className="px-3 py-3 text-center">₹{(d.amount / 100).toLocaleString("en-IN")}</td>
                <td className={`px-3 py-3 text-center ${d.status === "paid" ? "text-brand" : "text-muted-foreground"}`}>{d.status}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{formatKoDateTime(d.createdAt)}</td>
              </tr>
            ))}
            {donations.length === 0 && <AdminEmptyRow colSpan={5} message="후원 내역이 없습니다." />}
          </tbody>
        </table>
      </div>
    </>
  );
}
