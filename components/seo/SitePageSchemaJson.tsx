import { SchemaJsonFromUrl } from "@/components/seo/SchemaJsonFromUrl";
import type { SiteSeoPageId } from "@/lib/sanity/siteSeoConfig";
import { fetchSiteSeoByPageId } from "@/lib/sanity/siteSeoFetcher";

export async function SitePageSchemaJson({
  pageId,
  excludeTypes = [],
}: {
  pageId: SiteSeoPageId;
  excludeTypes?: string[];
}) {
  const seo = await fetchSiteSeoByPageId(pageId).catch(() => null);
  return <SchemaJsonFromUrl url={seo?.schemaJsonUrl} excludeTypes={excludeTypes} />;
}
