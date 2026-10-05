"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/sections/hero-slider";
import type { HeroSlideData } from "@/data/hero";

type HeroSectionProps = {
  slides: HeroSlideData[];
};

export function HeroSection({ slides }: HeroSectionProps) {
  const { t, locale } = useLocale();
  const [slideIndex, setSlideIndex] = useState(0);
  const activeSlide = slides[slideIndex] ?? slides[0];

  const caption =
    locale === "ko"
      ? activeSlide?.caption ?? null
      : activeSlide?.captionEn ?? activeSlide?.caption ?? null;

  return (
    <section className="relative -mt-16 min-h-[100svh] overflow-hidden md:-mt-[4.25rem]">
      <HeroSlider slides={slides} onSlideChange={setSlideIndex} />

      {/* Soft bottom plane for type ??not a decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/25 to-black/10"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-20 pt-28 md:px-8 md:pb-24 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="mb-4 text-xs font-medium tracking-[0.18em] text-white/70 uppercase">
            Korean Association in Chennai
          </p>

          <h1 className="font-display text-[clamp(2.4rem,7vw,4.75rem)] font-semibold leading-[1.05] text-white">
            {t.hero.title}
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-white/85 md:text-lg">
            {t.hero.description}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#141c20] hover:bg-white/90">
                {t.hero.ctaJoin}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/community">
              <Button
                size="lg"
                variant="outline"
                className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                {t.hero.ctaCommunity}
              </Button>
            </Link>
          </div>
        </motion.div>

        {caption ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 max-w-lg border-l border-white/30 pl-4 text-sm text-white/70"
          >
            {caption}
          </motion.p>
        ) : null}
      </div>
    </section>
  );
}
