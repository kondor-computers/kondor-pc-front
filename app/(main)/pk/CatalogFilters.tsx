"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { formatUah } from "@/lib/format";
import type { Game, Resolution } from "@/types/build";
import { cn } from "@/lib/utils";
import ArrowInCircleIcon from "@/components/icons/ArrowInCircleIcon";
import {
  BUDGET_MAX,
  BUDGET_MIN,
  BUDGET_STEP,
  DEFAULT_BUDGET,
  type CatalogFilters,
  type SortValue,
  countActiveFilters,
  filtersToQueryString,
} from "@/lib/catalog/pkFilters";

const RESOLUTIONS: { value: "all" | Resolution; label: string }[] = [
  { value: "all", label: "Усі" },
  { value: "fullhd", label: "Full HD" },
  { value: "2k", label: "2K" },
  { value: "4k", label: "4K" },
];

const SORTS = [
  { value: "popular", label: "За популярністю" },
  { value: "price_asc", label: "Від дешевих" },
  { value: "price_desc", label: "Від дорогих" },
] as const;

const GAME_FILTER_CHECKBOX_CLASS =
  "border-white bg-transparent data-checked:border-primary data-checked:bg-primary";

export function CatalogFilters({
  games,
  filters,
}: {
  games: Game[];
  filters: CatalogFilters;
}) {
  const router = useRouter();
  const budgetLabelId = useId();
  const sortLabelId = useId();
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [budget, setBudget] = useState(filters.budget);
  const budgetDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBudget(filters.budget);
  }, [filters.budget]);

  const navigate = useCallback(
    (next: CatalogFilters) => {
      const query = filtersToQueryString(next);
      router.replace(query ? `/pk?${query}` : "/pk", { scroll: false });
    },
    [router],
  );

  const patchFilters = useCallback(
    (patch: Partial<CatalogFilters>) => {
      navigate({ ...filters, ...patch });
    },
    [filters, navigate],
  );

  const resetFilters = useCallback(() => {
    router.replace("/pk", { scroll: false });
  }, [router]);

  const allGamesSelected = filters.gameFilterMode === "all";

  const toggleGame = useCallback(
    (slug: string, checked: boolean) => {
      const gameSlugs = checked
        ? [...filters.gameSlugs, slug]
        : filters.gameSlugs.filter((s) => s !== slug);
      patchFilters({ gameFilterMode: "custom", gameSlugs });
    },
    [filters.gameSlugs, patchFilters],
  );

  const toggleAllGames = useCallback(
    (checked: boolean) => {
      patchFilters({
        gameFilterMode: checked ? "all" : "custom",
        gameSlugs: [],
      });
    },
    [patchFilters],
  );

  const activeFilters = countActiveFilters(filters);

  return (
    <aside className="sticky top-[calc(var(--header-h,64px)+16px)] z-10 h-fit space-y-6 rounded-lg border border-border bg-surface/95 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Фільтри
        </p>
        <button
          type="button"
          onClick={() => setFiltersExpanded((open) => !open)}
          aria-expanded={filtersExpanded}
          aria-label={
            filtersExpanded ? "Згорнути фільтри" : "Розгорнути фільтри"
          }
          className="md:hidden text-foreground transition-opacity hover:opacity-80"
        >
          <ArrowInCircleIcon
            className={cn(
              "transition-transform duration-300",
              !filtersExpanded && "rotate-180",
            )}
          />
        </button>
      </div>
      {filtersExpanded && (
        <>
          <div>
            <div className="flex items-center justify-between">
              <Label
                id={budgetLabelId}
                className="text-[11px] uppercase tracking-wider text-muted-foreground"
              >
                Бюджет
              </Label>
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground transition hover:text-foreground"
                >
                  Скинути
                </button>
              )}
            </div>
            <div className="tabular mt-2 flex items-baseline justify-between text-sm">
              <span className="font-semibold">
                {formatUah(budget[0] * 1000)} ₴
              </span>
              <span className="text-muted-foreground">—</span>
              <span className="font-semibold">
                {formatUah(budget[1] * 1000)} ₴
              </span>
            </div>
            <Slider
              className="mt-3"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={budget}
              aria-labelledby={budgetLabelId}
              thumbLabels={["Мінімальний бюджет", "Максимальний бюджет"]}
              onValueChange={(v) => {
                if (!Array.isArray(v)) return;
                const next: [number, number] = [v[0], v[1]];
                setBudget(next);
                if (budgetDebounceRef.current) {
                  clearTimeout(budgetDebounceRef.current);
                }
                budgetDebounceRef.current = setTimeout(() => {
                  patchFilters({ budget: next });
                }, 350);
              }}
            />
          </div>

          <div>
            <Label className="mb-2 block text-[11px] uppercase tracking-wider text-muted-foreground">
              Під гру або задачу
              {filters.gameFilterMode === "custom" &&
                filters.gameSlugs.length > 0 && (
                  <span className="ml-1.5 normal-case tracking-normal text-foreground">
                    ({filters.gameSlugs.length})
                  </span>
                )}
            </Label>
            <ul className="scrollbar-thin-sidebar max-h-48 space-y-1 overflow-y-auto pr-0.5">
              <li>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium transition hover:bg-accent/50">
                  <Checkbox
                    className={GAME_FILTER_CHECKBOX_CLASS}
                    checked={allGamesSelected}
                    onCheckedChange={toggleAllGames}
                  />
                  <span className="flex-1">Усі ігри та задачі</span>
                </label>
              </li>
              {games.map((g) => {
                const active = allGamesSelected
                  ? true
                  : filters.gameSlugs.includes(g.slug);
                return (
                  <li key={g.slug}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm transition hover:bg-accent/50">
                      <Checkbox
                        className={GAME_FILTER_CHECKBOX_CLASS}
                        checked={active}
                        onCheckedChange={(value) =>
                          toggleGame(g.slug, value === true)
                        }
                      />
                      <span className="flex-1">{g.ukrName || g.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <Label className="mb-2 block text-[11px] uppercase tracking-wider text-muted-foreground">
              Роздільна
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => patchFilters({ resolution: r.value })}
                  className={cn(
                    buttonVariants({
                      variant:
                        filters.resolution === r.value ? "default" : "outline",
                      size: "xs",
                    }),
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label
              id={sortLabelId}
              className="mb-2 block text-[11px] uppercase tracking-wider text-muted-foreground"
            >
              Сортування
            </Label>
            <Select
              value={filters.sort}
              onValueChange={(v) => {
                if (v) patchFilters({ sort: v as SortValue });
              }}
            >
              <SelectTrigger
                className="h-9 w-full"
                aria-labelledby={sortLabelId}
              >
                <SelectValue>
                  {SORTS.find((s) => s.value === filters.sort)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </aside>
  );
}
