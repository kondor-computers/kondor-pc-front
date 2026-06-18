/**
 * Blog types — ported from nbyg-front (preserved naming).
 * Data source: kondor-pc-admin Sanity project `if6dzz62`, document `blogPost` / `blogPage`.
 */

import type { ContentNode } from "@/lib/data/types/content";

export type SanityReference = {
  _type: "reference";
  _ref: string;
};

export type SanityImageCrop = {
  _type: "sanity.imageCrop";
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type SanityImageHotspot = {
  _type: "sanity.imageHotspot";
  x: number;
  y: number;
  height: number;
  width: number;
};

export type SanityImage = {
  _type: "image";
  asset: SanityReference;
  crop?: SanityImageCrop;
  hotspot?: SanityImageHotspot;
  alt?: string;
};

export type PageSeo = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[] | string;
  opengraphTitle?: string;
  opengraphDescription?: string;
  opengraphImage?: SanityImage;
  content?: BlogPostContent[];
  schemaJsonUrl?: string;
};

export type BlogAuthor = {
  name: string;
  profileUrl?: string;
  photo?: SanityImage;
};

export type BlogFaqItem = {
  _key?: string;
  question: string;
  answer: string;
  answerContent: ContentNode[];
};

export type BlogPostContentBlock = {
  _key: string;
  _type: "block";
  style?: "h2" | "h3" | "h4" | "normal";
  children: Array<{
    _key: string;
    _type: "span";
    text: string;
    marks?: string[];
    link?: {
      href: string;
      blank?: boolean;
    };
  }>;
  markDefs?: Array<{
    _key: string;
    _type: "link";
    href: string;
    blank?: boolean;
  }>;
  listItem?: "bullet" | "number";
  level?: number;
};

export type BlogPostContentImage = {
  _key?: string;
  _type: "image";
  asset: SanityReference;
  crop?: SanityImageCrop;
  hotspot?: SanityImageHotspot;
  alt?: string;
  /** From GROQ: asset->metadata.dimensions (intrinsic size for next/image) */
  dimensions?: { width: number; height: number } | null;
};

export type BlogPostContentTable = {
  _key: string;
  _type: "table";
  rows?: Array<{
    cells?: string[];
  }>;
};

export type BlogPostContentGalleryItem = {
  _key: string;
  _type: "galleryItem";
  image?: BlogPostContentImage;
};

export type BlogPostContentGallerySection = {
  _key: string;
  _type: "gallerySection";
  items?: BlogPostContentGalleryItem[];
};

export type BlogPostContentFaqAnswerButton = {
  _key: string;
  _type: "faqAnswerButton";
  label?: string;
  href?: string;
  newTab?: boolean;
};

export type BlogPostContent =
  | BlogPostContentBlock
  | BlogPostContentImage
  | BlogPostContentTable
  | BlogPostContentGallerySection
  | BlogPostContentFaqAnswerButton;

export type BlogPost = {
  heroTitle: string;
  heroDescription: string;
  heroDesktopImage: SanityImage;
  heroMobileImage: SanityImage;
  slug: string;
  author?: BlogAuthor | null;
  content: BlogPostContent[];
  customFaq?: BlogFaqItem[];
  seo?: PageSeo | null;
  _createdAt?: string;
  _updatedAt?: string;
  heroImageUrl?: string | null;
};

export type BlogPostPreview = {
  heroTitle: string;
  heroDescription: string;
  heroMobileImage: SanityImage;
  slug: string;
  _createdAt?: string;
};
