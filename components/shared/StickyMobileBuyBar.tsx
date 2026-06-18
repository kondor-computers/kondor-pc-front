"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import Link from "next/link";
import { TechButton } from "@/components/shared/TechButton";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SKU_ACCENTS, type SkuSlug } from "@/lib/sku-accents";
import { useCartStore } from "@/lib/cartStore";
import { useProductConfiguratorOptional } from "@/components/shared/ProductConfigurator";

const TELEGRAM_HANDLE = process.env.NEXT_PUBLIC_TELEGRAM_HANDLE || "kondor_pc";

/**
 * Sticky bottom bar on mobile, sticky top-offset bar on desktop.
 * Keeps the buy context — build name + resolved price + CTA — visible at all
 * times on long product pages (our PC detail is ~9000 px tall). Renamed from
 * the mobile-only variant; behavior now spans both breakpoints.
 */
export function StickyMobileBuyBar({
  name,
  slug,
  priceUah,
  image,
  triggerPx = 520,
}: {
  name: string;
  slug: SkuSlug;
  priceUah: number;
  image?: string;
  triggerPx?: number;
}) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { add } = useCartStore();
  const config = useProductConfiguratorOptional();

  const displayPrice = config?.resolvedPriceUah ?? priceUah;
  const imageSrc = image ?? config?.build.heroImageUrl;

  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > triggerPx);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [triggerPx]);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    if (visible) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [visible]);

  function buy() {
    add({
      itemType: "build",
      slug,
      name,
      priceUah,
      unitPriceUah: displayPrice,
      options: config?.cartOptions,
      spec: config?.resolvedSpec,
      sku: config?.build.sku,
      image: imageSrc,
    });
    router.push("/oformlennya");
  }

  return (
    <div
      ref={barRef}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md",
        "transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      style={{ ["--sku" as string]: SKU_ACCENTS[slug] }}
    >
      <div className="container-site flex items-center justify-between gap-3 py-2.5 md:py-3">
        {/* Identity — compact */}
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="size-2 shrink-0 rounded-full"
            style={{ background: "var(--brand-primary)" }}
          />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-sm font-bold uppercase leading-tight tracking-wider truncate">
                {name}
              </span>
              <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground md:inline">
                Ігровий ПК
              </span>
            </div>
            <div className="tabular text-xs leading-tight text-muted-foreground md:text-sm">
              {formatPrice(displayPrice)}
              {config?.deltaUah && config.deltaUah !== 0 ? (
                <span className="ml-1 text-[10px]">
                  ({config.deltaUah > 0 ? "+" : "−"}
                  {formatPrice(Math.abs(config.deltaUah)).replace(" ₴", "")} ₴
                  до бази)
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Manager link — desktop only (mobile already has it on the product card above) */}
          <Link
            href={`https://t.me/${TELEGRAM_HANDLE}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Написати в Telegram"
            className={cn(
              "hidden size-9 items-center justify-center rounded-md border border-border bg-background",
              "text-brand-primary transition hover:border-white/25 md:flex",
            )}
          >
            <Send className="size-4" strokeWidth={2} />
          </Link>
          {/*
            Size "lg" (52px) is firmly inside the 48-56px tap-target window.
            `min-w-[128px]` keeps the hit box generous on mobile so thumbs land
            reliably; horizontal padding stays whatever the tech-btn variant
            ships, so we don't touch sibling spacing.
          */}
          <TechButton
            size="lg"
            className="min-w-[128px] font-heading tracking-normal"
            onClick={buy}
          >
            Купити
          </TechButton>
        </div>
      </div>
    </div>
  );
}
