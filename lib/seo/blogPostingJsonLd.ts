import { contentImageUrl } from "@/lib/sanity/contentClient";
import { normalizeSchemaDate } from "@/lib/seo/normalizeSchemaDate";
import { SITE_URL } from "@/lib/seo/constants";
import type { BlogAuthor, BlogPost, SanityImage } from "@/types/blogPost";

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

function normalizeSiteUrl(): string {
  return SITE_URL.replace(/\/$/, "");
}

function resolveAuthorImageUrl(photo?: SanityImage): string | undefined {
  if (!photo?.asset?._ref) return undefined;
  return contentImageUrl(photo).url();
}

function resolveHeroImageUrl(image: SanityImage): string | undefined {
  if (!image?.asset?._ref) return undefined;
  return contentImageUrl(image)
    .width(OG_IMAGE_WIDTH)
    .height(OG_IMAGE_HEIGHT)
    .fit("fill")
    .url();
}

function buildAuthorSchema(author?: BlogAuthor | null) {
  const name = author?.name?.trim();
  if (!name) return undefined;

  const image = resolveAuthorImageUrl(author?.photo);

  return {
    "@type": "Person" as const,
    name,
    ...(image ? { image } : {}),
  };
}

export function blogPostingJsonLd(post: BlogPost): object | null {
  if (!post._createdAt?.trim()) return null;

  const siteUrl = normalizeSiteUrl();
  const articleUrl = `${siteUrl}/blog/${post.slug}`;
  const headline = post.heroTitle?.trim();
  const description =
    post.seo?.metaDescription?.trim() || post.heroDescription?.trim();
  const imageUrl = resolveHeroImageUrl(post.heroDesktopImage);

  if (!headline || !description || !imageUrl) return null;

  const author = buildAuthorSchema(post.author);
  const caption =
    post.heroDesktopImage.alt?.trim() ||
    post.seo?.opengraphImage?.alt?.trim() ||
    headline;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    headline,
    description,
    url: articleUrl,
    inLanguage: "uk-UA",
    datePublished: normalizeSchemaDate(post._createdAt),
    dateModified: normalizeSchemaDate(post._updatedAt ?? post._createdAt),
    ...(author ? { author } : {}),
    publisher: { "@id": `${siteUrl}/#organization` },
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      caption,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };
}
