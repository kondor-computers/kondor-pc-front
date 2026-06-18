import type { Build, Resolution } from "@/types/build";

export const BUDGET_MIN = 20;
export const BUDGET_MAX = 200;
export const BUDGET_STEP = 5;
export const DEFAULT_BUDGET: [number, number] = [BUDGET_MIN, BUDGET_MAX];

export const DEFAULT_HIGHLIGHT_GAMES = ["cs2", "warzone", "cyberpunk"] as const;

export type SortValue = "popular" | "price_asc" | "price_desc";

/** Усі ігри та задачі — без фільтра по FPS; custom — обрані slug-и в URL. */
export type GameFilterMode = "all" | "custom";

export type CatalogFilters = {
  budget: [number, number];
  gameFilterMode: GameFilterMode;
  gameSlugs: string[];
  resolution: "all" | Resolution;
  sort: SortValue;
};

function clampBudget(value: number): number {
  const stepped = Math.round(value / BUDGET_STEP) * BUDGET_STEP;
  return Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, stepped));
}

function parseBudgetParam(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return clampBudget(n);
}

export function parseFiltersFromParams(
  params: Record<string, string | undefined>,
  validGameSlugs: Set<string>,
): CatalogFilters {
  const budget: [number, number] = [
    parseBudgetParam(params.min, DEFAULT_BUDGET[0]),
    parseBudgetParam(params.max, DEFAULT_BUDGET[1]),
  ];
  if (budget[0] > budget[1]) {
    budget[0] = DEFAULT_BUDGET[0];
    budget[1] = DEFAULT_BUDGET[1];
  }

  const gamesKeyPresent = "games" in params;
  const gamesRaw = params.games?.trim();
  const gameFilterMode: GameFilterMode = gamesKeyPresent ? "custom" : "all";
  const gameSlugs = gamesKeyPresent
    ? gamesRaw
      ? gamesRaw
          .split(",")
          .map((s) => s.trim())
          .filter((slug) => slug && validGameSlugs.has(slug))
      : []
    : [];

  const resRaw = params.res;
  const resolution: "all" | Resolution =
    resRaw === "fullhd" || resRaw === "2k" || resRaw === "4k" ? resRaw : "all";

  const sortRaw = params.sort;
  const sort: SortValue =
    sortRaw === "price_asc" || sortRaw === "price_desc" ? sortRaw : "popular";

  return { budget, gameFilterMode, gameSlugs, resolution, sort };
}

export function filtersToQueryString(filters: CatalogFilters): string {
  const sp = new URLSearchParams();

  if (filters.budget[0] !== DEFAULT_BUDGET[0]) {
    sp.set("min", String(filters.budget[0]));
  }
  if (filters.budget[1] !== DEFAULT_BUDGET[1]) {
    sp.set("max", String(filters.budget[1]));
  }
  if (filters.gameFilterMode === "custom") {
    sp.set("games", filters.gameSlugs.join(","));
  }
  if (filters.resolution !== "all") {
    sp.set("res", filters.resolution);
  }
  if (filters.sort !== "popular") {
    sp.set("sort", filters.sort);
  }

  return sp.toString();
}

export function filterBuilds(
  builds: Build[],
  filters: CatalogFilters,
): Build[] {
  const min = filters.budget[0] * 1000;
  const max = filters.budget[1] * 1000;
  let res = builds.filter((b) => b.priceUah >= min && b.priceUah <= max);

  if (filters.resolution !== "all") {
    res = res.filter((b) =>
      b.fps.some((f) => f.resolution === filters.resolution),
    );
  }

  if (filters.gameFilterMode === "custom" && filters.gameSlugs.length > 0) {
    const wantRes =
      filters.resolution === "all" ? undefined : filters.resolution;
    res = res.filter((b) =>
      filters.gameSlugs.every((slug) =>
        b.fps.some(
          (f) =>
            f.gameSlug === slug &&
            (!wantRes || f.resolution === wantRes) &&
            f.fpsAvg >= 60,
        ),
      ),
    );
  }

  if (filters.sort === "price_asc") res.sort((a, b) => a.priceUah - b.priceUah);
  if (filters.sort === "price_desc") res.sort((a, b) => b.priceUah - a.priceUah);
  return res;
}

export function countActiveFilters(filters: CatalogFilters): number {
  return (
    (filters.budget[0] > BUDGET_MIN || filters.budget[1] < BUDGET_MAX ? 1 : 0) +
    (filters.gameFilterMode === "custom" && filters.gameSlugs.length > 0
      ? 1
      : 0) +
    (filters.resolution !== "all" ? 1 : 0)
  );
}

export function highlightGamesForFilters(
  filters: CatalogFilters,
): string[] {
  return filters.gameFilterMode === "custom" && filters.gameSlugs.length > 0
    ? filters.gameSlugs
    : [...DEFAULT_HIGHLIGHT_GAMES];
}
