"use client";

import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { BusinessMapClient } from "@/components/business/business-map-client";

type Business = {
  id: string;
  name: string;
  category: string;
  region: string;
  address: string;
  phone: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
};

export function BusinessMapSection({ businesses }: { businesses: Business[] }) {
  const { t } = useLocale();

  return (
    <section id="business" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeader title={t.businessMap.title} subtitle={t.businessMap.subtitle} />
        <BusinessMapClient businesses={businesses} />
        <FadeIn className="mt-8 text-center">
          <Link href="/business/map">
            <Button variant="outline">{t.businessMap.viewDirectory}</Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
