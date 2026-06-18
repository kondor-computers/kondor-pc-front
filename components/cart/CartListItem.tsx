"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { ChassisArt } from "@/components/brand/ChassisArt";
import { SKU_ACCENTS, type SkuSlug } from "@/lib/sku-accents";
import { formatPrice } from "@/lib/format";
import { useCartStore, type CartItem } from "@/lib/cartStore";
import { cn } from "@/lib/utils";

const cartItemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: { duration: 0.2, ease: [0.42, 0, 1, 1] as const },
  },
};

export function CartListItem({
  item,
  onNavigate,
}: {
  item: CartItem;
  onNavigate?: () => void;
}) {
  const { setQuantity, remove, lineKey } = useCartStore();
  const key = lineKey({
    slug: item.slug,
    options: item.options,
    colorCode: item.colorCode,
  });

  const isBuild = item.itemType === "build";
  const accent = isBuild ? SKU_ACCENTS[item.slug as SkuSlug] : undefined;

  const imageSrc = item.image ?? undefined;

  const href = isBuild ? `/pk/${item.slug}` : `/catalog/${item.slug}`;

  return (
    <motion.li
      layout
      variants={cartItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative overflow-hidden rounded-md border border-border bg-surface/80 p-3"
      style={accent ? { ["--sku" as string]: accent } : undefined}
    >
      {accent && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full opacity-20 blur-2xl"
          style={{ background: "var(--brand-primary)" }}
        />
      )}
      <div className="relative flex gap-3">
        <Link
          href={href}
          onClick={onNavigate}
          className="relative block size-18 shrink-0 overflow-hidden rounded-md"
          style={{ width: 72, height: 72 }}
        >
          {isBuild && (
            <ChassisArt compact className="absolute inset-0 size-full" />
          )}
          {imageSrc && (
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="72px"
              className="relative z-10 object-cover"
            />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={href}
              onClick={onNavigate}
              className="font-display text-sm font-bold uppercase leading-tight tracking-wider hover:opacity-80"
            >
              {item.name}
            </Link>
            <button
              type="button"
              onClick={() => remove(key)}
              aria-label="Видалити"
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>

          {item.colorName && (
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Колір: <span className="text-foreground">{item.colorName}</span>
            </div>
          )}

          {item.options && item.options.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
              {item.options.map((o) => (
                <li key={o.groupId}>
                  <span className="text-foreground">{o.groupLabel}:</span>{" "}
                  {o.optionLabel}
                </li>
              ))}
            </ul>
          )}

          <div className="tabular mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Зменшити"
                onClick={() => setQuantity(key, item.quantity - 1)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md border border-border transition",
                  "hover:bg-accent disabled:opacity-40",
                )}
              >
                <Minus className="size-3" strokeWidth={2.5} />
              </button>
              <span className="w-7 text-center text-sm font-semibold">
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label="Збільшити"
                onClick={() => setQuantity(key, item.quantity + 1)}
                className="flex size-7 items-center justify-center rounded-md border border-border transition hover:bg-accent"
              >
                <Plus className="size-3" strokeWidth={2.5} />
              </button>
            </div>
            <div className="font-heading text-sm font-bold">
              {formatPrice(item.unitPriceUah * item.quantity)}
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
