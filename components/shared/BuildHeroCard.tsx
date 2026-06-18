"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceBlock } from "@/components/shared/PriceBlock";
import { TechButtonDisplay } from "@/components/shared/TechButtonPrimitives";
import { ChassisArt } from "@/components/brand/ChassisArt";
import type { Build } from "@/types/build";
import { fpsTier, FPS_TIER_META } from "@/lib/fps-thresholds";
import { formatPrice } from "@/lib/format";

type Variant = "compact" | "full";

const RESOLUTION_LABEL = {
  fullhd: "Full HD",
  "2k": "2K",
  "4k": "4K",
} as const;

export function BuildHeroCard({
  build,
  variant = "full",
  highlightGames,
  gameLabels,
  badge,
  priority = false,
  className,
}: {
  build: Build;
  variant?: Variant;
  highlightGames?: string[];
  gameLabels?: Record<string, string>;
  badge?: string;
  /** Preload the first gallery image — use for above-the-fold hero cards. */
  priority?: boolean;
  className?: string;
}) {
  const images: string[] =
    build.galleryImageUrls && build.galleryImageUrls.length > 0
      ? build.galleryImageUrls
      : build.heroImageUrl
        ? [build.heroImageUrl]
        : [];
  const hasMany = images.length > 1;
  const [imageIndex, setImageIndex] = useState(0);

  function flip(e: MouseEvent<HTMLButtonElement>, delta: number) {
    e.preventDefault();
    e.stopPropagation();
    if (images.length === 0) return;
    setImageIndex((i) => (i + delta + images.length) % images.length);
  }

  return (
    <Link
      href={`/pk/${build.slug}`}
      className={cn(
        "build-hero-card relative block overflow-hidden",
        "motion-reduce:transform-none",
        className,
      )}
    >
      <div className="size-[256px] absolute top-[-100px] right-[-100px] bg-brand-primary/25 rounded-full blur-[64px]" />
      <div className="relative flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="font-heading text-2xl font-bold uppercase tracking-wider">
              {build.name}
            </div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {build.shortTagline}
            </div>
          </div>
          {badge ? (
            <div className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[rgba(19,158,217,0.9)]">
              {badge}
            </div>
          ) : (
            <div className="mt-1 size-3 shrink-0 rounded-full bg-brand-primary ring-2 ring-background" />
          )}
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
          <ChassisArt className="absolute inset-0 size-full" />

          {images.map((src, i) => {
            const visible = i === imageIndex;
            return (
              <Image
                key={src + i}
                src={src}
                alt={visible ? `${build.name} — ігровий ПК` : ""}
                fill
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 90vw"
                priority={priority && i === 0}
className={cn(
                  "absolute inset-0 z-10 object-cover",
                  "transition-opacity duration-400 ease-out",
                  "motion-reduce:transform-none",
                  visible ? "opacity-100" : "opacity-0 pointer-events-none",
                )}
              />
            );
          })}

          {hasMany && (
            <>
              <button
                type="button"
                onClick={(e) => flip(e, -1)}
                aria-label="Попереднє фото"
                className={cn(
                  "absolute left-2 top-1/2 z-20 -translate-y-1/2",
                  "flex size-8 items-center justify-center rounded-full",
                  "bg-background/70 border border-white/10 text-foreground backdrop-blur",
                  "transition-all duration-300 ease-out",
                  "hover:bg-background hover:border-white/25 hover:scale-105",
                  "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                )}
              >
                <ChevronLeft className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={(e) => flip(e, +1)}
                aria-label="Наступне фото"
                className={cn(
                  "absolute right-2 top-1/2 z-20 -translate-y-1/2",
                  "flex size-8 items-center justify-center rounded-full",
                  "bg-background/70 border border-white/10 text-foreground backdrop-blur",
                  "transition-all duration-300 ease-out",
                  "hover:bg-background hover:border-white/25 hover:scale-105",
                  "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                )}
              >
                <ChevronRight className="size-4" strokeWidth={2} />
              </button>
              <div className="tabular absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
                {imageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {variant === "full" && highlightGames && highlightGames.length > 0 && (
          <div className="tabular space-y-1.5 rounded-md border border-border bg-background/40 p-3">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              У твоїх іграх · {RESOLUTION_LABEL[build.targetResolution]}
            </div>
            {highlightGames.slice(0, 3).map((slug) => {
              const entry = build.fps.find(
                (f) =>
                  f.gameSlug === slug &&
                  f.resolution === build.targetResolution,
              );
              if (!entry) return null;
              const tier = fpsTier(entry.fpsAvg);
              const isGreen = tier === "green";
              return (
                <div
                  key={slug}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {gameLabels?.[slug] ?? slug}
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        isGreen && "animate-fps-pulse",
                      )}
                      style={{ background: FPS_TIER_META[tier].colorVar }}
                    />
                    <span className="font-semibold">{entry.fpsAvg} FPS</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto space-y-3 pt-1">
          <PriceBlock
            priceUah={build.priceUah}
            oldPriceUah={build.oldPriceUah}
            size="sm"
            showInstallment={false}
          />
          <TechButtonDisplay
            size="sm"
            variant="inverse"
            className="w-full h-9 font-heading tracking-normal"
          >
            Купити за {formatPrice(build.priceUah)}
          </TechButtonDisplay>
        </div>
      </div>
    </Link>
  );
}
