import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { createMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.activityReport.findUnique({
    where: { id },
    select: { title: true, published: true },
  });
  if (!report?.published) {
    return createMetadata({ title: "활동 보고서", path: "/about/reports" });
  }
  return createMetadata({
    title: report.title,
    description: `${report.title} — 재인도 첸나이 한인회(ICKOA)`,
    path: `/about/reports/${id}`,
  });
}

export default async function ActivityReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.activityReport.findUnique({ where: { id } });
  if (!report || !report.published) notFound();

  return (
    <>
      <PageHeader
        title={report.title}
        subtitle={report.year != null ? `${report.year}년` : undefined}
        backHref="/about/reports"
      />
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <p className="whitespace-pre-wrap leading-relaxed text-foreground">{report.content}</p>
        {report.fileUrl ? (
          <Link
            href={report.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm text-brand hover:underline"
          >
            첨부 파일 보기
          </Link>
        ) : null}
      </div>
    </>
  );
}
