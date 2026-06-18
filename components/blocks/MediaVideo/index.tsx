"use client";

import {useState} from "react";
import Image from "next/image";
import type {ImageAsset} from "@/lib/data/types/content";

function detectYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m?.[1] ?? null;
}

function detectVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1] ?? null;
}

/**
 * MediaVideo — embed YouTube/Vimeo з опціональним poster для preload.
 * Дані з Sanity секції `mediaVideo`.
 */
export function MediaVideo({
  videoUrl,
  caption,
  posterImage,
}: {
  videoUrl: string;
  caption?: string;
  posterImage?: ImageAsset;
}) {
  const [playing, setPlaying] = useState(false);
  const youTubeId = detectYouTubeId(videoUrl);
  const vimeoId = !youTubeId ? detectVimeoId(videoUrl) : null;
  const embedSrc = youTubeId
    ? `https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0`
    : vimeoId
      ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1`
      : null;

  return (
    <div className="container-site py-12 md:py-16">
      <figure>
        <div className="relative aspect-video w-full overflow-hidden clip-angular-12 border border-border bg-surface">
          {playing && embedSrc ? (
            <iframe
              src={embedSrc}
              title={caption || "Відео"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            <>
              {posterImage?.src ? (
                <Image
                  src={posterImage.src}
                  alt={posterImage.alt || caption || "Відео"}
                  fill
                  sizes="(min-width: 1280px) 1280px, 100vw"
                  className="object-cover"
                />
              ) : (
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-br from-surface via-background to-surface"
                />
              )}
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="absolute inset-0 grid place-items-center bg-black/30 transition-colors hover:bg-black/40"
                aria-label="Відтворити відео"
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-brand-primary text-black shadow-lg md:size-20">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="ml-1 size-8 md:size-10"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>
            </>
          )}
        </div>
        {caption ? (
          <figcaption className="mt-2 text-center text-sm italic text-muted-foreground/80">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}
