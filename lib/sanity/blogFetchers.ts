/**
 * Blog server-side fetchers. Source: kondor-pc-admin Sanity (project `if6dzz62`).
 * Mirrors the pattern used by landingAdapter — tagged caches keep ISR coherent.
 */
import { cache } from "react";
import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/revalidate";
import { portableTextToContent, portableTextToPlain } from "@/lib/sanity/portableText";
import { contentClient } from "./contentClient";
import {
  ALL_BLOG_POSTS_QUERY,
  ALL_BLOG_POST_SLUGS_QUERY,
  BLOG_PAGE_QUERY,
  BLOG_POST_BY_SLUG_QUERY,
} from "./blogQueries";
import type { BlogFaqItem, BlogPost, BlogPostPreview, PageSeo } from "@/types/blogPost";

type RawFaqRow = {
  _key?: string;
  question?: string;
  answer?: unknown;
};

type RawBlogPost = Omit<BlogPost, "customFaq"> & {
  customFaq?: RawFaqRow[];
};

function mapBlogCustomFaq(rows?: RawFaqRow[]): BlogFaqItem[] | undefined {
  if (!rows?.length) return undefined;
  const list = rows
    .map((row) => {
      const pt = row.answer as Parameters<typeof portableTextToPlain>[0];
      const answerContent = portableTextToContent(pt);
      const answer = portableTextToPlain(pt);
      return {
        _key: row._key,
        question: row.question?.trim() || "",
        answer,
        answerContent,
      };
    })
    .filter(
      (row) =>
        row.question.length > 0 &&
        (row.answer.length > 0 || row.answerContent.length > 0),
    );
  return list.length > 0 ? list : undefined;
}

function mapBlogPost(raw: RawBlogPost): BlogPost {
  return {
    ...raw,
    customFaq: mapBlogCustomFaq(raw.customFaq),
  };
}

export const getAllBlogPosts = cache(async (): Promise<BlogPostPreview[]> => {
  const rows = await contentClient.fetch<BlogPostPreview[]>(
    ALL_BLOG_POSTS_QUERY,
    {},
    {
      next: { revalidate: SANITY_REVALIDATE_SECONDS, tags: ["blog:posts"] },
    },
  );
  return rows ?? [];
});

export async function getAllBlogPostSlugs(): Promise<string[]> {
  const rows = await contentClient.fetch<Array<{ slug: string }>>(
    ALL_BLOG_POST_SLUGS_QUERY,
    {},
    { next: { tags: ["blog:posts"] } },
  );
  return (rows ?? []).map((r) => r.slug).filter(Boolean);
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const raw = await contentClient.fetch<RawBlogPost | null>(
    BLOG_POST_BY_SLUG_QUERY,
    { slug },
    {
      next: {
        revalidate: SANITY_REVALIDATE_SECONDS,
        tags: ["blog:posts", `blog:post:${slug}`],
      },
    },
  );
  if (!raw) return null;
  return mapBlogPost(raw);
}

export async function getBlogPageSeo(): Promise<{ seo: PageSeo | null } | null> {
  return contentClient.fetch<{ seo: PageSeo | null } | null>(
    BLOG_PAGE_QUERY,
    {},
    {
      next: { revalidate: SANITY_REVALIDATE_SECONDS, tags: ["blog:page"] },
    },
  );
}
