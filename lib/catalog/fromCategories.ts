import type {
  CatalogProductListItem,
  CategoryItemLinks,
  CategorySummary,
} from "@/types/catalog";

/**
 * Category ↔ product membership is primarily authored on the *category*
 * document (its `items[]` array) — not on the item's own `cat` field. That
 * field exists in the schema but editors don't reliably keep it in sync
 * (real-world example: "Kondor Legion PRO" has `cat` empty yet is correctly
 * linked from the "Клавіатури Legion" category's `items[]`; conversely a
 * handful of other items — e.g. "Kondor Moonlight" / "kondor-moonlight11" —
 * have `cat` set but were never added to any category's `items[]`).
 *
 * `resolveCatalogItems` therefore prefers the `items[]` link and only falls
 * back to the item's own `cat` (`legacyCategory`, fetched by `ALL_ITEMS`)
 * when no category references the item at all — so a real product never
 * silently disappears from the catalog just because an editor forgot to add
 * it to a category's `items[]`.
 */
export function resolveCatalogItems(
  categories: CategoryItemLinks[],
  items: CatalogProductListItem[],
): CatalogProductListItem[] {
  const categoryByItemId = new Map<string, { name: string; slug: string }>();
  for (const cat of categories) {
    for (const id of cat.itemIds ?? []) {
      if (!id || categoryByItemId.has(id)) continue; // first category wins
      categoryByItemId.set(id, { name: cat.name, slug: cat.slug });
    }
  }

  return items.map(({ legacyCategory, ...item }) => ({
    ...item,
    category: categoryByItemId.get(item.id) ?? legacyCategory ?? undefined,
  }));
}

/**
 * Category sidebar summaries. `itemsCount` is derived from the *resolved*
 * items (post `resolveCatalogItems`) so it can never disagree with what the
 * listing actually shows.
 */
export function categorySummaries(
  categories: CategoryItemLinks[],
  resolvedItems: CatalogProductListItem[],
): CategorySummary[] {
  const counts = new Map<string, number>();
  for (const item of resolvedItems) {
    if (!item.category) continue;
    counts.set(item.category.slug, (counts.get(item.category.slug) ?? 0) + 1);
  }

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    pos: cat.pos,
    image: cat.image,
    itemsCount: counts.get(cat.slug) ?? 0,
  }));
}
