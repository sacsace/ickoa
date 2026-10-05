import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
import { ensureAboutDefaults } from "@/lib/about-defaults";
import { prisma } from "@/lib/prisma";

export const metadata = createMetadata({
  title: "활동 보고서",
  description: "활동 보고서 — 재인도 첸나이 한인회(ICKOA)",
  path: "/about/reports",
});

export const dynamic = "force-dynamic";

export default async function ActivityReportsListPage() {
  await ensureAboutDefaults();
  const reports = await prisma.activityReport.findMany({
    where: { published: true },
    orderBy: [{ year: "desc" }, { order: "asc" }],
    select: { id: true, year: true, title: true },
  });

  return (
    <>
      <PageHeader title="활동 보고서" backHref="/about" />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        {reports.length === 0 ? (
          <p className="text-muted-foreground">등록된 활동 보고서가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {reports.map((report) => (
              <li key={report.id}>
                <Link
                  href={`/about/reports/${report.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <span className="w-14 shrink-0 text-sm font-bold text-brand">
                    {report.year ?? "—"}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{report.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">보기 →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
