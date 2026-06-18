import { JsonLd } from "@/lib/seo";
import { webPageSchemaForSitePage } from "@/lib/sanity/siteSeoFetcher";
import type { SiteSeoPageId } from "@/lib/sanity/siteSeoConfig";

export async function SiteWebPageJsonLd({ pageId }: { pageId: SiteSeoPageId }) {
  const schema = await webPageSchemaForSitePage(pageId);
  return <JsonLd data={schema} />;
}
