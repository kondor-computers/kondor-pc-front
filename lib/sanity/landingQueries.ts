/**
 * GROQ queries for the landing-page constructor.
 * Source of truth: kondor-pc-admin (projectId `if6dzz62`, dataset `production`).
 *
 * Each section type expands the refs it needs (promoCode, tags, etc.) so the
 * frontend gets a self-contained payload — no N+1 follow-up fetches.
 */
import { SEO_SETTINGS_PROJECTION } from "@/lib/sanity/siteSeoQueries";

const groq = (strings: TemplateStringsArray, ...values: unknown[]) =>
  strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? String(values[i]) : ""),
    "",
  );

// Fragment used wherever an image asset appears. We pull the raw ref + alt;
// the adapter resolves the CDN URL via @sanity/image-url.
const IMAGE_FRAGMENT = `{
  ..., "asset": asset,
  "alt": coalesce(alt, ""),
  "caption": coalesce(caption, "")
}`;

/** Match a page by pathPrefix + slug. */
export const LANDING_PAGE_BY_SLUG = groq`
*[_type=="page" && pathPrefix==$prefix && slug.current==$slug][0]{
  _id,
  _updatedAt,
  internalTitle,
  pathPrefix,
  "slug": slug.current,
  "tags": tags[]->{_id, name, "slug": slug.current, category},
  "seo": seo${SEO_SETTINGS_PROJECTION},
  publishedAt,
  expiresAt,
  redirectsFrom,
  "sections": sections[]{
    _key, _type,

    // breadcrumbs — no payload to fetch
    _type=="breadcrumbs" => {anchor},

    // anchorNav
    _type=="anchorNav" => {
      anchor, sticky,
      "items": items[]{label, anchor}
    },

    // heroSimple
    _type=="heroSimple" => {
      h1, subtitle, anchor,
      "cta": cta{text, href},
      "bgImage": bgImage${IMAGE_FRAGMENT}
    },

    // statsStrip
    _type=="statsStrip" => {
      anchor,
      "stats": stats[]{value, label, link}
    },

    // textBlock — Portable Text body
    _type=="textBlock" => {
      heading, subheading, maxWidth, anchor,
      body
    },

    // imageFull
    _type=="imageFull" => {
      anchor, caption, aspectRatio,
      "image": image${IMAGE_FRAGMENT}
    },

    // imageTextSplit — Portable Text body
    _type=="imageTextSplit" => {
      anchor, heading, imagePosition,
      "cta": cta{text, href},
      "image": image${IMAGE_FRAGMENT},
      body
    },

    // featureList
    _type=="featureList" => {
      anchor, heading, subheading, columns,
      "features": features[]{icon, title, text}
    },

    // mediaVideo
    _type=="mediaVideo" => {
      anchor, videoUrl, caption,
      "posterImage": posterImage${IMAGE_FRAGMENT}
    },

    // faqAccordion — inline faqQuestion objects
    _type=="faqAccordion" => {
      anchor, heading,
      "items": items[]{_key, question, answer}
    },

    // ctaPromoBanner — promoCode is a ref to promoCode document
    _type=="ctaPromoBanner" => {
      anchor, title, promoText,
      "promoCode": promoCode->{
        code,
        validFrom,
        validUntil,
        "discountPc": discountPc{kind, value},
        "discountAccessories": discountAccessories{kind, value}
      },
      "button": button{text, href}
    }
  }
}`;

/** Slugs for generateStaticParams. */
export const LANDING_SLUGS_BY_PREFIX = groq`
*[_type=="page" && pathPrefix==$prefix && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt,
  expiresAt
} | order(_updatedAt desc)`;

/** Card previews for /game-pc or /promo landing groups. */
export const LANDING_PREVIEWS_BY_PREFIX = groq`
*[_type=="page" && pathPrefix==$prefix && defined(slug.current)]{
  "slug": slug.current,
  "title": coalesce(seo.metaTitle, internalTitle, sections[_type=="heroSimple"][0].h1),
  "description": coalesce(seo.metaDescription, sections[_type=="heroSimple"][0].subtitle, ""),
  "image": coalesce(
    seo.opengraphImage${IMAGE_FRAGMENT},
    sections[_type=="heroSimple"][0].bgImage${IMAGE_FRAGMENT}
  ),
  publishedAt,
  expiresAt
} | order(coalesce(publishedAt, _updatedAt) desc)`;

/** Nav menu items for /game-pc or /promo landing groups. */
export const LANDING_NAV_BY_PREFIX = groq`
*[_type=="page" && pathPrefix==$prefix && defined(slug.current)]{
  "slug": slug.current,
  "label": coalesce(seo.metaTitle, internalTitle),
  publishedAt,
  expiresAt
} | order(coalesce(publishedAt, _updatedAt) desc)`;
