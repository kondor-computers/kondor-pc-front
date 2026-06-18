import type { Game } from "@/types/build";
import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/revalidate";
import { sanityPcClient } from "./client";
import { urlForPc } from "./image";

type RawGame = {
  slug?: string;
  name?: string;
  ukrName?: string;
  shortName?: string;
  genre?: Game["genre"];
  isPopular?: boolean;
  isSystemHeavy?: boolean;
  coverImage?: unknown;
  sortOrder?: number;
};

const GAMES_QUERY = `
*[_type == "game" && coalesce(enabled, true) == true]
| order(coalesce(sortOrder, 9999) asc, name asc) {
  slug,
  name,
  ukrName,
  shortName,
  genre,
  isPopular,
  isSystemHeavy,
  coverImage,
  sortOrder
}
`;

function toImageUrl(image: unknown): string | undefined {
  if (!image) return undefined;
  try {
    return urlForPc(image as never).width(720).quality(85).auto("format").url();
  } catch {
    return undefined;
  }
}

export async function getAllGames(): Promise<Game[]> {
  const rows = await sanityPcClient.fetch<RawGame[]>(
    GAMES_QUERY,
    {},
    { next: { revalidate: SANITY_REVALIDATE_SECONDS } },
  );
  return rows
    .filter((g) => Boolean(g.slug && g.name))
    .map((g) => ({
      slug: g.slug!,
      name: g.name!,
      ukrName: g.ukrName || undefined,
      shortName: g.shortName || undefined,
      genre: g.genre,
      isPopular: Boolean(g.isPopular),
      isSystemHeavy: Boolean(g.isSystemHeavy),
      coverImageUrl: toImageUrl(g.coverImage),
    }));
}

export function makeGameLabelMap(games: Game[]): Record<string, string> {
  return Object.fromEntries(games.map((g) => [g.slug, g.ukrName || g.name]));
}

export function makeGameShortLabelMap(games: Game[]): Record<string, string> {
  return Object.fromEntries(games.map((g) => [g.slug, g.shortName || g.ukrName || g.name]));
}
