"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatUah } from "@/lib/format";
import type { Build, BuildSpecShort, ConfigOption } from "@/types/build";
import type { CartItemOption } from "@/lib/cartStore";

export interface ConfiguratorSelection {
  groupId: string;
  optionId: string;
}

export type ConfiguratorPreset = "base" | "optimal" | "premium" | "custom";

export interface ConfiguratorValue {
  build: Build;
  selections: Record<string, string>;
  select(groupId: string, optionId: string): void;
  /** Bulk-apply a preset across all configurable groups. */
  applyPreset(preset: Exclude<ConfiguratorPreset, "custom">): void;
  /** Which preset the current selections match ("custom" = none). */
  currentPreset: ConfiguratorPreset;
  /** Base + sum of deltas. */
  resolvedPriceUah: number;
  /** Adjusted old price (preserves original discount magnitude) if `build.oldPriceUah` present. */
  resolvedOldPriceUah?: number;
  /** Same as resolved minus base — useful for the "+ X ₴" labels. */
  deltaUah: number;
  /** Spec panel values reflecting picked options (ram/storage overrides). */
  resolvedSpec: BuildSpecShort;
  /** Rich list of picked options for display and cart. */
  selectedOptions: Array<{
    groupId: string;
    groupLabel: string;
    option: ConfigOption;
  }>;
  /** Serializable options payload for cart.add(). */
  cartOptions: CartItemOption[];
}

const ProductConfiguratorContext = createContext<ConfiguratorValue | null>(
  null,
);

function defaultSelections(build: Build): Record<string, string> {
  const map: Record<string, string> = {};
  for (const group of build.configurableOptions ?? []) {
    const def = group.options.find((o) => o.isDefault) ?? group.options[0];
    if (def) map[group.id] = def.id;
  }
  return map;
}

/**
 * Seeds the selection map by overlaying URL query params on top of defaults,
 * so a link like `/pk/vega?ram=64gb&ssd=2tb&warranty=3y` reopens the page
 * with those options pre-picked.
 */
function selectionsFromUrl(
  build: Build,
  searchParams: URLSearchParams | null,
): Record<string, string> {
  const map = defaultSelections(build);
  if (!searchParams) return map;
  for (const group of build.configurableOptions ?? []) {
    const raw = searchParams.get(group.id);
    if (!raw) continue;
    if (group.options.some((o) => o.id === raw)) map[group.id] = raw;
  }
  return map;
}

/** Reads URL params after paint — must not block SSR of the product hero. */
function UrlSelectionSync({
  build,
  setSelections,
}: {
  build: Build;
  setSelections: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const searchParams = useSearchParams();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;
    setSelections(selectionsFromUrl(build, searchParams));
  }, [build, searchParams, setSelections]);

  return null;
}

export function ProductConfiguratorProvider({
  build,
  children,
}: {
  build: Build;
  children: ReactNode;
}) {
  const router = useRouter();

  const [selections, setSelections] = useState<Record<string, string>>(() =>
    defaultSelections(build),
  );

  /**
   * Sync URL when the user changes picks. We skip the sync when a group is
   * on its default and no URL entry exists — keeps the URL clean for the
   * common "base configuration" case.
   */
  const hasMounted = useRef(false);
  const defaults = useMemo(() => defaultSelections(build), [build]);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    for (const group of build.configurableOptions ?? []) {
      const picked = selections[group.id];
      const def = defaults[group.id];
      if (picked && picked !== def) sp.set(group.id, picked);
      else sp.delete(group.id);
    }
    const query = sp.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}`;
    const current = `${window.location.pathname}${window.location.search}`;
    // Avoid no-op navigations: they still trigger Next.js route updates
    // and can cause repeated server requests in development.
    if (next === current) return;
    router.replace(next, { scroll: false });
  }, [selections, build.configurableOptions, defaults, router]);

  const setGroup = useCallback((groupId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [groupId]: optionId }));
  }, []);

  /** Bulk-apply a preset (Basic / Optimal / Premium). */
  const applyPreset = useCallback(
    (preset: "base" | "optimal" | "premium") => {
      const next: Record<string, string> = {};
      for (const group of build.configurableOptions ?? []) {
        const opts = group.options;
        if (opts.length === 0) continue;
        if (preset === "base") {
          const def = opts.find((o) => o.isDefault) ?? opts[0];
          next[group.id] = def.id;
        } else if (preset === "premium") {
          const top = [...opts].sort((a, b) => b.priceDelta - a.priceDelta)[0];
          next[group.id] = top.id;
        } else {
          // optimal: cheapest non-default upgrade in each group; fall back to default.
          const def = opts.find((o) => o.isDefault) ?? opts[0];
          const upgrades = opts.filter(
            (o) => o.id !== def.id && o.priceDelta > 0,
          );
          if (upgrades.length === 0) {
            next[group.id] = def.id;
          } else {
            const cheapest = [...upgrades].sort(
              (a, b) => a.priceDelta - b.priceDelta,
            )[0];
            next[group.id] = cheapest.id;
          }
        }
      }
      setSelections(next);
    },
    [build.configurableOptions],
  );

  const value = useMemo<ConfiguratorValue>(() => {
    const groups = build.configurableOptions ?? [];

    const selectedOptions = groups
      .map((group) => {
        const optionId = selections[group.id];
        const option = group.options.find((o) => o.id === optionId);
        if (!option) return null;
        return { groupId: group.id, groupLabel: group.label, option };
      })
      .filter(
        (
          x,
        ): x is { groupId: string; groupLabel: string; option: ConfigOption } =>
          x !== null,
      );

    const deltaUah = selectedOptions.reduce(
      (s, { option }) => s + option.priceDelta,
      0,
    );
    const resolvedPriceUah = build.priceUah + deltaUah;
    const resolvedOldPriceUah = build.oldPriceUah
      ? build.oldPriceUah + deltaUah
      : undefined;

    const resolvedSpec: BuildSpecShort = { ...build.spec };
    for (const group of groups) {
      if (!group.overridesSpec) continue;
      const picked = selectedOptions.find((s) => s.groupId === group.id);
      if (!picked) continue;
      if (group.overridesSpec === "ram") {
        resolvedSpec.ram = picked.option.label;
        resolvedSpec.ramSpeed =
          picked.option.description?.match(/(\d{3,5})\s*MHz/i)?.[1] ??
          build.spec.ramSpeed;
      } else if (group.overridesSpec === "storage") {
        resolvedSpec.storage = picked.option.label;
      }
    }

    const cartOptions: CartItemOption[] = selectedOptions.map(
      ({ groupId, groupLabel, option }) => ({
        groupId,
        groupLabel,
        optionId: option.id,
        optionLabel: option.label,
        priceDelta: option.priceDelta,
      }),
    );

    // Derive which preset (if any) the current selections match.
    const matches = (preset: "base" | "optimal" | "premium") => {
      for (const group of groups) {
        const opts = group.options;
        if (opts.length === 0) continue;
        const picked = selections[group.id];
        let expected: string;
        if (preset === "base") {
          const def = opts.find((o) => o.isDefault) ?? opts[0];
          expected = def.id;
        } else if (preset === "premium") {
          expected = [...opts].sort((a, b) => b.priceDelta - a.priceDelta)[0]
            .id;
        } else {
          const def = opts.find((o) => o.isDefault) ?? opts[0];
          const upgrades = opts.filter(
            (o) => o.id !== def.id && o.priceDelta > 0,
          );
          expected =
            upgrades.length === 0
              ? def.id
              : [...upgrades].sort((a, b) => a.priceDelta - b.priceDelta)[0].id;
        }
        if (picked !== expected) return false;
      }
      return true;
    };

    const currentPreset: ConfiguratorPreset = matches("base")
      ? "base"
      : matches("optimal")
        ? "optimal"
        : matches("premium")
          ? "premium"
          : "custom";

    return {
      build,
      selections,
      select: setGroup,
      applyPreset,
      currentPreset,
      resolvedPriceUah,
      resolvedOldPriceUah,
      deltaUah,
      resolvedSpec,
      selectedOptions,
      cartOptions,
    };
  }, [build, selections, setGroup, applyPreset]);

  return (
    <ProductConfiguratorContext.Provider value={value}>
      <Suspense fallback={null}>
        <UrlSelectionSync build={build} setSelections={setSelections} />
      </Suspense>
      {children}
    </ProductConfiguratorContext.Provider>
  );
}

export function useProductConfigurator(): ConfiguratorValue {
  const ctx = useContext(ProductConfiguratorContext);
  if (!ctx)
    throw new Error(
      "useProductConfigurator must be used within <ProductConfiguratorProvider>",
    );
  return ctx;
}

/** Optional variant — returns null if not inside a provider. Useful for shared components (sticky bar). */
export function useProductConfiguratorOptional(): ConfiguratorValue | null {
  return useContext(ProductConfiguratorContext);
}

// ──────────────────────────────────────────────────────────────
//  UI
// ──────────────────────────────────────────────────────────────

const PRESETS: Array<{
  key: Exclude<ConfiguratorPreset, "custom">;
  label: string;
  note: string;
}> = [
  { key: "base", label: "Базова", note: "Як у картці · без доплат" },
  { key: "optimal", label: "Оптимальна", note: "Найвигідніший апгрейд" },
  { key: "premium", label: "Преміум", note: "Максимум з доступних опцій" },
];

export function Configurator({ className }: { className?: string }) {
  const {
    build,
    selections,
    select,
    deltaUah,
    resolvedPriceUah,
    applyPreset,
    currentPreset,
  } = useProductConfigurator();
  const groups = build.configurableOptions ?? [];
  if (groups.length === 0) return null;

  return (
    <div
      className={cn(
        // Elevated card frame + SKU accent border pull — reads as a primary
        // commercial block, not a secondary spec panel.
        "card-frame-md tabular relative space-y-4 bg-surface/95 p-5",
        className,
      )}
    >
      {/* Kicker + live delta */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mt-1 text-[11px] font-medium uppercase text-muted-foreground">
            Налаштуй під себе
          </div>
        </div>
        <div className="min-w-0 text-right">
          {deltaUah !== 0 && (
            <div
              className={cn(
                "tabular text-[11px] font-semibold",
                deltaUah > 0 ? "text-brand-primary" : "text-brand-primary",
              )}
            >
              {deltaUah > 0 ? "+" : "−"}
              {formatUah(Math.abs(deltaUah))} ₴ до бази
            </div>
          )}
        </div>
      </div>

      {groups.map((group) => {
        const activeId = selections[group.id];
        return (
          <div key={group.id}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {group.label}
              </div>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {group.options.map((opt) => {
                const active = activeId === opt.id;
                const isPositive = opt.priceDelta > 0;
                const isNegative = opt.priceDelta < 0;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => select(group.id, opt.id)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-left text-sm transition",
                      active
                        ? "border-foreground bg-surface-elevated"
                        : "border-border hover:border-white/25",
                    )}
                  >
                    <span className="font-medium">{opt.label}</span>
                    {opt.priceDelta !== 0 && (
                      <span
                        className={cn(
                          "ml-2 text-[11px]",
                          isPositive && "text-muted-foreground",
                          isNegative && "text-brand-primary",
                        )}
                      >
                        {isPositive && "+"}
                        {formatUah(opt.priceDelta)} ₴
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
