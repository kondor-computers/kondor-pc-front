"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Expand } from "lucide-react";
import { lockBodyScroll } from "@/lib/bodyScrollLock";
import { cn } from "@/lib/utils";
import { useCatalogDetail } from "./CatalogDetailProvider";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), {
  ssr: false,
});

export function CatalogGalleryOverlay() {
  const {
    item,
    variantIdx,
    photoIdx,
    setPhotoIdx,
    photoUrls,
    activePhoto,
    hasDiscount,
    discountPct,
    badgeAccent,
  } = useCatalogDetail();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const photos = photoUrls.filter((u): u is NonNullable<typeof u> => u !== null);
  const hasMany = photos.length > 1;
  const deferStageMedia = variantIdx === 0 && photoIdx === 0;

  useEffect(() => {
    if (!lightboxOpen) return;
    void import("yet-another-react-lightbox/styles.css");
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    return lockBodyScroll();
  }, [lightboxOpen]);

  if (!activePhoto) return null;

  return (
    <div className="contents">
      <div
        className={cn(
          "group absolute inset-x-0 top-0 z-10 aspect-square overflow-hidden rounded-md",
          !deferStageMedia && "card-frame-md bg-surface/40",
        )}
      >
        {activePhoto && !deferStageMedia ? (
          <Image
            key={activePhoto.main}
            src={activePhoto.main}
            alt={activePhoto.alt || item.name}
            fill
            sizes="(min-width: 1024px) 640px, 90vw"
            className="absolute inset-0 object-cover"
          />
        ) : null}

        {activePhoto && (
          <>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="Відкрити на весь екран"
              className="absolute inset-0 z-[5] cursor-zoom-in"
            />
            <div className="pointer-events-none absolute right-4 bottom-4 z-[6] flex size-8 items-center justify-center rounded-full border border-white/15 bg-background/70 opacity-70 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
              <Expand className="size-3.5" strokeWidth={2} />
            </div>
          </>
        )}

        {hasDiscount && (
          <span className="absolute left-4 top-4 z-10 rounded-sm bg-foreground px-2 py-0.5 text-xs font-bold text-background">
            −{discountPct}%
          </span>
        )}
        {item.badge && (
          <span
            className="absolute right-4 top-4 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black"
            style={{ background: badgeAccent || "#ffc857" }}
          >
            {item.badge.text}
          </span>
        )}
        {hasMany && (
          <div className="tabular pointer-events-none absolute bottom-4 left-4 z-10 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
            {photoIdx + 1} / {photos.length}
          </div>
        )}
      </div>

      {hasMany && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {photoUrls.map((u, i) => {
            if (!u) return null;
            return (
              <button
                key={u.thumb + i}
                type="button"
                onClick={() => setPhotoIdx(i)}
                aria-label={`Фото ${i + 1}`}
                aria-current={i === photoIdx}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border transition-all duration-200",
                  i === photoIdx
                    ? "border-foreground ring-2 ring-foreground/30"
                    : "border-border opacity-70 hover:border-white/25 hover:opacity-100",
                )}
              >
                <Image
                  src={u.thumb}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        noScroll={{ disabled: true }}
        index={photoIdx}
        on={{
          view: ({ index: i }) => setPhotoIdx(i),
        }}
        slides={photos.map((u) => ({ src: u.full, alt: u.alt }))}
        animation={{ fade: 250, swipe: 200 }}
        carousel={{ finite: false }}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: "rgba(4, 6, 10, 0.94)" },
        }}
      />
    </div>
  );
}
