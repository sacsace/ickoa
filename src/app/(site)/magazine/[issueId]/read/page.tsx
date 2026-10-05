import { notFound } from "next/navigation";
import { MagazinePdfViewerLazy } from "@/components/magazine/magazine-pdf-viewer-lazy";
import { getMagazineIssue } from "@/lib/magazine-data";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;
  const issue = await getMagazineIssue(issueId);
  if (!issue) {
    return createMetadata({ title: "PDF 뷰어", path: "/magazine" });
  }
  return createMetadata({
    title: `Vol.${issue.volume} PDF`,
    description: `${issue.subtitle} — DYNAMIC KOREAN 웹 PDF 뷰어`,
    path: `/magazine/${issueId}/read`,
    image: issue.coverImage,
    noIndex: true,
  });
}

export default async function MagazineReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ issueId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { issueId } = await params;
  const { page: pageParam } = await searchParams;
  const issue = await getMagazineIssue(issueId);

  if (!issue?.pdfUrl) notFound();

  const initialPage = pageParam ? parseInt(pageParam, 10) : 1;

  return (
    <MagazinePdfViewerLazy
      file={issue.pdfUrl}
      title={`DYNAMIC KOREAN · Vol.${issue.volume}`}
      backHref={`/magazine/${issueId}`}
      initialPage={Number.isNaN(initialPage) ? 1 : initialPage}
    />
  );
}
