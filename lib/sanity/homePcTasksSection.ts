import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/revalidate";
import { contentClient, contentImageUrl } from "./contentClient";

export type HomePcTaskCard = {
  name: string;
  href: string;
  iconUrl: string;
};

type RawItem = {
  name?: string;
  gameSlugs?: (string | null)[];
  icon?: unknown;
};

const HOME_PC_TASKS_QUERY = `
*[_type == "homePcTasksSection" && _id == "homePcTasksSection"][0]{
  items[]{
    name,
    "gameSlugs": games[]->slug,
    icon
  }
}
`;

export function buildPkCatalogHref(gameSlugs: string[]): string {
  const slugs = [...new Set(gameSlugs.map((s) => s.trim()).filter(Boolean))];
  if (slugs.length === 0) return "/pk";
  return `/pk?${new URLSearchParams({ games: slugs.join(",") }).toString()}`;
}

function taskIconUrl(icon: unknown): string | null {
  if (!icon) return null;
  try {
    return contentImageUrl(icon as never).width(80).height(80).auto("format").url();
  } catch {
    return null;
  }
}

export async function getHomePcTasks(): Promise<HomePcTaskCard[]> {
  const row = await contentClient.fetch<{ items?: RawItem[] } | null>(
    HOME_PC_TASKS_QUERY,
    {},
    {
      next: {
        revalidate: SANITY_REVALIDATE_SECONDS,
        tags: ["sanity:homePcTasksSection"],
      },
    },
  );

  if (!row?.items?.length) return [];

  const cards: HomePcTaskCard[] = [];

  for (const item of row.items) {
    const name = item.name?.trim();
    const gameSlugs = (item.gameSlugs ?? []).filter(
      (slug): slug is string => typeof slug === "string" && slug.length > 0,
    );
    const iconUrl = taskIconUrl(item.icon);

    if (!name || gameSlugs.length === 0 || !iconUrl) continue;

    cards.push({
      name,
      href: buildPkCatalogHref(gameSlugs),
      iconUrl,
    });
  }

  return cards;
}
