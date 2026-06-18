import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { TechButtonDisplay } from "@/components/shared/TechButtonPrimitives";
import { formatPrice } from "@/lib/format";
import { urlFor } from "@/lib/sanity/image";
import { cn } from "@/lib/utils";
import type {
  CatalogProductGroup,
  SanityImageRef,
} from "@/types/catalog";

function imageUrl(source: SanityImageRef | undefined, size: number) {
  return source?.asset
    ? urlFor(source).width(size).height(size).fit("crop").quality(80).url()
    : undefined;
}

/** Server-rendered accessory card — no cart / swatch JS on the listing. */
export function CatalogCardStatic({
  group,
  priority = false,
  className,
}: {
  group: CatalogProductGroup;
  priority?: boolean;
  className?: string;
}) {
  const variant = group.variants[0];
  const heroImage = variant.heroImage;
  const heroUrl = imageUrl(heroImage, 640);

  const hasDiscount =
    typeof variant.priceDiscount === "number" &&
    variant.priceDiscount < variant.price;
  const finalPrice = hasDiscount ? variant.priceDiscount! : variant.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((variant.price - variant.priceDiscount!) / variant.price) * 100,
      )
    : 0;

  const category =
    variant.category ?? group.variants.find((v) => v.category)?.category;
  const detailHref = `/catalog/${variant.slug}`;

  return (
    <div
      className={cn(
        "sku-glow card-frame-md group relative flex flex-col overflow-hidden motion-reduce:transform-none",
        className,
      )}
      style={{ ["--sku" as string]: "var(--primary)" }}
    >
      <Link
        href={detailHref}
        className="relative block aspect-square overflow-hidden"
      >
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={heroImage?.alt || variant.name}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 90vw"
            priority={priority}
className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
            Без фото
          </div>
        )}

        {variant.badge && (
          <span
            className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black"
            style={{
              background: variant.badge.hex || "var(--sku-pulsar, #ffc857)",
            }}
          >
            {variant.badge.text}
          </span>
        )}
        {variant.newItem && !variant.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
            Новинка
          </span>
        )}
        {variant.preorder && (
          <span className="absolute right-3 top-3 rounded-full border border-border bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
            Передзамовлення
          </span>
        )}
        {hasDiscount && (
          <span className="absolute bottom-3 left-3 rounded-sm bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
            −{discountPct}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {category ? (
            <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              {category.name}
            </div>
          ) : null}
          <Link
            href={detailHref}
            className="font-heading text-base font-bold uppercase leading-tight tracking-wide transition-colors duration-300 ease-out hover:text-primary group-hover:text-primary"
          >
            {variant.name}
          </Link>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="font-heading tabular text-xl font-bold">
              {formatPrice(finalPrice)}
            </div>
            {hasDiscount && (
              <div className="tabular text-xs text-muted-foreground line-through">
                {formatPrice(variant.price)}
              </div>
            )}
          </div>
          <TechButtonDisplay
            size="sm"
            variant="inverse"
            className="w-full h-9 font-heading tracking-normal"
          >
            {variant.preorder ? "Передзамовити" : "Купити"}
          </TechButtonDisplay>
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
  );
}
