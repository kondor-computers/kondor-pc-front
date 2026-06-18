/**
 * GROQ queries for the blog.
 * Ported from nbyg-front — preserve original names and projections so the
 * shape returned matches what the components consume.
 * Source: kondor-pc-admin (project `if6dzz62`, dataset `production`).
 */
import { SEO_SETTINGS_PROJECTION } from "@/lib/sanity/siteSeoQueries";
import { ARTICLE_PORTABLE_TEXT_ARRAY_PROJECTION } from "@/lib/sanity/articlePortableTextProjection";

const groq = (strings: TemplateStringsArray, ...values: unknown[]) =>
  strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? String(values[i]) : ""),
    "",
  );

export const BLOG_PAGE_QUERY = groq`*[_type == "blogPage"][0]{
  "seo": seo${SEO_SETTINGS_PROJECTION}
}`;

export const ALL_BLOG_POSTS_QUERY = groq`*[_type == "blogPost"] | order(_createdAt desc){
  heroTitle,
  heroDescription,
  "heroMobileImage": heroMobileImage{
    ...,
    "alt": alt
  },
  "slug": slug.current,
  _createdAt
}`;

export const ALL_BLOG_POST_SLUGS_QUERY = groq`*[_type == "blogPost" && defined(slug.current)]{
  "slug": slug.current
}`;

export const BLOG_POST_BY_SLUG_QUERY = groq`*[
  _type == "blogPost" &&
  slug.current == $slug
][0]{
  heroTitle,
  heroDescription,
  "heroDesktopImage": heroDesktopImage{
    ...,
    "alt": alt
  },
  "heroMobileImage": heroMobileImage{
    ...,
    "alt": alt
  },
  "slug": slug.current,
  _createdAt,
  _updatedAt,
  "author": author->{
    name,
    profileUrl,
    photo{
      ...,
      "alt": alt
    }
  },
  "heroImageUrl": heroDesktopImage.asset->url,
  content${ARTICLE_PORTABLE_TEXT_ARRAY_PROJECTION},
  "customFaq": coalesce(customFaq[]{_key, question, answer}, []),
  "seo": seo${SEO_SETTINGS_PROJECTION}
}`;
