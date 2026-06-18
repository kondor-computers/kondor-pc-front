import { Suspense } from "react";
import { SitePageSchemaJson } from "@/components/seo/SitePageSchemaJson";
import type { SiteSeoPageId } from "@/lib/sanity/siteSeoConfig";

/** JSON-LD must not block visible page content from streaming. */
export function DeferredSitePageSchema({
  pageId,
  excludeTypes = [],
}: {
  pageId: SiteSeoPageId;
  excludeTypes?: string[];
}) {
  return (
    <Suspense fallback={null}>
      <SitePageSchemaJson pageId={pageId} excludeTypes={excludeTypes} />
    </Suspense>
  );
}
