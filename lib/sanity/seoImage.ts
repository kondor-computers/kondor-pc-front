import type { PageSeo, SanityImage } from "@/types/blogPost";
import { DEFAULT_SOCIAL_IMAGE_URL, ORGANIZATION_LOGO_URL } from "@/lib/seo/constants";
import { contentImageUrl } from "./contentClient";

/** Resolve OG image URL from Sanity `seoSettings.opengraphImage`. */
export function resolveOpengraphImageUrl(
  seo?: PageSeo | null,
): string | undefined {
  if (!seo?.opengraphImage?.asset?._ref) return undefined;
  return contentImageUrl(seo.opengraphImage as unknown as SanityImage)
    .width(1200)
    .height(630)
    .fit("fill")
    .url();
}

export function resolveProductImageUrl(
  build: { heroImageUrl?: string; seo?: PageSeo | null },
): string {
  return (
    build.heroImageUrl ??
    resolveOpengraphImageUrl(build.seo) ??
    DEFAULT_SOCIAL_IMAGE_URL
  );
}

export function resolveOrganizationLogoUrl(seo?: PageSeo | null): string {
  return resolveOpengraphImageUrl(seo) ?? ORGANIZATION_LOGO_URL;
}
