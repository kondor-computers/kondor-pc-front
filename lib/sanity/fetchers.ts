import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/revalidate";
import { sanityClient } from "./client";
import {
  CATEGORIES_WITH_ITEM_IDS,
  ALL_ITEMS,
  ITEM_BY_SLUG,
  ADDON_ITEMS,
} from "./queries";
import {
  categorySummaries,
  resolveCatalogItems,
} from "@/lib/catalog/fromCategories";
import type {
  CategoryItemLinks,
  CategorySummary,
  CatalogProductDetail,
  CatalogProductListItem,
} from "@/types/catalog";

/**
 * Thin server-side fetchers. Next.js caches GROQ responses by URL automatically
 * via its fetch layer; we add explicit `revalidate` hints for clarity.
 */

/**
 * The itemId → category lookup table — the primary source of truth for
 * category ↔ product membership (see `lib/catalog/fromCategories.ts`).
 */
async function getCategoryItemLinks(): Promise<CategoryItemLinks[]> {
  return sanityClient.fetch(CATEGORIES_WITH_ITEM_IDS, {}, {
    next: {
      revalidate: SANITY_REVALIDATE_SECONDS,
      tags: ["sanity:categories"],
    },
  });
}

async function getRawItems(): Promise<CatalogProductListItem[]> {
  return sanityClient.fetch(ALL_ITEMS, {}, {
    next: { revalidate: SANITY_REVALIDATE_SECONDS, tags: ["sanity:items"] },
  });
}

/**
 * Resolved catalog items — `getAllCategories` and `getCatalogItems` both
 * derive from this so the listing and the sidebar counts can never disagree.
 */
async function getResolvedCatalog(): Promise<{
  categories: CategoryItemLinks[];
  items: CatalogProductListItem[];
}> {
  const [categories, rawItems] = await Promise.all([
    getCategoryItemLinks(),
    getRawItems(),
  ]);
  return { categories, items: resolveCatalogItems(categories, rawItems) };
}

export async function getAllCategories(): Promise<CategorySummary[]> {
  const { categories, items } = await getResolvedCatalog();
  return categorySummaries(categories, items);
}

export async function getCatalogItems(): Promise<CatalogProductListItem[]> {
  const { items } = await getResolvedCatalog();
  return items;
}

export async function getItemBySlug(
  slug: string,
): Promise<CatalogProductDetail | null> {
  return sanityClient.fetch(
    ITEM_BY_SLUG,
    { slug },
    {
      next: {
        revalidate: SANITY_REVALIDATE_SECONDS,
        tags: ["sanity:items", `sanity:item:${slug}`],
      },
    },
  );
}

/** Other items sharing the same resolved category (excluding self). */
export async function getSimilarItems(
  slug: string,
  categorySlug: string,
): Promise<CatalogProductListItem[]> {
  const items = await getCatalogItems();
  return items
    .filter((i) => i.category?.slug === categorySlug && i.slug !== slug)
    .slice(0, 6);
}

export async function getAddonItems(): Promise<CatalogProductListItem[]> {
  return sanityClient.fetch(ADDON_ITEMS, {}, {
    next: { revalidate: SANITY_REVALIDATE_SECONDS, tags: ["sanity:items", "sanity:addons"] },
  });
}
