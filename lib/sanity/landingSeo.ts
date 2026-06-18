import type { Metadata } from "next";
import type { PageSeo } from "@/types/blogPost";
import { buildPageMetadata } from "@/lib/sanity/pageSeo";

interface LandingSeoParams {
  seo: PageSeo | null | undefined;
  path: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

/** Next.js Metadata for /game-pc and /promo landing pages from Sanity `page.seo` (`seoSettings`). */
export function buildLandingMetadata({
  seo,
  path,
  defaultTitle,
  defaultDescription = "",
}: LandingSeoParams): Metadata {
  return buildPageMetadata({
    seo,
    path,
    defaultTitle: defaultTitle ?? "Kondor PC",
    defaultDescription,
  });
}
