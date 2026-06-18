/**
 * Single source of data for /game-pc and /promo landing blocks.
 *
 * Sanity-first: pages live in the kondor-pc-admin project (`if6dzz62`).
 * Local mocks back build/testimonial blocks that still depend on mocked data.
 *
 * Block components and pages must NEVER import mocks or the Sanity client
 * directly — only through this adapter.
 */
import type {
  Build,
  LandingPage,
  LandingPageContextRef,
  ResolvedPageContext,
  Testimonial,
} from "./types";
import {allBuilds} from "./mocks/builds";
import {allTestimonials} from "./mocks/testimonials";
import {
  fetchLandingPageBySlug,
  fetchLandingSlugs,
  buildSanityPageContext,
  type LandingPathPrefix,
} from "@/lib/sanity/landingAdapter";

const BUILDS_BY_SLUG: Record<string, Build> = Object.fromEntries(
  allBuilds.map((b) => [b.slug, b]),
);

export async function getBuildBySlug(slug: string): Promise<Build | null> {
  return BUILDS_BY_SLUG[slug] ?? null;
}

export async function getAllBuilds(): Promise<Build[]> {
  return allBuilds;
}

export async function getBuildsRecommendedForGame(
  gameSlug: string,
): Promise<Build[]> {
  const order: Record<Build["tier"], number> = {budget: 0, mid: 1, high: 2};
  const matches = allBuilds
    .filter((b) => b.recommendedForGames.includes(gameSlug))
    .sort((a, b) => order[a.tier] - order[b.tier]);
  if (matches.length >= 3) return matches.slice(0, 3);
  const fallback = [...allBuilds].sort(
    (a, b) => order[a.tier] - order[b.tier],
  );
  const seen = new Set(matches.map((m) => m.slug));
  for (const b of fallback) {
    if (matches.length >= 3) break;
    if (!seen.has(b.slug)) {
      matches.push(b);
      seen.add(b.slug);
    }
  }
  return matches.slice(0, 3);
}

export async function getTestimonialsByGameTag(
  gameTag: string,
  limit?: number,
): Promise<Testimonial[]> {
  const list = allTestimonials.filter((t) => t.gameTags.includes(gameTag));
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export async function getLandingPageBySlug(
  slug: string,
  prefix: LandingPathPrefix = "game-pc",
): Promise<LandingPage | null> {
  return fetchLandingPageBySlug(slug, prefix);
}

export async function getAllLandingPageSlugs(
  prefix: LandingPathPrefix = "game-pc",
): Promise<string[]> {
  return fetchLandingSlugs(prefix);
}

export async function resolvePageContext(
  ref: LandingPageContextRef,
): Promise<ResolvedPageContext> {
  return {
    refType: ref.refType,
    refSlug: ref.refSlug,
    displayName: prettifySlug(ref.refSlug),
  };
}

function prettifySlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export type {LandingPathPrefix};
export {buildSanityPageContext};
