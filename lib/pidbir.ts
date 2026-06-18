import { fpsTier, type FpsTier } from "@/lib/fps-thresholds";
import type { Build, BuildFpsEntry, Resolution } from "@/types/build";

export interface PidbirCriteria {
  games: string[];
  budgetMin: number;
  budgetMax: number;
  resolution?: Resolution;
}

export type BadgeKey =
  | "cheapest"
  | "recommended"
  | "with-headroom"
  | "stable-fps";

export type PidbirMatchQuality =
  | "ideal"
  | "budget_relaxed"
  | "fps_compromise"
  | "fps_compromise_relaxed";

export interface PidbirResult {
  build: Build;
  score: number;
  badge?: BadgeKey;
}

export interface PidbirPickResult {
  results: PidbirResult[];
  aspirational?: PidbirResult;
  /** Найнижча ціна збірки з majority-good FPS, якщо вона суттєво вище показаних */
  stableFpsFromPrice?: number;
  matchQuality: PidbirMatchQuality;
  /** @deprecated use matchQuality / relaxedBudget */
  fallback: boolean;
  relaxedBudget: boolean;
}

const RELAXED_MAX_FACTOR = 1.25;
const RELAXED_MAX_ADD_UAH = 10_000;
const NEAR_BUDGET_MAX_ADD_UAH = 15_000;
const ASPIRATIONAL_MAX_FACTOR = 1.35;
const ASPIRATIONAL_MAX_ADD_UAH = 12_000;
const PRICE_BUCKET_TOPS_UAH = [40_000, 80_000, 200_000] as const;

export const PICKER_DEFAULT_RESOLUTION: Resolution = "fullhd";
const RESOLUTION_FALLBACK_ORDER: Resolution[] = ["fullhd", "2k", "4k"];

export interface BuildFpsProfile {
  tiers: FpsTier[];
  goodCount: number;
  worstTier: FpsTier;
  worstTierRank: number;
  minFps: number;
  sumFps: number;
  greenCount: number;
}

const TIER_RANK: Record<FpsTier, number> = {
  red: 1,
  orange: 2,
  yellow: 3,
  green: 4,
};

const TIER_BY_RANK: FpsTier[] = ["red", "orange", "yellow", "green"];

function isGoodTier(tier: FpsTier): boolean {
  return tier === "green" || tier === "yellow";
}

function worstTierFromRanks(tiers: FpsTier[]): FpsTier {
  const rank = Math.min(...tiers.map((t) => TIER_RANK[t]));
  return TIER_BY_RANK[rank - 1] ?? "red";
}

export function parseBudget(input?: string | null): {
  min: number;
  max: number;
} {
  if (!input) return { min: 0, max: 200000 };
  const m = input.match(/^(\d+)-(\d+)$/);
  if (m) return { min: Number(m[1]) * 1000, max: Number(m[2]) * 1000 };
  const single = Number(input);
  if (!Number.isNaN(single)) return { min: 0, max: single };
  return { min: 0, max: 200000 };
}

export function parseGames(input?: string | null): string[] {
  if (!input) return [];
  return input.split(",").filter(Boolean).slice(0, 3);
}

/** Скільки обраних ігор мають бути в жовтій/зеленій зоні (1/1, 2/2, 2/3…) */
export function majorityThreshold(gamesCount: number): number {
  return Math.ceil((gamesCount + 1) / 2);
}

function variantCountLabel(count: number): string {
  if (count === 1) return "варіант";
  if (count < 5) return "варіанти";
  return "варіантів";
}

/** Список обраних критеріїв для речень UI: «…критеріїв: Dota 2, Стримінг» */
export function formatCriteriaSuffix(criteriaLabel?: string): string {
  const list = criteriaLabel?.trim().replace(/\s+\+\s+/g, ", ");
  if (!list) return "";
  return `: ${list}`;
}

function fpsLookupOrder(userResolution?: Resolution): Resolution[] {
  if (userResolution) return [userResolution];
  return RESOLUTION_FALLBACK_ORDER;
}

export function findFpsEntry(
  build: Build,
  gameSlug: string,
  userResolution?: Resolution,
): BuildFpsEntry | undefined {
  for (const res of fpsLookupOrder(userResolution)) {
    const entry = build.fps.find(
      (f) => f.gameSlug === gameSlug && f.resolution === res,
    );
    if (entry) return entry;
  }
  return undefined;
}

export function getBuildFpsProfile(
  build: Build,
  games: string[],
  resolution?: Resolution,
): BuildFpsProfile | null {
  if (games.length === 0) return null;

  const tiers: FpsTier[] = [];
  let sumFps = 0;
  let minFps = Infinity;
  let greenCount = 0;
  let goodCount = 0;

  for (const slug of games) {
    const entry = findFpsEntry(build, slug, resolution);
    const fps = entry?.fpsAvg ?? 0;
    const tier = fpsTier(fps);
    tiers.push(tier);
    sumFps += fps;
    minFps = Math.min(minFps, fps);
    if (isGoodTier(tier)) goodCount++;
    if (tier === "green") greenCount++;
  }

  const worstTier = worstTierFromRanks(tiers);

  return {
    tiers,
    goodCount,
    worstTier,
    worstTierRank: TIER_RANK[worstTier],
    minFps: minFps === Infinity ? 0 : minFps,
    sumFps,
    greenCount,
  };
}

export function passesMajorityGood(
  profile: BuildFpsProfile,
  gamesCount: number,
): boolean {
  return profile.goodCount >= majorityThreshold(gamesCount);
}

function filterByPriceUpTo(
  builds: Build[],
  budgetMin: number,
  maxPrice: number,
): Build[] {
  return builds.filter(
    (b) => b.priceUah >= budgetMin && b.priceUah <= maxPrice,
  );
}

function filterByPriceRange(
  builds: Build[],
  minPrice: number,
  maxPrice: number,
): Build[] {
  return builds.filter(
    (b) => b.priceUah >= minPrice && b.priceUah <= maxPrice,
  );
}

export function relaxedBudgetMax(c: PidbirCriteria): number {
  return Math.min(
    Math.round(c.budgetMax * RELAXED_MAX_FACTOR),
    c.budgetMax + RELAXED_MAX_ADD_UAH,
  );
}

/** Верхня межа «наступної» цінової смуги над бюджетом */
export function nearBudgetMax(c: PidbirCriteria): number {
  const nextBucketTop = PRICE_BUCKET_TOPS_UAH.find((top) => top > c.budgetMax);
  if (nextBucketTop !== undefined) return nextBucketTop;
  return Math.max(
    relaxedBudgetMax(c),
    c.budgetMax + NEAR_BUDGET_MAX_ADD_UAH,
  );
}

export function aspirationalBudgetMax(c: PidbirCriteria): number {
  return Math.min(
    Math.round(c.budgetMax * ASPIRATIONAL_MAX_FACTOR),
    c.budgetMax + ASPIRATIONAL_MAX_ADD_UAH,
  );
}

function filterMajorityGood(builds: Build[], c: PidbirCriteria): Build[] {
  return builds.filter((b) => {
    const profile = getBuildFpsProfile(b, c.games, c.resolution);
    return profile && passesMajorityGood(profile, c.games.length);
  });
}

function compareProfiles(
  a: BuildFpsProfile,
  b: BuildFpsProfile,
  priceA: number,
  priceB: number,
  budgetMid: number,
): number {
  if (b.worstTierRank !== a.worstTierRank) {
    return b.worstTierRank - a.worstTierRank;
  }
  if (b.minFps !== a.minFps) return b.minFps - a.minFps;
  if (b.sumFps !== a.sumFps) return b.sumFps - a.sumFps;
  if (b.greenCount !== a.greenCount) return b.greenCount - a.greenCount;
  const distA = Math.abs(priceA - budgetMid);
  const distB = Math.abs(priceB - budgetMid);
  return distA - distB;
}

function tierScore(build: Build): number {
  const tierRank = { starter: 1, base: 2, prime: 3, phantom: 4, pulsar: 5 }[
    build.tier
  ];
  return tierRank * 10;
}

function computeScore(build: Build, c: PidbirCriteria): number {
  const profile = getBuildFpsProfile(build, c.games, c.resolution);
  if (!profile) return tierScore(build);
  return profile.sumFps;
}

function allAboveBudget(pool: Build[], budgetMax: number): boolean {
  return pool.length > 0 && pool.every((b) => b.priceUah > budgetMax);
}

export function rankBuilds(
  pool: Build[],
  c: PidbirCriteria,
  limit = 5,
): PidbirResult[] {
  const budgetMid = (c.budgetMin + c.budgetMax) / 2;
  const preferPrice =
    allAboveBudget(pool, c.budgetMax) && c.budgetMin === 0;

  return [...pool]
    .sort((a, b) => {
      if (preferPrice) {
        const priceDiff = a.priceUah - b.priceUah;
        if (priceDiff !== 0) return priceDiff;
      }
      if (c.games.length > 0) {
        const pa = getBuildFpsProfile(a, c.games, c.resolution)!;
        const pb = getBuildFpsProfile(b, c.games, c.resolution)!;
        return compareProfiles(pa, pb, a.priceUah, b.priceUah, budgetMid);
      }
      return computeScore(b, c) - computeScore(a, c);
    })
    .slice(0, limit)
    .map((build) => ({ build, score: computeScore(build, c) }));
}

function assignBadges(ranked: PidbirResult[], c: PidbirCriteria): PidbirResult[] {
  if (ranked.length < 2) return ranked;

  const cheapest = [...ranked].sort(
    (a, b) => a.build.priceUah - b.build.priceUah,
  )[0];

  let withHeadroom = ranked[0];
  if (c.games.length > 0) {
    withHeadroom = [...ranked].sort((a, b) => {
      const pa = getBuildFpsProfile(a.build, c.games, c.resolution);
      const pb = getBuildFpsProfile(b.build, c.games, c.resolution);
      const minDiff = (pb?.minFps ?? 0) - (pa?.minFps ?? 0);
      if (minDiff !== 0) return minDiff;
      return (pb?.greenCount ?? 0) - (pa?.greenCount ?? 0);
    })[0];
  } else {
    withHeadroom = [...ranked].sort((a, b) => b.score - a.score)[0];
  }

  const middle = ranked[Math.floor(ranked.length / 2)];

  cheapest.badge = "cheapest";
  if (withHeadroom !== cheapest) {
    withHeadroom.badge = "with-headroom";
  }
  if (middle !== cheapest && middle !== withHeadroom) {
    middle.badge = "recommended";
  }

  return ranked;
}

function sortByFpsThenPrice(
  a: Build,
  b: Build,
  c: PidbirCriteria,
  priceAnchor: number,
): number {
  const pa = getBuildFpsProfile(a, c.games, c.resolution)!;
  const pb = getBuildFpsProfile(b, c.games, c.resolution)!;
  const cmp = compareProfiles(pa, pb, a.priceUah, b.priceUah, priceAnchor);
  if (cmp !== 0) return cmp;
  return a.priceUah - b.priceUah;
}

function pickCheapestMajorityGood(
  builds: Build[],
  c: PidbirCriteria,
  maxPrice?: number,
): Build | undefined {
  const candidates = builds.filter((b) => {
    if (maxPrice !== undefined && b.priceUah > maxPrice) return false;
    const profile = getBuildFpsProfile(b, c.games, c.resolution);
    return profile && passesMajorityGood(profile, c.games.length);
  });

  if (candidates.length === 0) return undefined;

  candidates.sort((a, b) => sortByFpsThenPrice(a, b, c, c.budgetMax));
  return candidates[0];
}

function sortByPriceDistance(builds: Build[], budgetMax: number): Build[] {
  return [...builds].sort(
    (a, b) =>
      Math.abs(a.priceUah - budgetMax) - Math.abs(b.priceUah - budgetMax),
  );
}

/** Усі majority-good у повному наступному ціновому діапазоні над бюджетом. */
function majorityGoodAboveBudget(
  builds: Build[],
  c: PidbirCriteria,
): Build[] {
  const nearMax = nearBudgetMax(c);
  return filterMajorityGood(
    filterByPriceRange(builds, c.budgetMax + 1, nearMax),
    c,
  );
}

/**
 * Універсальний водоспад:
 * 1) majority-good у точному бюджеті
 * 2) усі majority-good у наступній ціновій смузі (budgetMax … nearMax)
 * 3) FPS-компроміс у бюджеті, потім у наступній смузі
 * 4) найближчі за ціною збірки
 */
function selectPool(
  builds: Build[],
  c: PidbirCriteria,
  limit: number,
): {
  pool: Build[];
  matchQuality: PidbirMatchQuality;
  relaxedBudget: boolean;
} {
  const inBudgetGood = filterMajorityGood(
    filterByPriceUpTo(builds, c.budgetMin, c.budgetMax),
    c,
  );
  if (inBudgetGood.length > 0) {
    return {
      pool: inBudgetGood,
      matchQuality: "ideal",
      relaxedBudget: false,
    };
  }

  const aboveGood = majorityGoodAboveBudget(builds, c);
  if (aboveGood.length > 0) {
    return {
      pool: aboveGood,
      matchQuality: "budget_relaxed",
      relaxedBudget: true,
    };
  }

  const inBudget = filterByPriceUpTo(builds, c.budgetMin, c.budgetMax);
  if (inBudget.length > 0) {
    return {
      pool: inBudget,
      matchQuality: "fps_compromise",
      relaxedBudget: false,
    };
  }

  const aboveBand = filterByPriceRange(
    builds,
    c.budgetMax + 1,
    nearBudgetMax(c),
  );
  if (aboveBand.length > 0) {
    return {
      pool: aboveBand,
      matchQuality: "fps_compromise_relaxed",
      relaxedBudget: true,
    };
  }

  return {
    pool: sortByPriceDistance(builds, c.budgetMax).slice(0, limit),
    matchQuality: "fps_compromise_relaxed",
    relaxedBudget: true,
  };
}

function pickAspirational(
  builds: Build[],
  c: PidbirCriteria,
  results: PidbirResult[],
  matchQuality: PidbirMatchQuality,
): { aspirational?: PidbirResult; stableFpsFromPrice?: number } {
  if (c.games.length === 0) return {};

  const isCompromise =
    matchQuality === "fps_compromise" ||
    matchQuality === "fps_compromise_relaxed";
  if (!isCompromise) return {};

  const resultSlugs = new Set(results.map((r) => r.build.slug));
  const nearMax = nearBudgetMax(c);
  const globalBest = pickCheapestMajorityGood(builds, c);

  if (!globalBest) return {};

  const stableFpsFromPrice =
    globalBest.priceUah > nearMax ? globalBest.priceUah : undefined;

  const withinCap = pickCheapestMajorityGood(
    builds,
    c,
    aspirationalBudgetMax(c),
  );
  if (!withinCap || resultSlugs.has(withinCap.slug)) {
    return { stableFpsFromPrice };
  }
  if (withinCap.priceUah <= c.budgetMax) {
    return { stableFpsFromPrice };
  }

  return {
    aspirational: {
      build: withinCap,
      score: computeScore(withinCap, c),
      badge: "stable-fps",
    },
    stableFpsFromPrice,
  };
}

function pickBuildsWithGames(
  c: PidbirCriteria,
  builds: Build[],
  limit: number,
): PidbirPickResult {
  const { pool, matchQuality, relaxedBudget } = selectPool(builds, c, limit);
  const displayLimit = Math.min(limit, pool.length);
  const results = assignBadges(rankBuilds(pool, c, displayLimit), c);
  const { aspirational, stableFpsFromPrice } = pickAspirational(
    builds,
    c,
    results,
    matchQuality,
  );

  return {
    results,
    aspirational,
    stableFpsFromPrice,
    matchQuality,
    relaxedBudget,
    fallback: relaxedBudget,
  };
}

function pickBuildsWithoutGames(
  c: PidbirCriteria,
  builds: Build[],
  limit: number,
): PidbirPickResult {
  let pool = filterByPriceUpTo(builds, c.budgetMin, c.budgetMax);
  let relaxedBudget = false;

  if (pool.length === 0) {
    pool = filterByPriceUpTo(builds, c.budgetMin, relaxedBudgetMax(c));
    relaxedBudget = true;
  }
  if (pool.length === 0) {
    pool = filterByPriceUpTo(builds, c.budgetMin, nearBudgetMax(c));
    relaxedBudget = true;
  }
  if (pool.length === 0) {
    pool = sortByPriceDistance(builds, c.budgetMax).slice(0, limit);
    relaxedBudget = true;
  }

  const matchQuality: PidbirMatchQuality = relaxedBudget
    ? "budget_relaxed"
    : "ideal";

  const results = assignBadges(rankBuilds(pool, c, limit), c);

  return {
    results,
    matchQuality,
    relaxedBudget,
    fallback: relaxedBudget,
  };
}

export function pickBuilds(
  c: PidbirCriteria,
  builds: Build[],
  limit = 5,
): PidbirPickResult {
  if (builds.length === 0) {
    return {
      results: [],
      matchQuality: "fps_compromise_relaxed",
      relaxedBudget: false,
      fallback: false,
    };
  }

  if (c.games.length === 0) {
    return pickBuildsWithoutGames(c, builds, limit);
  }

  return pickBuildsWithGames(c, builds, limit);
}

export const BADGE_META: Record<
  BadgeKey,
  { label: string; tone: "green" | "neutral" | "blue" }
> = {
  cheapest: { label: "💰 Найдоступніше", tone: "neutral" },
  recommended: { label: "✓ Рекомендовано", tone: "green" },
  "with-headroom": { label: "⚡ З запасом", tone: "blue" },
  "stable-fps": { label: "✓ Мінімум для 60+ FPS", tone: "green" },
};

export const MATCH_QUALITY_COPY: Record<
  PidbirMatchQuality,
  (count: number, gamesCount: number, criteriaLabel?: string) => string
> = {
  ideal: (count, _gamesCount, criteriaLabel) =>
    `Знайдено ${count} ${variantCountLabel(count)} зі стабільним FPS для обраних критеріїв${formatCriteriaSuffix(criteriaLabel)}.`,
  budget_relaxed: (_count, _gamesCount, criteriaLabel) =>
    `У вашому ціновому діапазоні не знайшлось збірок зі стабільним FPS для обраних критеріїв${formatCriteriaSuffix(criteriaLabel)}. Рекомендуємо моделі трохи дорожче — вони забезпечать гарний результат без компромісів.`,
  fps_compromise: (_count, _gamesCount, criteriaLabel) =>
    `У цьому бюджеті стабільний FPS не для всіх обраних критеріїв${formatCriteriaSuffix(criteriaLabel)} — ось найкращий компроміс.`,
  fps_compromise_relaxed: (_count, _gamesCount, criteriaLabel) =>
    `У вашому ціновому діапазоні не вдалося досягти стабільного FPS для обраних критеріїв${formatCriteriaSuffix(criteriaLabel)}. Ось найближчі варіанти з невеликим перевищенням бюджету.`,
};
