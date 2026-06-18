import Image from "next/image";
import type {ImageAsset} from "@/lib/data/types/content";

type AspectRatio = "16/9" | "21/9" | "4/3" | "1/1";

const ASPECT_CLASS: Record<AspectRatio, string> = {
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
};

export function ImageFull({
  image,
  caption,
  aspectRatio = "16/9",
}: {
  image?: ImageAsset;
  caption?: string;
  aspectRatio?: AspectRatio;
}) {
  return (
    <div className="container-site py-12 md:py-16">
      <figure>
        <div
          className={`relative w-full overflow-hidden clip-angular-12 border border-border bg-surface ${ASPECT_CLASS[aspectRatio]}`}
        >
          {image?.src ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
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
                  backgroundSize: "40px 40px",
                }}
              />
              <div
                aria-hidden
                className="absolute -bottom-24 left-1/2 size-[60%] -translate-x-1/2 rounded-full bg-brand-primary/15 blur-3xl"
              />
              <div className="absolute inset-0 grid place-items-center">
                <div className="px-8 text-center text-xs uppercase tracking-widest text-muted-foreground">
                  {image?.alt || "Зображення"}
                </div>
              </div>
            </>
          )}
        </div>
        {caption || image?.caption ? (
          <figcaption className="mt-2 text-center text-sm italic text-muted-foreground/80">
            {caption ?? image?.caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}
