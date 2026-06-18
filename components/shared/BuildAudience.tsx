"use client";

import { Target, Monitor, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fpsTier } from "@/lib/fps-thresholds";
import type { Build } from "@/types/build";

const RES_LABEL: Record<Build["targetResolution"], string> = {
  fullhd: "Full HD · 1920×1080",
  "2k": "2K · 2560×1440",
  "4k": "4K · 3840×2160",
};

function resolutionAudience(r: Build["targetResolution"]): string {
  switch (r) {
    case "fullhd":
      return "для 144+ Hz моніторів і компетитивних шутерів";
    case "2k":
      return "для плавного 2K без компромісів у деталях";
    case "4k":
      return "для кінематографічного 4K гри та стрімінгу";
  }
}

/**
 * "Для кого цей ПК" — 3-bullet self-qualification block.
 * Placed near the top of the detail page so non-technical buyers can decide
 * quickly if the spec matches their use-case, without parsing the FPS table.
 * All three bullets are derived from existing Build fields — no new schema.
 */
export function BuildAudience({
  build,
  gameLabels,
  className,
}: {
  build: Build;
  gameLabels?: Record<string, string>;
  className?: string;
}) {
  // Top games this build runs in the green tier at its target resolution.
  const greenGames = build.fps
    .filter(
      (f) => f.resolution === build.targetResolution && fpsTier(f.fpsAvg) === "green",
    )
    .sort((a, b) => b.fpsAvg - a.fpsAvg)
    .slice(0, 3)
    .map((f) => gameLabels?.[f.gameSlug] ?? f.gameSlug);

  const bullets: Array<{ icon: React.ComponentType<{ className?: string }>; kicker: string; text: string }> = [
    {
      icon: Target,
      kicker: "Кому підійде",
      text: build.shortTagline,
    },
    {
      icon: Monitor,
      kicker: "Роздільна здатність",
      text: `${RES_LABEL[build.targetResolution]} — ${resolutionAudience(build.targetResolution)}`,
    },
  ];

  if (greenGames.length > 0) {
    bullets.push({
      icon: Gamepad2,
      kicker: "Стабільно тримає",
      text: `${greenGames.join(", ")} — на високих у 144+ FPS`,
    });
  }

  return (
    <div
      className={cn(
        "grid gap-3 rounded-lg border border-border bg-surface/50 p-4 md:grid-cols-3",
        className,
      )}
    >
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
            <b.icon className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {b.kicker}
            </div>
            <div className="mt-0.5 text-sm leading-snug">{b.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
