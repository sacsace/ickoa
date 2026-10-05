"use client";

import {
  TrendingUp,
  Sun,
  Plane,
  Calendar,
  FileText,
  Building2,
  Landmark,
} from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader } from "@/components/ui/motion";

const iconMap: Record<string, typeof TrendingUp> = {
  exchange: TrendingUp,
  weather: Sun,
  flights: Plane,
  holidays: Calendar,
  indiaGov: FileText,
  embassy: Building2,
  consulate: Landmark,
};

const labelKeys = {
  exchange: "exchange",
  weather: "weather",
  flights: "flights",
  holidays: "holidays",
  indiaGov: "indiaGov",
  embassy: "embassy",
  consulate: "consulate",
} as const;

type DashboardItem = {
  type: string;
  value: string;
  label: string;
  change: string | null;
};

export function DashboardSection({ items }: { items: DashboardItem[] }) {
  const { t } = useLocale();

  return (
    <section className="bg-muted/50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((card, index) => {
            const Icon = iconMap[card.type] ?? TrendingUp;
            const labelKey = labelKeys[card.type as keyof typeof labelKeys];

            return (
              <FadeIn key={card.type} delay={index * 0.05}>
                <div className="hover-lift group rounded-2xl border border-border bg-card p-5 md:rounded-3xl">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background transition-colors group-hover:bg-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {card.change ?? ""}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {labelKey ? t.dashboard[labelKey] : card.type}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground/70">{card.label}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
