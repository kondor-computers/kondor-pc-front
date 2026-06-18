"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatUah } from "@/lib/format";
import type { CategorySummary } from "@/types/catalog";
import ArrowInCircleIcon from "@/components/icons/ArrowInCircleIcon";
import { cn } from "@/lib/utils";
import {
  SORTS,
  type AccessoryFilters,
  type Availability,
  type PriceBounds,
  type SortKey,
  countActiveFilters,
  filtersToQueryString,
} from "@/lib/catalog/accessoryFilters";

export function CatalogFilters({
  categories,
  filters,
  priceBounds,
}: {
  categories: CategorySummary[];
  filters: AccessoryFilters;
  priceBounds: PriceBounds;
}) {
  const router = useRouter();
  const categorySlugs = categories.map((c) => c.slug);
  const priceLabelId = useId();
  const sortLabelId = useId();
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [priceRange, setPriceRange] = useState(filters.priceRange);
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPriceRange(filters.priceRange);
  }, [filters.priceRange]);

  const navigate = useCallback(
    (next: AccessoryFilters) => {
      const query = filtersToQueryString(next, priceBounds);
      router.replace(query ? `/catalog?${query}` : "/catalog", {
        scroll: false,
      });
    },
    [priceBounds, router],
  );

  const patchFilters = useCallback(
    (patch: Partial<AccessoryFilters>) => {
      navigate({ ...filters, ...patch });
    },
    [filters, navigate],
  );

  const resetAll = useCallback(() => {
    router.replace("/catalog", { scroll: false });
  }, [router]);

  const allCategoriesSelected = filters.categoryFilterMode === "all";

  const toggleCategory = useCallback(
    (slug: string) => {
      if (filters.categoryFilterMode === "all") {
        patchFilters({
          categoryFilterMode: "custom",
          selectedCategories: categorySlugs.filter((s) => s !== slug),
        });
        return;
      }

      const next = filters.selectedCategories.includes(slug)
        ? filters.selectedCategories.filter((s) => s !== slug)
        : [...filters.selectedCategories, slug];

      if (next.length === 0) {
        patchFilters({ categoryFilterMode: "all", selectedCategories: [] });
        return;
      }
      if (categorySlugs.every((s) => next.includes(s))) {
        patchFilters({ categoryFilterMode: "all", selectedCategories: [] });
        return;
      }
      patchFilters({ categoryFilterMode: "custom", selectedCategories: next });
    },
    [categorySlugs, filters, patchFilters],
  );

  const toggleAvailability = useCallback(
    (v: Availability) => {
      const next = filters.availability.includes(v)
        ? filters.availability.filter((a) => a !== v)
        : [...filters.availability, v];
      patchFilters({ availability: next });
    },
    [filters.availability, patchFilters],
  );

  const activeFilters = countActiveFilters(filters, priceBounds);

  return (
    <aside className="z-10 h-fit space-y-6 rounded-lg border border-border bg-surface/95 p-5 backdrop-blur-md md:sticky md:top-[calc(var(--header-h,64px)+16px)]">
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
            <Label className="mb-2 block text-[11px] uppercase tracking-wider text-muted-foreground">
              Тип
            </Label>
            <ul className="space-y-1.5">
              {categories.map((cat) => {
                const active =
                  allCategoriesSelected ||
                  filters.selectedCategories.includes(cat.slug);
                return (
                  <li key={cat.id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm transition hover:bg-accent/50">
                      <Checkbox
                        checked={active}
                        onCheckedChange={() => toggleCategory(cat.slug)}
                      />
                      <span className="flex-1">{cat.name}</span>
                      <span className="tabular text-[10px] text-muted-foreground">
                        {cat.itemsCount}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <Label
              id={priceLabelId}
              className="mb-2 block text-[11px] uppercase tracking-wider text-muted-foreground"
            >
              Ціна
            </Label>
            <div className="tabular mt-1 flex items-baseline justify-between text-sm">
              <span className="font-semibold">
                {formatUah(priceRange[0])} ₴
              </span>
              <span className="text-muted-foreground">—</span>
              <span className="font-semibold">
                {formatUah(priceRange[1])} ₴
              </span>
            </div>
            <Slider
              className="mt-3"
              min={priceBounds.min}
              max={priceBounds.max}
              step={100}
              value={priceRange}
              aria-labelledby={priceLabelId}
              thumbLabels={["Мінімальна ціна", "Максимальна ціна"]}
              onValueChange={(v) => {
                if (!Array.isArray(v)) return;
                const next: [number, number] = [v[0], v[1]];
                setPriceRange(next);
                if (priceDebounceRef.current) {
                  clearTimeout(priceDebounceRef.current);
                }
                priceDebounceRef.current = setTimeout(() => {
                  patchFilters({ priceRange: next });
                }, 350);
              }}
            />
          </div>

          <div>
            <Label className="mb-2 block text-[11px] uppercase tracking-wider text-muted-foreground">
              Наявність
            </Label>
            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm transition hover:bg-accent/50">
                <Checkbox
                  checked={filters.availability.includes("in-stock")}
                  onCheckedChange={() => toggleAvailability("in-stock")}
                />
                <span>В наявності</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm transition hover:bg-accent/50">
                <Checkbox
                  checked={filters.availability.includes("pre-order")}
                  onCheckedChange={() => toggleAvailability("pre-order")}
                />
                <span>Передзамовлення</span>
              </label>
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
                if (v) patchFilters({ sort: v as SortKey });
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

          {activeFilters > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="text-xs text-muted-foreground transition hover:text-foreground"
            >
              Скинути фільтри
            </button>
          )}
        </>
      )}
    </aside>
  );
}
