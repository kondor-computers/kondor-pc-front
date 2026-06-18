"use client";

import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useProductConfigurator } from "@/components/shared/ProductConfigurator";
import { formatUah } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Honest one-line upgrade nudge rendered above the primary CTA.
 * Rule:
 *   - find the cheapest not-yet-selected positive-delta option across all
 *     configurable groups
 *   - surface it as a single actionable chip: "+X ₴ → <option label>"
 *   - clicking applies the pick via the configurator — URL stays in sync
 *
 * Honest framing: we only reference the option's own label (e.g. "1 TB NVMe",
 * "2 роки гарантії"). No fabricated FPS / performance claims.
 */
export function UpgradeSuggestion({ className }: { className?: string }) {
  const { build, selections, select } = useProductConfigurator();
  const groups = build.configurableOptions ?? [];

  const suggestion = useMemo(() => {
    type Candidate = {
      groupId: string;
      groupLabel: string;
      optionId: string;
      optionLabel: string;
      priceDelta: number;
    };
    const candidates: Candidate[] = [];
    for (const group of groups) {
      const picked = selections[group.id];
      const pickedOpt = group.options.find((o) => o.id === picked);
      const pickedDelta = pickedOpt?.priceDelta ?? 0;
      // Any option in the group that's a strict upgrade from the current pick.
      for (const opt of group.options) {
        if (opt.id === picked) continue;
        if (opt.priceDelta <= pickedDelta) continue;
        candidates.push({
          groupId: group.id,
          groupLabel: group.label,
          optionId: opt.id,
          optionLabel: opt.label,
          priceDelta: opt.priceDelta - pickedDelta,
        });
      }
    }
    if (candidates.length === 0) return null;
    // Cheapest-first — removes analysis paralysis for the buyer.
    return candidates.sort((a, b) => a.priceDelta - b.priceDelta)[0];
  }, [groups, selections]);

  if (!suggestion) return null;

  return (
    <button
      type="button"
      onClick={() => select(suggestion.groupId, suggestion.optionId)}
      className={cn(
        "group/upgrade flex w-full items-center justify-between gap-3 rounded-md border border-dashed px-3 py-2 text-left transition",
        "border-[color:var(--sku,#ffffff40)]",
        "hover:border-[color:var(--sku,#ffffff80)] hover:bg-surface/60",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Рекомендуємо
        </div>
        <div className="mt-0.5 text-sm leading-snug">
          <span className="tabular font-semibold text-foreground">
            +{formatUah(suggestion.priceDelta)} ₴
          </span>{" "}
          <span className="text-muted-foreground">→</span>{" "}
          <span className="font-medium">{suggestion.optionLabel}</span>{" "}
          <span className="text-muted-foreground">
            · {suggestion.groupLabel.toLowerCase()}
          </span>
        </div>
      </div>
      <ArrowUpRight
        className="size-4 shrink-0 transition group-hover/upgrade:translate-x-0.5 group-hover/upgrade:-translate-y-0.5"
        strokeWidth={2}
      />
    </button>
  );
}
