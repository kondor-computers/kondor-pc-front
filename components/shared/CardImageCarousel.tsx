"use client";

import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuildImage } from "@/types/build";
import { resolveImageAlt } from "@/lib/build/images";

/**
 * The only client island inside build cards. Keeping interactivity confined
 * here lets the card body (title, specs, FPS, price) stay server-rendered:
 * smaller JS bundle, less hydration work, and full static HTML for crawlers.
 *
 * Only frames the visitor has actually reached are mounted, so a card with 8
 * photos ships a single <img> until the arrows are used — the initial page
 * (home, catalog) no longer downloads every gallery frame on scroll.
 */
export function CardImageCarousel({
  images,
  defaultAlt,
  sizes,
  quality,
  priority = false,
}: {
  images: BuildImage[];
  defaultAlt: string;
  sizes: string;
  quality?: number;
  /** Preload the first frame — use for above-the-fold cards. */
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));

  if (images.length === 0) return null;
  const hasMany = images.length > 1;

  // Arrow clicks must not navigate the card's <Link> ancestor.
  function flip(e: MouseEvent<HTMLButtonElement>, delta: number) {
    e.preventDefault();
    e.stopPropagation();
    const next = (index + delta + images.length) % images.length;
    setIndex(next);
    setSeen((s) => (s.has(next) ? s : new Set(s).add(next)));
  }

  return (
    <>
      {images.map((image, i) => {
        if (!seen.has(i)) return null;
        const visible = i === index;
        return (
          <Image
            key={image.url + i}
            src={image.url}
            alt={visible ? resolveImageAlt(image, defaultAlt) : ""}
            fill
            sizes={sizes}
            quality={quality}
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
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </>
  );
}
