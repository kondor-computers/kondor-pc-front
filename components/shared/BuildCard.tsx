"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpecPill } from "@/components/shared/SpecPill";
import { PriceBlock } from "@/components/shared/PriceBlock";
import { TechButtonDisplay } from "@/components/shared/TechButtonPrimitives";
import { ChassisArt } from "@/components/brand/ChassisArt";
import type { Build } from "@/types/build";
import { fpsTier, FPS_TIER_META } from "@/lib/fps-thresholds";

type Variant = "compact" | "full";

const RESOLUTION_LABEL = {
  fullhd: "Full HD",
  "2k": "2K",
  "4k": "4K",
} as const;

/** Українські закінчення: 1 день, 2–4 дні, 5+ днів (з винятками 11–14). */
function ukrainianDaysWord(count: number): string {
  const n = Math.abs(Math.trunc(count)) % 100;
  const last = n % 10;
  if (n >= 11 && n <= 14) return "днів";
  if (last === 1) return "день";
  if (last >= 2 && last <= 4) return "дні";
  return "днів";
}

export function BuildCard({
  build,
  variant = "full",
  highlightGames,
  gameLabels,
  gameShortLabels,
  badge,
  className,
}: {
  build: Build;
  variant?: Variant;
  highlightGames?: string[];
  gameLabels?: Record<string, string>;
  /** Скорочені назви для блоку FPS (shortName з Sanity). */
  gameShortLabels?: Record<string, string>;
  badge?: string;
  className?: string;
}) {
  const statusLabel =
    build.status === "in_stock"
      ? "В наявності"
      : build.status === "assemble_on_order"
        ? `Збираємо за ${build.assemblyDays} ${ukrainianDaysWord(build.assemblyDays)}`
        : build.status === "out_of_stock"
          ? "Немає в наявності"
          : "Архів";

  const images: string[] =
    build.galleryImageUrls && build.galleryImageUrls.length > 0
      ? build.galleryImageUrls
      : build.heroImageUrl
        ? [build.heroImageUrl]
        : [];
  const hasMany = images.length > 1;
  const [imageIndex, setImageIndex] = useState(0);

  // Arrow click must not navigate to product page.
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
      <div className="pointer-events-none absolute top-[-100px] right-[-100px] size-[256px] rounded-full bg-brand-primary/25 blur-[64px]" />

      <div className="relative flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="font-heading text-2xl font-bold uppercase tracking-wider">
              {build.name}
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
          <div className="absolute z-20 top-2 left-2 max-w-[calc(100%-1rem)] whitespace-normal font-heading text-[8px] text-black uppercase leading-tight bg-brand-primary rounded-full px-3 py-2">
            {build.shortTagline}
          </div>
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

        <SpecPill
          specs={[
            { key: "cpu", value: build.spec.cpu },
            { key: "gpu", value: build.spec.gpu, note: build.spec.gpuVram },
            { key: "ram", value: build.spec.ram, note: build.spec.ramSpeed },
            { key: "storage", value: build.spec.storage },
          ]}
        />

        {variant === "full" && highlightGames && highlightGames.length > 0 && (
          <div className="tabular space-y-1.5 rounded-md border border-border bg-background/40 py-3 px-1.5">
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
                    {gameShortLabels?.[slug] ?? gameLabels?.[slug] ?? slug}
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
          <TechButtonDisplay size="sm" variant="inverse" className="w-full h-9">
            Детальніше
          </TechButtonDisplay>
        </div>

        <div className="-mx-5 -mb-5 mt-0 border-t border-border bg-background/50 px-5 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          {build.status === "in_stock" ? "✓ " : "• "}
          {statusLabel}
        </div>
      </div>
    </Link>
  );
}
