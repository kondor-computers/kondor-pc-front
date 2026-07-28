/**
 * Typed contracts for the peripherals catalog (sourced from Kondor Devices Sanity).
 * Raw Sanity shapes live only inside lib/sanity/adapters.ts — consumers see
 * these clean types so we can swap the data source later without touching UI.
 */

export interface SanityImageRef {
  _type?: "image";
  asset?: { _ref: string; _type: string };
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  pos: number;
  itemsCount: number;
  image?: SanityImageRef;
}

export interface CatalogBadge {
  text: string;
  hex?: string;
}

export interface CatalogColorDot {
  code?: string;
  color: string;
  hex?: string;
  photo?: SanityImageRef;
}

export interface CatalogProductListItem {
  id: string;
  slug: string;
  name: string;
  generalname?: string;
  price: number;
  priceDiscount?: number;
  newItem?: boolean;
  preorder?: boolean;
  /** Homepage-only teaser flag — excluded from the catalog listing (see `ALL_ITEMS`). */
  showonmain?: boolean;
  badge?: CatalogBadge;
  /**
   * Resolved category — prefers the category doc whose `items[]` array
   * references this item, falls back to the item's own (unreliable) `cat`
   * field. See `resolveCatalogItems` in `lib/catalog/fromCategories.ts`.
   */
  category?: { name: string; slug: string };
  /**
   * Raw fallback signal from the item's own `cat` field — only present on
   * the un-resolved shape returned by `ALL_ITEMS`; consumers should read
   * `category` instead (set by `resolveCatalogItems`).
   */
  legacyCategory?: { name: string; slug: string };
  heroImage?: SanityImageRef;
  colors?: CatalogColorDot[];
}

/**
 * Raw shape of `CATEGORIES_WITH_ITEM_IDS` — a category document with just
 * the reference ids of its linked products (cheap lookup table). This is
 * the authoritative category ↔ product relationship; see
 * `lib/catalog/fromCategories.ts`.
 */
export interface CategoryItemLinks {
  id: string;
  name: string;
  slug: string;
  pos: number;
  image?: SanityImageRef;
  itemIds: (string | null)[];
}

/**
 * A catalog grouping unit: a "product" as the shopper perceives it
 * (one card in the listing), regardless of how many colour-variant items
 * with different IDs represent it in the admin.
 *
 * Contract for cart/KCM: `variants[i]` is a full `CatalogProductListItem`,
 * so whatever the user picks still has a real Sanity `id`/`slug`.
 */
export interface CatalogProductGroup {
  /** Stable key used by React — derived from the grouping signal. */
  key: string;
  /** All the real items that fall into this visual group. `variants[0]` is the default display. */
  variants: CatalogProductListItem[];
}

export interface ColorVariant {
  code?: string;
  color: string;
  hex?: string;
  photos: SanityImageRef[];
}

export interface CharRow {
  name: string;
  char: string;
}

export interface ComplectRow {
  name: string;
  icon?: SanityImageRef;
}

export interface CatalogProductDetail {
  id: string;
  slug: string;
  name: string;
  generalname?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: SanityImageRef;
  description?: string;
  price: number;
  priceDiscount?: number;
  newItem?: boolean;
  preorder?: boolean;
  preordertext?: string;
  manual?: string;
  driver?: string;
  video?: { url?: string };
  badge?: CatalogBadge;
  category?: { name: string; slug: string };
  coloropts: ColorVariant[];
  chars: CharRow[];
  complect: ComplectRow[];
}
