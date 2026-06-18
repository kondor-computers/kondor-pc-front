import Link from "next/link";
import { getBuildBySlug } from "@/lib/data/adapter";
import type { ResolvedPageContext } from "@/lib/data/types";
import type { FpsEntry } from "@/lib/data/types/build";
import { TechButtonDisplay } from "@/components/shared/TechButtonPrimitives";
import { cn } from "@/lib/utils";
import { formatUah } from "@/lib/format";

type Variant = "compact" | "full";

const PRESET_ORDER: Record<string, number> = {
  competitive: 5,
  high: 4,
  ultra: 3,
  medium: 2,
  low: 1,
};

function pickFpsForGame(
  fpsData: FpsEntry[],
  gameSlug: string | undefined,
): FpsEntry | null {
  if (!gameSlug) return null;
  const inGame = fpsData.filter((e) => e.gameSlug === gameSlug);
  if (inGame.length === 0) return null;
  return [...inGame].sort(
    (a, b) => PRESET_ORDER[b.preset] - PRESET_ORDER[a.preset],
  )[0];
}

const BADGE_STYLE: Record<string, string> = {
  хіт: "bg-brand-primary text-black",
  нова: "bg-fps-orange text-black",
  акція: "bg-fps-yellow text-black",
};

export async function BuildCardSingle({
  buildSlug,
  variant = "full",
  pageContext,
  className,
}: {
  buildSlug: string;
  variant?: Variant;
  pageContext?: ResolvedPageContext;
  className?: string;
}) {
  const build = await getBuildBySlug(buildSlug);
  if (!build) return null;

  const fps = pickFpsForGame(build.fpsData, pageContext?.refSlug);
  const sku = "var(--brand-primary)";

  return (
    <Link
      href={`/pk/${build.slug}`}
      className={cn(
        "card-frame-md group relative block overflow-hidden",
        "motion-reduce:transform-none",
        className,
      )}
      style={{ ["--sku" as string]: sku }}
    >
      <div
        aria-hidden
        className="sku-top-line pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-56 rounded-full opacity-25 blur-3xl transition-opacity duration-500 ease-out group-hover:opacity-40"
        style={{ background: "var(--sku)" }}
      />

      <div className="relative flex h-full flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-heading text-2xl font-bold uppercase tracking-wider">
              {build.name}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {build.tagline}
            </div>
          </div>
          {build.badge ? (
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                BADGE_STYLE[build.badge] ?? "bg-white text-black",
              )}
            >
              {build.badge}
            </span>
          ) : (
            <span
              aria-hidden
              className="mt-1 size-3 shrink-0 rounded-full ring-2 ring-background"
              style={{ background: "var(--sku)" }}
            />
          )}
        </header>

        {/* placeholder image area — uses SKU accent + grid pattern */}
        <div className="relative aspect-[4/3] w-full overflow-hidden clip-angular-sm border border-border bg-background/60">
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            aria-hidden
            className="absolute -bottom-12 -right-12 size-44 rounded-full opacity-50 blur-2xl"
            style={{ background: "var(--sku)" }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div className="font-display text-5xl font-black uppercase tracking-widest text-white/10">
              {build.name}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-1 text-sm">
          <Row label="CPU" value={build.cpu.name} />
          <Row label="GPU" value={`${build.gpu.name} · ${build.gpu.vram}`} />
          <Row label="RAM" value={`${build.ram.size} ${build.ram.type}`} />
          <Row
            label="SSD"
            value={`${build.storage.size} ${build.storage.type}`}
          />
        </dl>

        {variant === "full" && fps ? (
          <div className="tabular rounded-md border border-brand-primary/30 bg-brand-primary/[0.06] p-3">
            <div className="text-[10px] font-medium uppercase tracking-wider text-brand-primary">
              {pageContext?.game?.nameUk ?? "У грі"} · {fps.resolution} ·{" "}
              {fps.preset}
            </div>
            <div className="mt-1 font-heading text-2xl font-bold leading-none">
              {fps.fps}{" "}
              <span className="text-base font-semibold text-muted-foreground">
                FPS
              </span>
            </div>
          </div>
        ) : null}

        <div className="mt-auto space-y-3 pt-1">
          <div className="flex items-baseline gap-3">
            <div className="font-heading text-2xl font-bold tabular">
              {formatUah(build.priceUah)}{" "}
              <span className="text-base text-muted-foreground">₴</span>
            </div>
            {build.oldPriceUah ? (
              <div className="tabular text-sm text-muted-foreground line-through">
                {formatUah(build.oldPriceUah)} ₴
              </div>
            ) : null}
          </div>
          <TechButtonDisplay
            size="sm"
            variant="inverse"
            className="w-full h-9 font-heading tracking-normal"
          >
            Купити за {formatUah(build.priceUah)} ₴
          </TechButtonDisplay>
        </div>

        <div className="-mx-5 -mb-5 border-t border-border bg-background/40 px-5 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          {build.buildTimeText}
        </div>
      </div>
    </Link>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1 last:border-b-0">
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-foreground">{value}</dd>
    </div>
  );
}
