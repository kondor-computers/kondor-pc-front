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

/** Minimal projection shared across listings — keeps payload small. */
const LISTING_PROJECTION = `
  "id": _id,
  "slug": slug,
  name,
  generalname,
  price,
  priceDiscount,
  "badge": badge->{text, "hex": backgroundColor.hex},
  "category": cat->{name, slug},
  newItem,
  preorder,
  "heroImage": coloropts[0].photos[0],
  "colors": coloropts[]{
    code,
    color,
    "hex": colorset.hex.hex,
    "photo": photos[0]
  }
`;

/** Full projection for a single product detail. */
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
  "category": cat->{name, slug},
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

export const ALL_CATEGORIES = groq`
*[_type == "category"] | order(pos asc) {
  "id": _id,
  name,
  slug,
  pos,
  "image": image{..., "alt": alt},
  "itemsCount": count(*[_type == "item" && cat._ref == ^._id])
}
`;

/** All items in the catalog, optionally filtered by category slugs. */
export const CATALOG_ITEMS = groq`
*[_type == "item" && (count($categorySlugs) == 0 || cat->slug in $categorySlugs)]
  | order(newItem desc, _createdAt desc) {
  ${LISTING_PROJECTION}
}
`;

/** Single product by slug. */
export const ITEM_BY_SLUG = groq`
*[_type == "item" && slug == $slug][0] {
  ${DETAIL_PROJECTION}
}
`;

/** Similar products in same category (excluding self). */
export const SIMILAR_ITEMS = groq`
*[_type == "item" && cat->slug == $categorySlug && slug != $slug][0...6] {
  ${LISTING_PROJECTION}
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
