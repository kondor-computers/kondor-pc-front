"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChassisArt } from "@/components/brand/ChassisArt";
import { lockBodyScroll } from "@/lib/bodyScrollLock";
import { cn } from "@/lib/utils";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), {
  ssr: false,
});

type InternalSlide =
  | { kind: "image"; src: string }
  | {
      kind: "video";
      src: string;
      isYouTube: boolean;
      youTubeId?: string;
      poster?: string;
    };

function detectYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m?.[1] ?? null;
}

export function ProductGallery({
  images,
  videoUrl,
  videoPosterUrl,
  alt,
  priority = false,
  /** When true, slide 0 is transparent — server LCP image shows through. */
  overlayMode = false,
  className,
}: {
  images: string[];
  videoUrl?: string;
  videoPosterUrl?: string;
  alt: string;
  priority?: boolean;
  overlayMode?: boolean;
  className?: string;
}) {
  const galleryGlowStyle = { ["--sku" as string]: "var(--brand-primary)" };

  const slides = useMemo<InternalSlide[]>(() => {
    const imageSlides = images.map<InternalSlide>((src) => ({
      kind: "image",
      src,
    }));
    if (!videoUrl) return imageSlides;
    const youTubeId = detectYouTubeId(videoUrl);
    return [
      ...imageSlides,
      {
        kind: "video",
        src: videoUrl,
        isYouTube: Boolean(youTubeId),
        youTubeId: youTubeId ?? undefined,
        poster: videoPosterUrl,
      },
    ];
  }, [images, videoUrl, videoPosterUrl]);

  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    void import("yet-another-react-lightbox/styles.css");
    void import("yet-another-react-lightbox/plugins/thumbnails.css");
    void import("yet-another-react-lightbox/plugins/counter.css");
  }, [lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    return lockBodyScroll();
  }, [lightboxOpen]);
  const stageRef = useRef<HTMLDivElement>(null);
  const hasMany = slides.length > 1;
  const current = slides[index];
  const deferStageMedia =
    overlayMode && index === 0 && current?.kind === "image";
  const showStageGlow = !overlayMode || !deferStageMedia;

  const go = useCallback(
    (delta: number) => {
      if (slides.length === 0) return;
      setIndex((i) => (i + delta + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (!hasMany) return;
    let inView = false;
    const stage = stageRef.current;
    if (!stage) return;
    const obs = new IntersectionObserver(
      ([entry]) => (inView = entry.isIntersecting),
      { threshold: 0.4 },
    );
    obs.observe(stage);
    const onKey = (e: KeyboardEvent) => {
      if (!inView || lightboxOpen) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(+1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      obs.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [go, hasMany, lightboxOpen]);

  if (slides.length === 0) {
    return (
      <div className={className}>
        <div
          className="sku-glow relative aspect-[4/3] w-full overflow-hidden rounded-lg"
          style={galleryGlowStyle}
        >
          <ChassisArt className="absolute inset-0 size-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* STAGE */}
      <div
        ref={stageRef}
        className={cn(
          "relative w-full overflow-hidden rounded-lg aspect-[4/3]",
          overlayMode && "absolute inset-x-0 top-0 z-10",
          showStageGlow && "sku-glow",
        )}
        style={showStageGlow ? galleryGlowStyle : undefined}
      >
        {!overlayMode && (
          <ChassisArt className="absolute inset-0 size-full rounded-lg" />
        )}

        {current?.kind === "image" && !deferStageMedia ? (
          <Image
            key={current.src}
            src={current.src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 620px, 90vw"
            priority={priority && index === 0}
            className="absolute inset-0 z-10 object-cover"
          />
        ) : current?.kind === "video" ? (
          <VideoStage
            key="video-stage"
            slide={current}
            visible
            onOpen={() => setLightboxOpen(true)}
            alt={alt}
          />
        ) : null}

        {/* Click stage to open lightbox (skip when video — video has its own play button) */}
        {current?.kind === "image" && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Відкрити на весь екран"
            className="absolute inset-0 z-[15]"
          />
        )}

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Попереднє фото"
              className={cn(
                "absolute left-3 top-1/2 z-20 -translate-y-1/2",
                "flex size-10 items-center justify-center rounded-full",
                "bg-background/70 border border-white/10 text-foreground backdrop-blur",
                "transition-all duration-300 ease-out",
                "hover:bg-background hover:border-white/25 hover:scale-105",
                "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              )}
            >
              <ChevronLeft className="size-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => go(+1)}
              aria-label="Наступне фото"
              className={cn(
                "absolute right-3 top-1/2 z-20 -translate-y-1/2",
                "flex size-10 items-center justify-center rounded-full",
                "bg-background/70 border border-white/10 text-foreground backdrop-blur",
                "transition-all duration-300 ease-out",
                "hover:bg-background hover:border-white/25 hover:scale-105",
                "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              )}
            >
              <ChevronRight className="size-5" strokeWidth={2} />
            </button>
            <div className="tabular absolute right-3 top-3 z-20 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
              {index + 1} / {slides.length}
            </div>
          </>
        )}
      </div>

      {/* THUMBNAILS */}
      {hasMany && (
        <div
          className="mt-3 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))`,
          }}
        >
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Перейти до ${slide.kind === "video" ? "відео" : `фото ${i + 1}`}`}
              aria-current={i === index}
              className={cn(
                "group/thumb relative aspect-square overflow-hidden rounded-md border transition-all duration-300 ease-out",
                i === index
                  ? "border-foreground ring-2 ring-foreground/30"
                  : "border-border hover:border-white/25 opacity-70 hover:opacity-100",
              )}
            >
              {slide.kind === "image" ? (
                <Image
                  src={slide.src}
                  alt=""
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              ) : (
                <>
                  <ChassisArt compact className="absolute inset-0 size-full" />
                  {slide.poster && (
                    <Image
                      src={slide.poster}
                      alt=""
                      fill
                      sizes="150px"
                      className="relative z-10 object-cover"
                    />
                  )}
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
                    <div className="flex size-8 items-center justify-center rounded-full bg-foreground/90 text-background">
                      <Play
                        className="ml-0.5 size-3.5"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-1 left-1 z-20 rounded-[4px] bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                    Відео
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* LIGHTBOX */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        noScroll={{ disabled: true }}
        index={index}
        on={{
          view: ({ index: i }) => setIndex(i),
        }}
        slides={slides.map((slide) =>
          slide.kind === "image"
            ? { src: slide.src }
            : // Video slide — use custom payload; rendered via `render.slide` below.
              {
                src: slide.src,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: "video" as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                isYouTube: slide.isYouTube as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                youTubeId: slide.youTubeId as any,
                poster: slide.poster,
              },
        )}
        render={{
          slide: ({ slide }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const s = slide as any;
            if (s.type !== "video") return undefined;
            if (s.isYouTube && s.youTubeId) {
              return (
                <div className="relative aspect-video w-full max-w-5xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${s.youTubeId}?autoplay=1&rel=0`}
                    title="Відео збірки"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="size-full rounded-lg"
                  />
                </div>
              );
            }
            return (
              <video
                src={s.src}
                poster={s.poster}
                controls
                autoPlay
                playsInline
                className="max-h-[85vh] max-w-[95vw] rounded-lg"
              />
            );
          },
        }}
        animation={{ fade: 300, swipe: 200 }}
        carousel={{ finite: false }}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: "rgba(4, 6, 10, 0.92)" },
        }}
      />
    </div>
  );
}

function VideoStage({
  slide,
  visible,
  onOpen,
  alt,
}: {
  slide: Extract<InternalSlide, { kind: "video" }>;
  visible: boolean;
  onOpen: () => void;
  alt: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        visible ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <ChassisArt className="absolute inset-0 size-full" />
      {slide.poster && (
        <Image
          src={slide.poster}
          alt={visible ? alt : ""}
          fill
          sizes="(min-width: 1024px) 620px, 90vw"
          className="relative z-10 object-cover"
        />
      )}
      <button
        type="button"
        onClick={onOpen}
        aria-label="Відтворити відео збірки"
        className={cn(
          "absolute inset-0 z-20 flex items-center justify-center bg-black/30",
          "transition-colors duration-300 hover:bg-black/40",
        )}
      >
        <div
          className={cn(
            "flex size-20 items-center justify-center rounded-full",
            "bg-foreground/90 text-background shadow-[0_0_40px_rgba(255,255,255,0.25)]",
            "transition-transform duration-300 hover:scale-105 active:scale-95",
          )}
        >
          <Play className="ml-1 size-8" fill="currentColor" strokeWidth={0} />
        </div>
      </button>
      <div className="absolute bottom-3 left-3 z-30 rounded-[4px] bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
        Відео збірки
      </div>
    </div>
  );
}
