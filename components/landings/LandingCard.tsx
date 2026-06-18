import Image from "next/image";
import Link from "next/link";
import { contentImageUrl } from "@/lib/sanity/contentClient";
import type { LandingPagePreview } from "@/lib/sanity/landingAdapter";

interface LandingCardProps {
  landing: LandingPagePreview;
  hrefPrefix?: "game-pc" | "promo";
}

export default function LandingCard({
  landing,
  hrefPrefix = "game-pc",
}: LandingCardProps) {
  const { image, title, description, slug } = landing;

  return (
    <Link
      href={`/${hrefPrefix}/${slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand-primary/60"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {image?.asset ? (
          <Image
            src={contentImageUrl(image).width(800).auto("format").url()}
            fill
            alt={image?.alt || title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-elevated" />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-5 lg:p-6">
        <div>
          <h3 className="mb-3 font-display text-[16px] font-bold uppercase leading-[120%] tracking-tight text-foreground lg:text-[20px]">
            {title}
          </h3>
          {description ? (
            <p className="line-clamp-4 text-[13px] leading-[150%] text-muted-foreground lg:text-[14px]">
              {description}
            </p>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.2em] text-brand-primary transition-transform group-hover:translate-x-1">
          Детальніше <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
