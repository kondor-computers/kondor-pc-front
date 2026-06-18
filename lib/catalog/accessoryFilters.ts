import {
  groupCategorySlug,
  groupEffectivePrice,
  groupHasAvailability,
  groupHasDiscount,
  groupName,
  groupProducts,
} from "@/lib/catalog/group";
import type {
  CatalogProductGroup,
  CatalogProductListItem,
} from "@/types/catalog";

export type Availability = "in-stock" | "pre-order";
export type SortKey =
  | "default"
  | "price_asc"
  | "price_desc"
  | "discount"
  | "name_asc"
  | "name_desc";

export const SORTS: { value: SortKey; label: string }[] = [
  { value: "default", label: "За замовчуванням" },
  { value: "price_asc", label: "Від дешевих" },
  { value: "price_desc", label: "Від дорогих" },
  { value: "discount", label: "Зі знижкою спершу" },
  { value: "name_asc", label: "Назва А → Я" },
  { value: "name_desc", label: "Назва Я → А" },
];

const SORT_KEYS = new Set(SORTS.map((s) => s.value));

export const DEFAULT_AVAILABILITY: Availability[] = ["in-stock", "pre-order"];

export type CategoryFilterMode = "all" | "custom";

export type PriceBounds = { min: number; max: number };

export type AccessoryFilters = {
  categoryFilterMode: CategoryFilterMode;
  selectedCategories: string[];
  priceRange: [number, number];
  availability: Availability[];
  sort: SortKey;
};

export type FilteredCatalog = {
  primary: CatalogProductGroup[];
  secondary: CatalogProductGroup[];
  hasFilters: boolean;
};

export function buildCatalogGroups(
  items: CatalogProductListItem[],
): CatalogProductGroup[] {
  return groupProducts(items);
}

export function computePriceBounds(groups: CatalogProductGroup[]): PriceBounds {
  if (groups.length === 0) return { min: 0, max: 5000 };
  const prices = groups.map(groupEffectivePrice);
  return {
    min: Math.max(0, Math.floor(Math.min(...prices) / 100) * 100),
    max: Math.ceil(Math.max(...prices) / 100) * 100,
  };
}

function clampPrice(value: number, bounds: PriceBounds): number {
  return Math.min(bounds.max, Math.max(bounds.min, value));
}

function parsePriceParam(
  raw: string | undefined,
  fallback: number,
  bounds: PriceBounds,
): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return clampPrice(n, bounds);
}

function parseAvailabilityParam(raw: string | undefined): Availability[] {
  if (raw === "none") return [];
  if (!raw?.trim()) return [...DEFAULT_AVAILABILITY];
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Availability => s === "in-stock" || s === "pre-order");
  return parts.length > 0 ? parts : [...DEFAULT_AVAILABILITY];
}

function availabilityEqual(a: Availability[], b: Availability[]): boolean {
  return a.length === b.length && a.every((value) => b.includes(value));
}

export function parseFiltersFromParams(
  params: Record<string, string | undefined>,
  validCategorySlugs: Set<string>,
  bounds: PriceBounds,
): AccessoryFilters {
  const catRaw = params.cat?.trim();
  const selectedCategories = catRaw
    ? catRaw
        .split(",")
        .map((s) => s.trim())
        .filter((slug) => slug && validCategorySlugs.has(slug))
    : [];
  const categoryFilterMode: CategoryFilterMode =
    selectedCategories.length > 0 ? "custom" : "all";

  const priceRange: [number, number] = [
    parsePriceParam(params.min, bounds.min, bounds),
    parsePriceParam(params.max, bounds.max, bounds),
  ];
  if (priceRange[0] > priceRange[1]) {
    priceRange[0] = bounds.min;
    priceRange[1] = bounds.max;
  }

  const availability = parseAvailabilityParam(params.avail);

  const sortRaw = params.sort;
  const sort: SortKey = SORT_KEYS.has(sortRaw as SortKey)
    ? (sortRaw as SortKey)
    : "default";

  return {
    categoryFilterMode,
    selectedCategories,
    priceRange,
    availability,
    sort,
  };
}

export function filtersToQueryString(
  filters: AccessoryFilters,
  bounds: PriceBounds,
): string {
  const sp = new URLSearchParams();

  if (
    filters.categoryFilterMode === "custom" &&
    filters.selectedCategories.length > 0
  ) {
    sp.set("cat", filters.selectedCategories.join(","));
  }
  if (filters.priceRange[0] !== bounds.min) {
    sp.set("min", String(filters.priceRange[0]));
  }
  if (filters.priceRange[1] !== bounds.max) {
    sp.set("max", String(filters.priceRange[1]));
  }
  if (filters.availability.length === 0) {
    sp.set("avail", "none");
  } else if (
    !availabilityEqual(filters.availability, DEFAULT_AVAILABILITY)
  ) {
    sp.set("avail", filters.availability.join(","));
  }
  if (filters.sort !== "default") {
    sp.set("sort", filters.sort);
  }

  return sp.toString();
}

function sortGroups(
  groups: CatalogProductGroup[],
  sort: SortKey,
): CatalogProductGroup[] {
  const res = groups.slice();
  switch (sort) {
    case "price_asc":
      res.sort((a, b) => groupEffectivePrice(a) - groupEffectivePrice(b));
      break;
    case "price_desc":
      res.sort((a, b) => groupEffectivePrice(b) - groupEffectivePrice(a));
      break;
    case "discount":
      res.sort(
        (a, b) => Number(groupHasDiscount(b)) - Number(groupHasDiscount(a)),
      );
      break;
    case "name_asc":
      res.sort((a, b) => groupName(a).localeCompare(groupName(b), "uk"));
      break;
    case "name_desc":
      res.sort((a, b) => groupName(b).localeCompare(groupName(a), "uk"));
      break;
  }
  return res;
}

export function filterCatalogGroups(
  groups: CatalogProductGroup[],
  filters: AccessoryFilters,
  bounds: PriceBounds,
): FilteredCatalog {
  let primary = groups.slice();

  if (
    filters.categoryFilterMode === "custom" &&
    filters.selectedCategories.length > 0
  ) {
    primary = primary.filter((g) => {
      const slug = groupCategorySlug(g);
      return slug ? filters.selectedCategories.includes(slug) : false;
    });
  }

  primary = primary.filter((g) => {
    const p = groupEffectivePrice(g);
    return p >= filters.priceRange[0] && p <= filters.priceRange[1];
  });

  if (
    filters.availability.length > 0 &&
    filters.availability.length < 2
  ) {
    const kind = filters.availability[0];
    primary = primary.filter((g) => groupHasAvailability(g, kind));
  }

  primary = sortGroups(primary, filters.sort);

  const hasFilters =
    (filters.categoryFilterMode === "custom" &&
      filters.selectedCategories.length > 0) ||
    filters.priceRange[0] > bounds.min ||
    filters.priceRange[1] < bounds.max ||
    filters.availability.length !== 2;

  let secondary: CatalogProductGroup[] = [];
  if (hasFilters) {
    const primaryKeys = new Set(primary.map((g) => g.key));
    secondary = sortGroups(
      groups.filter((g) => !primaryKeys.has(g.key)),
      filters.sort,
    );
  }

  return { primary, secondary, hasFilters };
}

export function countActiveFilters(
  filters: AccessoryFilters,
  bounds: PriceBounds,
): number {
  return (
    (filters.categoryFilterMode === "custom" &&
    filters.selectedCategories.length > 0
      ? 1
      : 0) +
    (filters.priceRange[0] > bounds.min || filters.priceRange[1] < bounds.max
      ? 1
      : 0) +
    (filters.availability.length !== 2 ? 1 : 0)
  );
}
