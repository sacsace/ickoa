import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { getNews } from "@/lib/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "남인도 실시간 뉴스",
  description: "첸나이·남인도 경제, 산업, 정책, 비자 등 한인 교민을 위한 뉴스",
  path: "/news",
});

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await getNews();

  return (
    <>
      <PageHeader title="남인도 실시간 뉴스" subtitle="경제 · 산업 · 정책 · 비자 정보" />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className="hover-lift group overflow-hidden rounded-2xl border border-border bg-card md:rounded-3xl"
            >
              {item.image && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="mb-2 flex gap-2">
                  <span className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.region}</span>
                </div>
                <h2 className="font-bold text-foreground group-hover:opacity-70">
                  {item.title}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.createdAt.toLocaleDateString("ko-KR")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
