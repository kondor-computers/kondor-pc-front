"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { TechButton } from "@/components/shared/TechButton";
import {
  AddToCartAnimation,
  FLY_DURATION_MS,
} from "@/components/cart/AddToCartAnimation";
import { useCartStore } from "@/lib/cartStore";
import { formatPrice } from "@/lib/format";
import { urlFor } from "@/lib/sanity/image";
import { cn } from "@/lib/utils";
import type {
  CatalogColorDot,
  CatalogProductGroup,
  CatalogProductListItem,
  SanityImageRef,
} from "@/types/catalog";

function imageUrl(source: SanityImageRef | undefined, size: number) {
  return source?.asset
    ? urlFor(source).width(size).height(size).fit("crop").quality(85).url()
    : undefined;
}

/**
 * Build a unified swatch model:
 *   - when the group has >1 variant, each variant contributes one swatch
 *     (swatches reference whole variants → cart gets the real ID/slug)
 *   - when there's one variant, fall back to that variant's own `coloropts`
 *     (photo variants inside a single item)
 */
interface Swatch {
  /** Stable key for React. */
  key: string;
  /** Label shown in the UI + stored in cart as `colorName`. */
  label: string;
  /** Dot hex — falls back to #999 when absent. */
  hex?: string;
  /** Used as `colorCode` in cart — the internal variant code. */
  code?: string;
  /** The variant this swatch resolves to. */
  variant: CatalogProductListItem;
  /** The specific photo source this swatch should display. */
  photo?: SanityImageRef;
}

function buildSwatches(group: CatalogProductGroup): Swatch[] {
  if (group.variants.length > 1) {
    // One swatch per variant — this is the cart-safe path.
    const seen = new Set<string>();
    const out: Swatch[] = [];
    for (const variant of group.variants) {
      const primary: CatalogColorDot | undefined =
        variant.colors?.find((c) => c?.color) ?? variant.colors?.[0];
      const label =
        primary?.color?.trim() ||
        // Last-resort label: strip the product name and take what's left (e.g.
        // "Aviator Білий" → "Білий"). If nothing usable is left, keep the slug.
        variant.slug;
      const dedupeKey = label.toLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      out.push({
        key: variant.id || variant.slug,
        label,
        hex: primary?.hex,
        code: primary?.code,
        variant,
        photo: primary?.photo ?? variant.heroImage,
      });
    }
    return out;
  }

  // Single-variant fallback: surface the variant's own colour photo options.
  const variant = group.variants[0];
  const seen = new Set<string>();
  const out: Swatch[] = [];
  for (const c of variant.colors ?? []) {
    if (!c?.color) continue;
    const key = c.color.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      key: (c.code ?? "") + c.color,
      label: c.color,
      hex: c.hex,
      code: c.code,
      variant,
      photo: c.photo ?? variant.heroImage,
    });
  }
  return out;
}

export function CatalogCard({
  group,
  className,
}: {
  group: CatalogProductGroup;
  className?: string;
}) {
  const { add, openDrawer } = useCartStore();

  const swatches = useMemo(() => buildSwatches(group), [group]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const activeIdx = hoverIdx ?? selectedIdx;
  const activeSwatch = swatches[activeIdx];
  const committedSwatch = swatches[selectedIdx];

  // The variant that drives everything the user actually buys.
  // Falls back to the group's first variant when the group has no swatches.
  const activeVariant: CatalogProductListItem =
    activeSwatch?.variant ?? group.variants[0];
  const committedVariant: CatalogProductListItem =
    committedSwatch?.variant ?? group.variants[0];

  const fallbackGallery = useMemo(() => {
    const seen = new Set<string>();
    const out: SanityImageRef[] = [];
    for (const v of group.variants) {
      const img = v.heroImage;
      const key = img?.asset?._ref;
      if (!img || !key || seen.has(key)) continue;
      seen.add(key);
      out.push(img);
    }
    return out;
  }, [group.variants]);
  const hasManyPhotos = swatches.length > 1 || fallbackGallery.length > 1;

  const displayImage: SanityImageRef | undefined =
    swatches.length > 0
      ? (activeSwatch?.photo ?? activeVariant.heroImage)
      : (fallbackGallery[galleryIdx] ?? activeVariant.heroImage);
  const heroUrl = imageUrl(displayImage, 900);
  const thumbUrl = imageUrl(displayImage, 240);

  const hasDiscount =
    typeof activeVariant.priceDiscount === "number" &&
    activeVariant.priceDiscount < activeVariant.price;
  const finalPrice = hasDiscount
    ? activeVariant.priceDiscount!
    : activeVariant.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((activeVariant.price - activeVariant.priceDiscount!) /
          activeVariant.price) *
          100,
      )
    : 0;

  const [animationKey, setAnimationKey] = useState<number | null>(null);
  const [startPos, setStartPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    openDrawer();
    const committedHasDiscount =
      typeof committedVariant.priceDiscount === "number" &&
      committedVariant.priceDiscount < committedVariant.price;
    const committedFinalPrice = committedHasDiscount
      ? committedVariant.priceDiscount!
      : committedVariant.price;
    const committedThumb = imageUrl(
      committedSwatch?.photo ?? committedVariant.heroImage,
      240,
    );

    if (committedThumb) {
      const rect = e.currentTarget.getBoundingClientRect();
      setStartPos({
        top: rect.top + rect.height / 2 - 30,
        left: rect.left + rect.width / 2 - 30,
      });
      setAnimationKey(Date.now());
    }
    window.setTimeout(() => {
      add({
        itemType: "accessory",
        // Cart receives the real, variant-specific slug/name/price — not the
        // group key — so KCM/checkout dispatch the correct SKU.
        slug: committedVariant.slug,
        name: committedVariant.name,
        priceUah: committedVariant.price,
        unitPriceUah: committedFinalPrice,
        image: committedThumb,
        colorCode: committedSwatch?.code,
        colorName: committedSwatch?.label,
      });
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1500);
    }, FLY_DURATION_MS);
  }

  // Photo arrows should not navigate to details page.
  function flipPhoto(e: React.MouseEvent<HTMLButtonElement>, delta: number) {
    e.preventDefault();
    e.stopPropagation();
    if (swatches.length > 1) {
      setHoverIdx(null);
      setSelectedIdx((i) => (i + delta + swatches.length) % swatches.length);
      return;
    }
    if (fallbackGallery.length > 1) {
      setGalleryIdx(
        (i) => (i + delta + fallbackGallery.length) % fallbackGallery.length,
      );
    }
  }

  // Detail link always points at the *committed* (clicked) variant slug so the
  // detail page opens the exact same SKU the user will see in the cart.
  const detailHref = committedSwatch
    ? `/catalog/${committedVariant.slug}?color=${encodeURIComponent(
        committedSwatch.label,
      )}`
    : `/catalog/${committedVariant.slug}`;

  return (
    <>
      <div
        className={cn(
          "sku-glow card-frame-md group relative flex flex-col overflow-hidden motion-reduce:transform-none",
          className,
        )}
        style={{ ["--sku" as string]: "var(--primary)" }}
      >
        {/* Image area */}
        <Link
          href={detailHref}
          className="relative block aspect-square overflow-hidden"
        >
          {heroUrl ? (
            <Image
              key={heroUrl}
              src={heroUrl}
              alt={displayImage?.alt || activeVariant.name}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              quality={85}
              className="object-cover transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
              Без фото
            </div>
          )}

          {activeVariant.badge && (
            <span
              className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black"
              style={{
                background:
                  activeVariant.badge.hex || "var(--sku-pulsar, #ffc857)",
              }}
            >
              {activeVariant.badge.text}
            </span>
          )}
          {activeVariant.newItem && !activeVariant.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
              Новинка
            </span>
          )}
          {activeVariant.preorder && (
            <span className="absolute right-3 top-3 rounded-full border border-border bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
              Передзамовлення
            </span>
          )}
          {hasDiscount && (
            <span className="absolute bottom-3 left-3 rounded-sm bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
              −{discountPct}%
            </span>
          )}
          {hasManyPhotos && (
            <>
              <button
                type="button"
                onClick={(e) => flipPhoto(e, -1)}
                aria-label="Попереднє фото"
                className={cn(
                  "absolute left-2 top-1/2 z-20 -translate-y-1/2",
                  "flex size-8 items-center justify-center rounded-full",
                  "border border-white/10 bg-background/70 text-foreground backdrop-blur",
                  "transition-all duration-300 ease-out",
                  "hover:scale-105 hover:border-white/25 hover:bg-background",
                  "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                )}
              >
                <ChevronLeft className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={(e) => flipPhoto(e, 1)}
                aria-label="Наступне фото"
                className={cn(
                  "absolute right-2 top-1/2 z-20 -translate-y-1/2",
                  "flex size-8 items-center justify-center rounded-full",
                  "border border-white/10 bg-background/70 text-foreground backdrop-blur",
                  "transition-all duration-300 ease-out",
                  "hover:scale-105 hover:border-white/25 hover:bg-background",
                  "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                )}
              >
                <ChevronRight className="size-4" strokeWidth={2} />
              </button>
              <div className="tabular absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
                {swatches.length > 1 ? selectedIdx + 1 : galleryIdx + 1} /{" "}
                {swatches.length > 1 ? swatches.length : fallbackGallery.length}
              </div>
            </>
          )}
        </Link>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            {/*
              Structural labels (category + name) are anchored to the
              *committed* variant — the one the user actually picked. Hover
              previews on swatches only affect visual attributes (image, price,
              discount %, preorder pill, badge). Without this, hovering a
              swatch whose variant happens to have no `category` field would
              make the category row disappear and the card would shift upward.

              We also pick the first variant that actually has a category as a
              fallback, so a missing field on the committed variant can't blank
              out the line either.
            */}
            {(() => {
              const anchoredCategory =
                committedVariant.category ??
                group.variants.find((v) => v.category)?.category;
              return anchoredCategory ? (
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {anchoredCategory.name}
                </div>
              ) : null;
            })()}
            <Link
              href={detailHref}
              className="font-heading text-base font-bold uppercase leading-tight tracking-wide transition-colors duration-300 ease-out hover:text-primary group-hover:text-primary"
            >
              {committedVariant.name}
            </Link>
          </div>

          {/* Swatches — when the group has >1 variant these represent the
              actual variants (cart-safe). Otherwise they represent the single
              variant's own colour photos. */}
          {swatches.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {swatches.map((s, i) => {
                const active = i === selectedIdx;
                return (
                  <button
                    key={s.key}
                    type="button"
                    aria-label={s.label}
                    title={s.label}
                    onClick={() => setSelectedIdx(i)}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    className={cn(
                      "relative size-5 rounded-full border transition",
                      active
                        ? "border-foreground ring-1 ring-foreground/40 ring-offset-1 ring-offset-background"
                        : "border-border hover:border-white/40",
                    )}
                    style={{ background: s.hex || "#999" }}
                  />
                );
              })}
              {activeSwatch && (
                <span className="ml-1 truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                  {activeSwatch.label}
                </span>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="mt-auto space-y-3">
            <div className="flex items-baseline gap-2">
              <div className="font-heading tabular text-xl font-bold">
                {formatPrice(finalPrice)}
              </div>
              {hasDiscount && (
                <div className="tabular text-xs text-muted-foreground line-through">
                  {formatPrice(activeVariant.price)}
                </div>
              )}
            </div>
            <TechButton
              size="sm"
              variant="inverse"
              className="w-full h-9 font-heading tracking-normal"
              onClick={handleAdd}
              disabled={justAdded}
            >
              {justAdded ? (
                <>
                  <Check className="mr-1 size-3.5" strokeWidth={2.5} />
                  Додано
                </>
              ) : activeVariant.preorder ? (
                "Передзамовити"
              ) : (
                "Купити"
              )}
            </TechButton>
            <Link
              href={detailHref}
              className="group/more flex items-center justify-center gap-1 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
            >
              Детальніше · характеристики
              <ArrowRight className="size-3 transition group-hover/more:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {animationKey !== null && startPos && thumbUrl && (
        <AddToCartAnimation
          animationKey={animationKey}
          startPos={startPos}
          image={thumbUrl}
        />
      )}
    </>
  );
}
