import { cache } from "react";
import type { Metadata } from "next";
import type { PageSeo } from "@/types/blogPost";
import { buildPageMetadata } from "@/lib/sanity/pageSeo";
import { webPageJsonLd } from "@/lib/seo";
import {
  LEGAL_SEO_BY_SLUG,
  SITE_SEO_CONFIG,
  type SiteSeoPageId,
} from "@/lib/sanity/siteSeoConfig";
import { contentClient } from "@/lib/sanity/contentClient";
import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/revalidate";
import { SITE_SEO_BY_DOCUMENT_ID } from "@/lib/sanity/siteSeoQueries";

export const fetchSiteSeoByPageId = cache(
  async (pageId: SiteSeoPageId): Promise<PageSeo | null> => {
    const row = await contentClient.fetch<{ seo?: PageSeo | null } | null>(
      SITE_SEO_BY_DOCUMENT_ID,
      { documentId: pageId },
      {
        next: {
          revalidate: SANITY_REVALIDATE_SECONDS,
          tags: ["site-seo", `site-seo:${pageId}`],
        },
      },
    );
    return row?.seo ?? null;
  },
);

/** Build Next.js Metadata for a configured site page (Sanity → defaults). */
export async function metadataForSitePage(
  pageId: SiteSeoPageId,
): Promise<Metadata> {
  const config = SITE_SEO_CONFIG[pageId];
  const seo = await fetchSiteSeoByPageId(pageId).catch(() => null);
  return buildPageMetadata({
    seo,
    path: config.path,
    defaultTitle: config.defaultTitle,
    defaultDescription: config.defaultDescription,
  });
}

/** WebPage JSON-LD for a configured site page (Sanity meta title → defaults). */
export async function webPageSchemaForSitePage(pageId: SiteSeoPageId) {
  const config = SITE_SEO_CONFIG[pageId];
  const seo = await fetchSiteSeoByPageId(pageId).catch(() => null);
  const name = seo?.metaTitle?.trim() || config.defaultTitle;
  return webPageJsonLd({ path: config.path, name });
}

/** SEO for `/legal/[slug]` when slug maps to a site SEO singleton. */
export async function metadataForLegalSlug(
  slug: string,
): Promise<Metadata | null> {
  const pageId = LEGAL_SEO_BY_SLUG[slug];
  if (!pageId) return null;
  return metadataForSitePage(pageId);
}
