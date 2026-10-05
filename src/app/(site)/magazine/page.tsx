import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getPublishedMagazineIssues } from "@/lib/magazine-data";
import { magazineMeta } from "@/data/dynamic-korean";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "다이나믹 코리안",
  description: "재인도 첸나이 한인회 공식 회보 DYNAMIC KOREAN — PDF 아카이브",
  path: "/magazine",
});

export default async function MagazinePage() {
  const issues = await getPublishedMagazineIssues();

  return (
    <>
      <PageHeader
        title="DYNAMIC KOREAN"
        subtitle="재인도 첸나이 한인회보 · Korean Association in Chennai Newsletter"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <p className="mb-10 max-w-2xl text-muted-foreground">
          {magazineMeta.website} · {magazineMeta.email} · {magazineMeta.adminEmail}
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <article key={issue.id} className="community-card overflow-hidden">
              <Link href={`/magazine/${issue.id}`} className="group block">
                <div className="relative aspect-[3/4]">
                  <Image
                    src={issue.coverImage}
                    alt={`Vol.${issue.volume}`}
                    fill
                    className="object-cover object-top transition-transform group-hover:scale-[1.02]"
                    sizes="400px"
                  />
                </div>
                <div className="p-5">
                  <span className="tag-pill tag-pill-saffron">VOL.{issue.volume}</span>
                  <h2 className="font-display mt-3 text-xl font-bold">{issue.title}</h2>
                  <p className="text-sm text-muted-foreground">{issue.subtitle}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{issue.publishedAt}</p>
                </div>
              </Link>
              {issue.pdfUrl && (
                <div className="flex gap-2 border-t border-border px-5 py-4">
                  <Link
                    href={`/magazine/${issue.id}/read`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand py-2 text-sm font-medium text-white hover:bg-brand-dark"
                  >
                    웹에서 보기
                  </Link>
                  <a
                    href={issue.pdfUrl}
                    download
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>

        {issues.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">등록된 한인회보가 없습니다.</p>
        )}
      </div>
    </>
  );
}
