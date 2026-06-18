import type { SiteSeoPageId } from "@/lib/sanity/siteSeoConfig";
import { fetchSiteSeoByPageId } from "@/lib/sanity/siteSeoFetcher";
import { SeoContentBlock } from "@/components/seo/SeoContentBlock";

export async function SitePageSeoContent({ pageId }: { pageId: SiteSeoPageId }) {
  const seo = await fetchSiteSeoByPageId(pageId).catch(() => null);
  return <SeoContentBlock seo={seo} scopeKey={pageId} />;
}
