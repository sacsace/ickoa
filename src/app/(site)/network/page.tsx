import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Handshake, Building2, Users } from "lucide-react";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "교민 비즈니스 네트워크",
  description: "한인 기업 소개, 비즈니스 매칭, 협력 요청",
  path: "/network",
});

export default function NetworkPage() {
  return (
    <>
      <PageHeader title="교민 비즈니스 네트워크" subtitle="한인 기업 간 협력과 매칭" />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Building2, title: "회원 기업 소개", href: "/business", desc: "남인도 한인 기업 프로필" },
            { icon: Handshake, title: "비즈니스 매칭", href: "/community/promo", desc: "협력 기회 연결" },
            { icon: Users, title: "협력 요청", href: "/community/promo", desc: "파트너십 요청 게시판" },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="hover-lift rounded-2xl border border-border bg-card p-8 md:rounded-3xl"
            >
              <item.icon className="mb-4 h-8 w-8 text-foreground" />
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
