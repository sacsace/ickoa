"use client";

import Link from "next/link";
import { Handshake, Building2, Users, ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

const networkFeatures = [
  {
    icon: Building2,
    title: "회원 기업 소개",
    description: "남인도 한인 기업 프로필 및 사업 영역 소개",
  },
  {
    icon: Handshake,
    title: "비즈니스 매칭",
    description: "업종별·지역별 기업 간 협력 기회 연결",
  },
  {
    icon: Users,
    title: "협력 요청 게시판",
    description: "파트너십, 공급망, 기술 협력 요청",
  },
];

export function BusinessNetworkSection() {
  const { t } = useLocale();

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeader title={t.network.title} subtitle={t.network.subtitle} />

        <div className="grid gap-6 md:grid-cols-3">
          {networkFeatures.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 0.1}>
              <div className="hover-lift rounded-2xl border border-border bg-card p-8 md:rounded-3xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-10 text-center">
          <Link href="/network">
            <Button>
              {t.network.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
