import Image from "next/image";
import { cn } from "@/lib/utils";

interface GameStyle {
  from: string;
  to: string;
  accent: string;
  emoji: string;
}

const GAME_STYLES: Record<string, GameStyle> = {
  cs2: { from: "#c43b15", to: "#520000", accent: "#ff9d20", emoji: "🎯" },
  warzone: { from: "#b15300", to: "#3c0000", accent: "#f5a400", emoji: "🎖️" },
  gta5: { from: "#008b35", to: "#002400", accent: "#95db6c", emoji: "🚗" },
  fortnite: { from: "#6159e1", to: "#210059", accent: "#b7a2ff", emoji: "⚡" },
  dota2: { from: "#9e141e", to: "#360000", accent: "#ff6853", emoji: "⚔️" },
  valorant: { from: "#c4334f", to: "#47000b", accent: "#ff7c90", emoji: "💥" },
  minecraft: { from: "#00793d", to: "#002100", accent: "#56d57b", emoji: "⛏️" },
  cyberpunk: { from: "#a56100", to: "#3b0200", accent: "#f3cb00", emoji: "🌆" },
  pubg: { from: "#8a5619", to: "#2e0700", accent: "#eca851", emoji: "🪖" },
  apex: { from: "#c13a46", to: "#450005", accent: "#ff827b", emoji: "🏹" },
};

const DEFAULT_STYLE: GameStyle = {
  from: "#292e38",
  to: "#070b14",
  accent: "#9cafce",
  emoji: "🎮",
};

export function GameTile({
  slug,
  name,
  ukrName,
  heavy,
  coverImageUrl,
  className,
  size = "md",
  imageOnly = false,
  priority = false,
}: {
  slug: string;
  name: string;
  ukrName?: string;
  heavy?: boolean;
  coverImageUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Лише обкладинка без емодзі, сітки та підписів */
  imageOnly?: boolean;
  /** Preload cover — use for above-the-fold tiles only. */
  priority?: boolean;
}) {
  const style = GAME_STYLES[slug] ?? DEFAULT_STYLE;
  const titleSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl md:text-2xl",
  }[size];

  if (imageOnly) {
    return (
      <div
        className={cn("relative overflow-hidden rounded-md", className)}
        style={
          coverImageUrl
            ? undefined
            : {
                backgroundImage: `linear-gradient(135deg, ${style.from}, ${style.to})`,
              }
        }
      >
        {coverImageUrl && (
          <>
            <Image
              src={coverImageUrl}
              alt={ukrName || name}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              priority={priority}
className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 15%, #00000014 45%, #000000cc 100%)",
              }}
            />
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div
            className={cn(
              "font-heading font-semibold uppercase leading-[120%] tracking-wide text-white",
              titleSize,
            )}
          >
            {ukrName || name}
          </div>
          {heavy && (
            <div className="mt-1 text-[10px] uppercase tracking-wider text-white/70">
              Вимоглива
            </div>
          )}
        </div>
      </div>
    );
  }

  const emojiSize = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
  }[size];

  const withCover = Boolean(coverImageUrl);

  return (
    <div
      className={cn("relative overflow-hidden rounded-md", className)}
      style={
        withCover
          ? undefined
          : {
              backgroundImage: `linear-gradient(135deg, ${style.from}, ${style.to})`,
            }
      }
      aria-hidden
    >
      {/* Cover image backdrop (preferred) */}
      {withCover && (
        <Image
          src={coverImageUrl!}
          alt=""
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          priority={priority}
className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
      )}

      {/* Dark gradient overlay for text readability */}
      {withCover && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 10%, #0000001a 40%, #000000d9 100%)",
          }}
        />
      )}

      {/* Grid pattern overlay (subtler when cover present) */}
      <svg
        className={cn(
          "absolute inset-0 size-full",
          withCover ? "opacity-[0.08]" : "opacity-[0.12]",
        )}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`grid-${slug}`}
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 18 0 L 0 0 0 18"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${slug})`} />
      </svg>

      {/* Accent glow corner */}
      <div
        className="absolute -right-6 -top-6 size-24 rounded-full blur-2xl"
        style={{ background: style.accent, opacity: withCover ? 0.25 : 0.35 }}
      />

      {/* Top rim */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: style.accent, opacity: 0.7 }}
      />

      <div className="relative flex h-full flex-col justify-between p-4">
        <div
          className={cn(
            "leading-none",
            emojiSize,
            withCover && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]",
          )}
        >
          {style.emoji}
        </div>
        <div>
          <div
            className={cn(
              "font-heading font-semibold uppercase leading-[120%] tracking-wide",
              withCover && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]",
              titleSize,
            )}
          >
            {ukrName || name}
          </div>
          {heavy && (
            <div className="mt-1 text-[10px] uppercase tracking-wider text-white/60">
              Вимоглива
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
