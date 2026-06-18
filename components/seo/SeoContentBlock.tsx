import type { PageSeo } from "@/types/blogPost";
import { SeoContentSection } from "@/components/seo/SeoContentSection";

export function SeoContentBlock({
  seo,
  scopeKey,
}: {
  seo?: PageSeo | null;
  scopeKey: string;
}) {
  if (!seo?.content?.length) return null;
  return <SeoContentSection content={seo.content} scopeKey={scopeKey} />;
}
