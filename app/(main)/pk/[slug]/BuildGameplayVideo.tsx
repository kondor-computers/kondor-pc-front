"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";

function detectYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m?.[1] ?? null;
}

export function BuildGameplayVideo({
  videoUrl,
  posterUrl,
  buildName,
}: {
  videoUrl: string;
  posterUrl?: string;
  buildName: string;
}) {
  const [playing, setPlaying] = useState(false);
  const youTubeId = detectYouTubeId(videoUrl);

  return (
    <div className="relative mx-auto max-w-4xl">
      <div
        className="sku-glow group relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-border bg-background"
        style={{ ["--sku" as string]: "var(--brand-primary)" }}
      >
        {playing ? (
          youTubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0`}
              title={`Реальні тести ${buildName}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            <video
              src={videoUrl}
              poster={posterUrl}
              controls
              autoPlay
              playsInline
              className="absolute inset-0 size-full object-cover"
            />
          )
        ) : (
          <>
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={`Реальні тести ${buildName}`}
                fill
                sizes="(min-width: 896px) 896px, 100vw"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 60% at 50% 40%, color-mix(in srgb, var(--sku) 60%, transparent), transparent 70%)",
                }}
              />
            )}
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Переглянути відео реальних тестів"
              className="relative flex size-20 items-center justify-center rounded-full bg-foreground/90 text-background transition group-hover:scale-105"
            >
              <Play className="ml-1 size-8" fill="currentColor" />
            </button>
            <div className="absolute bottom-4 left-4 text-[11px] uppercase tracking-wider text-muted-foreground">
              реальний геймплей
            </div>
          </>
        )}
      </div>
    </div>
  );
}
