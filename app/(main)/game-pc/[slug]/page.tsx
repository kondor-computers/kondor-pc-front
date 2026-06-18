import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {
  buildSanityPageContext,
  getAllLandingPageSlugs,
  getLandingPageBySlug,
  resolvePageContext,
} from "@/lib/data/adapter";
import {SchemaJsonFromSeo} from "@/components/seo/SchemaJsonFromUrl";
import {SeoContentBlock} from "@/components/seo/SeoContentBlock";
import {LandingPageBody} from "@/components/landings/LandingPageBody";
import {buildLandingMetadata} from "@/lib/sanity/landingSeo";
import {JsonLd, faqPageJsonLd} from "@/lib/seo";
import {extractLandingFaqSchemaItems} from "@/lib/seo/faqSchema";

// ISR. Sanity webhook will revalidate by tag later (Sprint 3).
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllLandingPageSlugs("game-pc");
  return slugs.map((slug) => ({slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>;
}): Promise<Metadata> {
  const {slug} = await params;
  const page = await getLandingPageBySlug(slug, "game-pc");
  if (!page) return {title: "Не знайдено"};
  return buildLandingMetadata({
    seo: page.seo,
    path: `/game-pc/${slug}`,
    defaultTitle: page.internalTitle ?? slug,
  });
}

export default async function GamePcLandingPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  const page = await getLandingPageBySlug(slug, "game-pc");
  if (!page) notFound();

  const pageContext = page.context
    ? await resolvePageContext(page.context)
    : buildSanityPageContext("game-pc", slug);

  const faqSchema = faqPageJsonLd(extractLandingFaqSchemaItems(page.sections));

  return (
    <>
      <SchemaJsonFromSeo seo={page.seo} excludeTypes={["FAQPage"]} />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      <LandingPageBody page={page} pageContext={pageContext} />
      <SeoContentBlock seo={page.seo} scopeKey={`game-pc-${slug}`} />
    </>
  );
}
