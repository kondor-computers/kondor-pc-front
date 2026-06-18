import { Star } from "lucide-react";
import type { Review } from "@/types/build";
import { cn } from "@/lib/utils";
import Image from "next/image";

const PLATFORM_LABEL: Record<Review["sourcePlatform"], string> = {
  google: "Google Maps",
  instagram: "Instagram",
  telegram: "Telegram",
  direct: "Прямий відгук",
};

export function ReviewCard({
  review,
  className,
}: {
  review: Review;
  className?: string;
}) {
  return (
    <article
      className={cn("card-frame-md flex h-full flex-col gap-4 p-5", className)}
    >
      <div className="relative w-full aspect-[290/146]">
        <Image
          src={review.imageUrl}
          alt={review.authorName}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{review.authorName}</div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-3.5",
                  i < review.rating
                    ? "fill-foreground text-foreground"
                    : "text-muted-foreground/30",
                )}
                strokeWidth={1.5}
              />
            ))}
            <span className="ml-1 text-[12px] md:text-[8px] lg:text-[10px] xl:text-[12px]">
              · {PLATFORM_LABEL[review.sourcePlatform]}
            </span>
          </div>
        </div>
        {review.isVerified && (
          <div className="rounded-full border border-border bg-background/50 px-2 py-0.5 text-[10px] md:text-[7px] lg:text-[10px] uppercase tracking-wider text-muted-foreground">
            Перевірено
          </div>
        )}
      </div>
      <p className="text-sm leading-[120%] text-muted-foreground">
        {review.text}
      </p>
      {review.relatedBuildSlug && (
        <div className="mt-auto text-[11px] uppercase tracking-wider text-muted-foreground/70">
          Збірка · {review.relatedBuildSlug.toUpperCase()}
        </div>
      )}
    </article>
  );
}
