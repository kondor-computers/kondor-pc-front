import Image from "next/image";
import { RichContent } from "@/components/blocks/RichContent";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import type { ContentNode, ImageAsset } from "@/lib/data/types/content";
import { cn } from "@/lib/utils";

export function ImageTextSplit({
  image,
  imagePosition = "left",
  heading,
  content,
  cta,
}: {
  image?: ImageAsset;
  imagePosition?: "left" | "right";
  heading?: string;
  content: ContentNode[];
  cta?: { text: string; href: string };
}) {
  return (
    <div className="container-site py-16 md:py-20">
      <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
        <div
          className={cn(
            "order-1",
            imagePosition === "right" && "lg:order-2",
          )}
        >
          <ImagePane image={image} />
        </div>

        <div
          className={cn(
            "order-2",
            imagePosition === "right" && "lg:order-1",
          )}
        >
          {heading ? (
            <h2 className="font-display text-[28px] font-bold uppercase leading-[120%] tracking-tight text-foreground lg:text-[40px]">
              {heading}
            </h2>
          ) : null}
          <RichContent nodes={content} />
          {cta ? (
            <div className="mt-8">
              <TechButtonLink
                href={cta.href}
                size="md"
                variant="primary"
                className="h-[44px] px-6"
              >
                {cta.text}
              </TechButtonLink>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ImagePane({ image }: { image?: ImageAsset }) {
  return (
    <figure className="relative">
      <div className="relative aspect-video w-full overflow-hidden clip-angular-12 border border-brand-primary/30 bg-surface">
        {image?.src ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <>
            <div
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div
              aria-hidden
              className="absolute -bottom-10 -right-10 size-48 rounded-full bg-brand-primary/30 blur-3xl"
            />
            <div className="absolute inset-0 grid place-items-center">
              <div className="px-6 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
                {image?.alt || "Зображення"}
              </div>
            </div>
          </>
        )}
      </div>
      {image?.caption ? (
        <figcaption className="mt-2 text-center text-sm italic text-muted-foreground/80">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
