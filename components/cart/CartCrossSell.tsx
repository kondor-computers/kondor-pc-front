"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import { useCartStore } from "@/lib/cartStore";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CatalogProductListItem } from "@/types/catalog";

/**
 * In-drawer accessory cross-sell.
 * Renders when the cart contains at least one "build" item — the moment of
 * peak intent for peripherals (keyboard / mouse / surface to pair with the PC).
 * Hidden when cart has only accessories to avoid recursive self-promotion.
 *
 * Data comes from the existing Kondor Devices Sanity `showonaddons` pool, fetched
 * once client-side. Project is public, no auth needed.
 */
export function CartCrossSell() {
  const items = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const [addons, setAddons] = useState<CatalogProductListItem[] | null>(null);

  const hasBuild = items.some((i) => i.itemType === "build");
  const accessorySlugsInCart = new Set(
    items.filter((i) => i.itemType === "accessory").map((i) => i.slug),
  );

  useEffect(() => {
    if (!hasBuild || addons !== null) return;
    let cancelled = false;
    fetch("/api/addons", { cache: "default" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CatalogProductListItem[]) => {
        if (!cancelled) setAddons(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setAddons([]);
      });
    return () => {
      cancelled = true;
    };
  }, [hasBuild, addons]);

  if (!hasBuild || !addons || addons.length === 0) return null;

  // Show top 3 that aren't already in the cart, preferring discounted items.
  const suggestions = addons
    .filter((a) => !accessorySlugsInCart.has(a.slug))
    .sort((a, b) => {
      const aDisc =
        typeof a.priceDiscount === "number" && a.priceDiscount < a.price
          ? 1
          : 0;
      const bDisc =
        typeof b.priceDiscount === "number" && b.priceDiscount < b.price
          ? 1
          : 0;
      return bDisc - aDisc;
    })
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <div className="border-t border-border bg-background/40 px-4 py-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Доповнити збірку
        </div>
        <Link
          href="/catalog"
          className="text-[11px] uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
        >
          Весь каталог →
        </Link>
      </div>
      <ul className="space-y-2">
        {suggestions.map((item) => {
          const hasDiscount =
            typeof item.priceDiscount === "number" &&
            item.priceDiscount < item.price;
          const finalPrice = hasDiscount ? item.priceDiscount! : item.price;
          const thumb = item.heroImage?.asset
            ? urlFor(item.heroImage)
                .width(160)
                .height(160)
                .fit("crop")
                .quality(85)
                .url()
            : undefined;
          return (
            <li
              key={item.id}
              className="relative flex items-center gap-3 rounded-md border border-border bg-surface/70 px-2.5 py-2 transition hover:border-white/20"
            >
              <Link
                href={`/catalog/${item.slug}`}
                aria-label={item.name}
                className="relative block size-12 shrink-0 overflow-hidden rounded-sm"
              >
                {thumb && (
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/catalog/${item.slug}`}
                  className="line-clamp-1 block text-xs font-semibold uppercase tracking-wide hover:opacity-80"
                >
                  {item.name}
                </Link>
                <div className="tabular mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-sm font-bold">
                    {formatPrice(finalPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      {formatPrice(item.price)}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                aria-label={`Додати ${item.name} в кошик`}
                onClick={() =>
                  add({
                    itemType: "accessory",
                    slug: item.slug,
                    name: item.name,
                    priceUah: item.price,
                    unitPriceUah: finalPrice,
                    image: thumb,
                  })
                }
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md",
                  "border border-border bg-background transition",
                  "hover:border-white/30 hover:bg-accent active:scale-95",
                )}
              >
                <Plus className="size-4" strokeWidth={2.5} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
