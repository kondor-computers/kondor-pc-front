/**
 * Shared builder that converts a Sanity `seoSettings` payload into Next.js
 * Metadata. Used across the site (blog, landing pages, product cards, etc.),
 * not just the blog. Pattern mirrors nbyg-front's getMetadataFromSanity,
 * adapted to Kondor PC's SITE_URL and brand defaults.
 */
import type { Metadata } from "next";
import type { PageSeo } from "@/types/blogPost";
import { SITE_URL } from "@/lib/seo/constants";
import { resolveOpengraphImageUrl } from "@/lib/sanity/seoImage";

function canonical(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * `product` is part of the Open Graph spec but not Next.js's typed
 * `openGraph.type` union (Next throws on unknown types). For it we omit
 * `og:type` from the resolved metadata and let the page render its own
 * `<meta property="og:type" content="product" />` (hoisted by React 19).
 */
type OpenGraphTypeOption = "website" | "article" | "product";

interface MetadataFromSeoParams {
  seo: PageSeo | null | undefined;
  path: string;
  defaultTitle?: string;
  defaultDescription?: string;
  openGraphType?: OpenGraphTypeOption;
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildPageMetadata({
  seo,
  path,
  defaultTitle = "Блог Kondor PC",
  defaultDescription =
    "Гайди, огляди та поради по ігровим ПК, комплектуючим та оптимізації.",
  openGraphType = "website",
  publishedTime,
  modifiedTime,
}: MetadataFromSeoParams): Metadata {
  const canonicalUrl = canonical(path);

  const metaTitle = seo?.metaTitle || defaultTitle;
  const metaDescription = seo?.metaDescription || defaultDescription;
  const ogTitle = seo?.opengraphTitle?.trim() || metaTitle;
  const ogDescription = seo?.opengraphDescription?.trim() || metaDescription;

  let keywords: string[] | undefined;
  if (seo?.keywords) {
    if (Array.isArray(seo.keywords)) {
      keywords = seo.keywords.length > 0 ? seo.keywords : undefined;
    } else if (typeof seo.keywords === "string") {
      const parsed = seo.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      keywords = parsed.length > 0 ? parsed : undefined;
    }
  }

  const ogImageUrl = resolveOpengraphImageUrl(seo);

  const ogImages = ogImageUrl
    ? [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: seo?.opengraphImage?.alt || metaTitle,
        },
      ]
    : undefined;

  const baseOpenGraph = {
    title: ogTitle,
    description: ogDescription,
    locale: "uk_UA",
    siteName: "Kondor PC",
    url: canonicalUrl,
    images: ogImages,
  };

  // For `product` we leave `type` off so Next emits no `og:type`; the product
  // page renders <ProductOgType /> instead (og:type=product).
  const openGraph =
    openGraphType === "product"
      ? baseOpenGraph
      : {
          ...baseOpenGraph,
          type: openGraphType,
          ...(openGraphType === "article" && publishedTime
            ? { publishedTime }
            : {}),
          ...(openGraphType === "article" && modifiedTime
            ? { modifiedTime }
            : {}),
        };

  return {
    // Absolute title — root layout `template` must not append "· Kondor PC" again.
    title: { absolute: metaTitle },
    description: metaDescription,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "uk-UA": canonicalUrl,
        "x-default": canonicalUrl,
      },
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

export function pageCanonicalUrl(path: string): string {
  return canonical(path);
}
