import type {
  CatalogProductGroup,
  CatalogProductListItem,
} from "@/types/catalog";

/**
 * Group items that represent the same product sold in multiple colour
 * variants (e.g. "Aviator Чорний" + "Aviator Білий" — different SKUs, same
 * product family).
 *
 * Key algorithm:
 *   1. Compute a *name stem* — the product name minus its trailing colour
 *      word, using the item's own `colors[0].color` as the colour reference.
 *      A word is stripped only when it shares its first few Cyrillic chars
 *      with the colour — this avoids stripping unrelated trailing tokens
 *      like "Waterproof" or "Snowline".
 *   2. Combine stem with `generalname`. Two items merge only when they share
 *      BOTH the family tag (generalname) AND the colour-stripped stem — so
 *      "Aviator" cables group together, while 10+ distinct "Ігрова поверхня"
 *      mousepads stay separate (each has its own stem).
 *   3. When the stem ends up empty (e.g. the whole name IS the colour, as for
 *      keycap sets "Біло-рожеві"), fall back to the full name — those items
 *      don't collapse, which is correct because each is a distinct product.
 *
 * Grouping is *display only*. Every variant keeps its real `id`, `slug`,
 * `price`, so cart/KCM receive the exact picked SKU.
 */

/**
 * Lowercase + strip a Cyrillic colour word from the tail of `name`.
 * Matches the colour's root (first 4 chars) to catch inflection differences
 * ("чорний" in one form vs "чорні" in another).
 */
function nameStem(name: string, primaryColour?: string): string {
  const base = (name ?? "").replace(/\s+/g, " ").trim();
  if (!base) return "";
  if (!primaryColour) return base.toLowerCase();

  const normColour = primaryColour
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  // Colour can be compound like "біло-чорний" — extract each root (first 4
  // chars) so we can match "Чорний" / "чорні" / "чорного" alike.
  const tokens = normColour.split(/[\s-]+/).filter(Boolean);
  const roots = tokens
    .map((t) => t.slice(0, Math.min(4, t.length)))
    .filter((r) => r.length >= 3);

  if (roots.length === 0) return base.toLowerCase();

  // Split name into words on whitespace/dash; strip trailing words whose
  // lowercased prefix matches any colour root.
  const words = base.split(/\s+/);
  while (words.length > 0) {
    const last = words[words.length - 1].toLowerCase();
    const matches = roots.some((r) => last.startsWith(r));
    if (!matches) break;
    words.pop();
  }
  return words.join(" ").toLowerCase();
}

export function groupProducts(
  items: CatalogProductListItem[],
): CatalogProductGroup[] {
  const byKey = new Map<string, CatalogProductListItem[]>();

  for (const item of items) {
    const primaryColour = item.colors?.find((c) => c?.color)?.color;
    const stem = nameStem(item.name ?? "", primaryColour);
    const gname = (item.generalname ?? "").trim().toLowerCase();

    // If stripping the colour left an empty stem, the whole name WAS the
    // colour — distinct products (keycap sets by colour name) — so fall back
    // to the full name to keep them separate.
    const effectiveStem =
      stem.length > 0
        ? stem
        : (item.name ?? "").trim().toLowerCase() || `slug:${item.slug}`;

    // Composite key: family tag + stem. generalname prevents unrelated
    // products with coincidentally identical stems from merging across
    // families; stem collapses same-family colour variants.
    const key = `${gname}:${effectiveStem}`;

    const bucket = byKey.get(key);
    if (bucket) bucket.push(item);
    else byKey.set(key, [item]);
  }

  const groups: CatalogProductGroup[] = [];
  for (const [key, variants] of byKey) {
    // Deterministic variant order — discounted first, then by slug. Keeps the
    // default swatch stable between renders.
    variants.sort((a, b) => {
      const aDisc =
        typeof a.priceDiscount === "number" && a.priceDiscount < a.price ? 1 : 0;
      const bDisc =
        typeof b.priceDiscount === "number" && b.priceDiscount < b.price ? 1 : 0;
      if (aDisc !== bDisc) return bDisc - aDisc;
      return a.slug.localeCompare(b.slug);
    });
    groups.push({ key, variants });
  }
  return groups;
}

/**
 * Helpers consumed by the catalog filter/sort pipeline. Each accepts a group
 * and returns the value that the list should reason about (effective price
 * uses the *cheapest* variant, because the card's swatch will default to the
 * best-price variant when the user lands on the listing).
 */
export function groupEffectivePrice(group: CatalogProductGroup): number {
  let min = Infinity;
  for (const v of group.variants) {
    const p =
      typeof v.priceDiscount === "number" && v.priceDiscount < v.price
        ? v.priceDiscount
        : v.price;
    if (p < min) min = p;
  }
  return Number.isFinite(min) ? min : 0;
}

export function groupHasAvailability(
  group: CatalogProductGroup,
  kind: "in-stock" | "pre-order",
): boolean {
  if (kind === "pre-order") return group.variants.some((v) => !!v.preorder);
  return group.variants.some((v) => !v.preorder);
}

export function groupHasDiscount(group: CatalogProductGroup): boolean {
  return group.variants.some(
    (v) => typeof v.priceDiscount === "number" && v.priceDiscount < v.price,
  );
}

export function groupCategorySlug(
  group: CatalogProductGroup,
): string | undefined {
  return group.variants.find((v) => v.category?.slug)?.category?.slug;
}

export function groupName(group: CatalogProductGroup): string {
  return group.variants[0]?.name ?? "";
}
