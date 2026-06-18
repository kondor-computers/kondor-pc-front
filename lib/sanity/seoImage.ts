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

import type { BuildImage } from "@/types/build";
import { buildImageUrl } from "@/lib/build/images";

export function resolveProductImageUrl(
  build: { heroImage?: BuildImage; seo?: PageSeo | null },
): string {
  return (
    buildImageUrl(build.heroImage) ??
    resolveOpengraphImageUrl(build.seo) ??
    DEFAULT_SOCIAL_IMAGE_URL
  );
}

export function resolveOrganizationLogoUrl(seo?: PageSeo | null): string {
  return resolveOpengraphImageUrl(seo) ?? ORGANIZATION_LOGO_URL;
}
