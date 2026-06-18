import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleHero from "@/components/blog/ArticleHero";
import ContentSection from "@/components/blog/ContentSection";
import BlogBreadcrumbs from "@/components/blog/BlogBreadcrumbs";
import { JsonLd, breadcrumbJsonLd, faqPageJsonLd, blogPostingJsonLd } from "@/lib/seo";
import { blogFaqToSchemaItems } from "@/lib/seo/faqSchema";
import {
  getAllBlogPostSlugs,
  getBlogPostBySlug,
} from "@/lib/sanity/blogFetchers";
import { SchemaJsonFromSeo } from "@/components/seo/SchemaJsonFromUrl";
import { SeoContentBlock } from "@/components/seo/SeoContentBlock";
import { buildPageMetadata } from "@/lib/sanity/pageSeo";
import BlogFaq from "@/components/blog/BlogFaq";
import {
  RecommendedPostsAside,
  RecommendedPostsRail,
} from "./RecommendedPostsSection";
import { RecommendedAsideSkeleton } from "./RecommendedPostsSkeleton";

export const revalidate = 60;
export const dynamicParams = true;

interface ArticlePageProps {
  params: Promise<{ article: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map((slug) => ({ article: slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { article } = await params;
  const post = await getBlogPostBySlug(article).catch(() => null);
  if (!post) return { title: "Стаття не знайдена" };
  return buildPageMetadata({
    seo: post.seo ?? null,
    path: `/blog/${post.slug}`,
    defaultTitle: post.heroTitle,
    defaultDescription: post.heroDescription,
    openGraphType: "article",
    publishedTime: post._createdAt,
    modifiedTime: post._updatedAt ?? post._createdAt,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { article } = await params;
  const currentArticle = await getBlogPostBySlug(article);

  if (!currentArticle) {
    notFound();
  }

  const { heroTitle, slug } = currentArticle;

  const crumbs = [
    { label: "Головна", href: "/" },
    { label: "Блог", href: "/blog" },
    { label: heroTitle, href: `/blog/${slug}` },
  ];

  const uniqueKey = `blog-${slug}`;
  const faqSchema = faqPageJsonLd(
    blogFaqToSchemaItems(currentArticle.customFaq),
  );
  const blogPostingSchema = blogPostingJsonLd(currentArticle);

  return (
    <>
      <Suspense fallback={null}>
        <SchemaJsonFromSeo
          seo={currentArticle.seo}
          excludeTypes={["Article", "BlogPosting", "BreadcrumbList", "FAQPage"]}
        />
      </Suspense>
      <JsonLd
        data={[
          ...(blogPostingSchema ? [blogPostingSchema] : []),
          breadcrumbJsonLd(
            crumbs.map((c) => ({ name: c.label, url: c.href })),
          ),
          ...(faqSchema ? [faqSchema] : []),
        ]}
      />
      <BlogBreadcrumbs crumbs={crumbs} />
      <ArticleHero article={currentArticle} />
      <div className="container-site lg:flex lg:gap-12">
        <div className="min-w-0 flex-1">
          {currentArticle.content && currentArticle.content.length > 0 && (
            <ContentSection article={currentArticle} />
          )}
          {currentArticle.customFaq && currentArticle.customFaq.length > 0 && (
            <BlogFaq
              items={currentArticle.customFaq}
              uniqueKey={`${uniqueKey}-faq`}
            />
          )}
          <Suspense fallback={null}>
            <RecommendedPostsRail slug={slug} uniqueKey={uniqueKey} />
          </Suspense>
        </div>
        <Suspense fallback={<RecommendedAsideSkeleton />}>
          <RecommendedPostsAside slug={slug} uniqueKey={uniqueKey} />
        </Suspense>
      </div>
      <SeoContentBlock seo={currentArticle.seo} scopeKey={`blog-${slug}`} />
    </>
  );
}
