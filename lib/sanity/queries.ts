/**
 * GROQ queries for the Kondor Devices peripherals catalog.
 * Source of truth: kondor-devices-admin (projectId `qmszlzqu`, dataset `production`).
 * We pull read-only — the old admin remains untouched.
 */

/** Identity-tagged template for GROQ — no runtime deps, just enables editor highlighting. */
const groq = (strings: TemplateStringsArray, ...values: unknown[]) =>
  strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? String(values[i]) : ""),
    "",
  );

/**
 * Minimal projection shared across listings — keeps payload small.
 *
 * `legacyCategory` is the per-item `cat` reference — kept only as a
 * *fallback* signal. It exists in the schema but is NOT reliably kept in
 * sync by editors (e.g. the "Kondor Legion PRO" keyboard has `cat` empty).
 * The primary category ↔ product relationship is authored the other way
 * around — via the `items[]` array on the *category* document, same as on
 * the sister site built from this admin (see `CATEGORIES_WITH_ITEM_IDS` /
 * `resolveCatalogItems` in lib/catalog/fromCategories.ts). We still fall
 * back to `legacyCategory` for items an editor never added to any
 * category's `items[]`, so nothing that used to be visible disappears.
 */
const LISTING_PROJECTION = `
  "id": _id,
  "slug": slug,
  name,
  generalname,
  price,
  priceDiscount,
  "badge": badge->{text, "hex": backgroundColor.hex},
  newItem,
  preorder,
  showonmain,
  "legacyCategory": cat->{name, slug},
  "heroImage": coloropts[0].photos[0],
  "colors": coloropts[]{
    code,
    color,
    "hex": colorset.hex.hex,
    "photo": photos[0]
  }
`;

/**
 * Full projection for a single product detail.
 * `category` prefers the reverse lookup (category doc whose `items[]`
 * references this item) and falls back to the item's own `cat` field —
 * same priority as the listing (see LISTING_PROJECTION comment).
 */
const DETAIL_PROJECTION = `
  "id": _id,
  "slug": slug,
  name,
  generalname,
  seoTitle,
  seoDescription,
  "seoImage": seoImage{..., "alt": alt},
  description,
  price,
  priceDiscount,
  newItem,
  preorder,
  preordertext,
  manual,
  driver,
  video,
  "badge": badge->{text, "hex": backgroundColor.hex},
  "category": coalesce(
    *[_type == "category" && references(^._id)][0]{name, slug},
    cat->{name, slug}
  ),
  coloropts[]{
    code,
    color,
    "hex": colorset.hex.hex,
    photos[]{..., "alt": alt}
  },
  chars[]{name, char},
  complect[]{
    name,
    "icon": icon{..., "alt": alt}
  }
`;

// ──────────────────────────────────────────────────────────────
//  Queries
// ──────────────────────────────────────────────────────────────

/**
 * Category list with just the `items[]` reference ids — cheap lookup table
 * used to build the authoritative itemId → category map. See
 * `resolveCatalogItems` in lib/catalog/fromCategories.ts.
 */
export const CATEGORIES_WITH_ITEM_IDS = groq`
*[_type == "category"] | order(pos asc) {
  "id": _id,
  name,
  slug,
  pos,
  "image": image{..., "alt": alt},
  "itemIds": items[]._ref
}
`;

/**
 * All catalog items (excludes `showonmain` homepage-only teasers — see
 * LISTING_PROJECTION note on legacyCategory for why those can otherwise
 * collide with a real product).
 */
export const ALL_ITEMS = groq`
*[_type == "item" && showonmain != true] | order(newItem desc, _createdAt desc) {
  ${LISTING_PROJECTION}
}
`;

/** Single product by slug. */
export const ITEM_BY_SLUG = groq`
*[_type == "item" && slug == $slug][0] {
  ${DETAIL_PROJECTION}
}
`;

/** Accessories pool — items flagged for addon display. Used on PC pages. */
export const ADDON_ITEMS = groq`
*[_type == "item" && showonaddons == true][0...12] {
  ${LISTING_PROJECTION}
}
`;

/** Items flagged for homepage — useful for optional featured sections. */
export const HOMEPAGE_ITEMS = groq`
*[_type == "item" && showonmain == true] | order(order asc) {
  ${LISTING_PROJECTION}
}
`;
