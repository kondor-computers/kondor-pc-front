import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd, breadcrumbJsonLd, catalogProductJsonLd } from "@/lib/seo";
import { ProductOgType } from "@/components/seo/ProductOgType";

import { getItemBySlug, getCatalogItems } from "@/lib/sanity/fetchers";
import { urlFor } from "@/lib/sanity/image";
import { catalogLcpSrc } from "@/lib/catalog/photoUrls";
import { SimilarCatalogSection } from "./SimilarCatalogSection";
import { SimilarCatalogSkeleton } from "./SimilarCatalogSkeleton";
import { SITE_URL } from "@/lib/seo/constants";
import { CatalogDetailProvider } from "./CatalogDetailProvider";
import { CatalogHeroLcpImage } from "./CatalogHeroLcpImage";
import { CatalogHeroTitle } from "./CatalogHeroTitle";
import { CatalogHeroPrice } from "./CatalogHeroPrice";
import { LazyCatalogGalleryOverlay } from "./LazyCatalogGalleryOverlay";
import { LazyCatalogPurchasePanel } from "./LazyCatalogPurchasePanel";
import { CatalogDetailSections } from "./CatalogDetailSections";

export const revalidate = 60;

export async function generateStaticParams() {
  const items = await getCatalogItems();
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) return { title: "Не знайдено" };

  const ogImage = item.seoImage?.asset
    ? urlFor(item.seoImage).width(1200).height(630).fit("crop").url()
    : item.coloropts?.[0]?.photos?.[0]?.asset
      ? urlFor(item.coloropts[0].photos[0])
          .width(1200)
          .height(630)
          .fit("crop")
          .url()
      : undefined;

  const canonicalUrl = `${SITE_URL}/catalog/${slug}`;
  const title = item.seoTitle || item.name;
  const description =
    item.seoDescription ||
    item.description ||
    `${item.name} — купити в Kondor PC`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "uk-UA": canonicalUrl,
        "x-default": canonicalUrl,
      },
    },
    openGraph: {
      // No `type` here so Next emits no `og:type`; the page renders
      // <ProductOgType /> instead (product card → og:type=product).
      title,
      description,
      locale: "uk_UA",
      siteName: "Kondor PC",
      url: canonicalUrl,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function CatalogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) notFound();

  const productImageUrl = item.seoImage?.asset
    ? urlFor(item.seoImage).width(1200).height(630).fit("crop").url()
    : item.coloropts?.[0]?.photos?.[0]?.asset
      ? urlFor(item.coloropts[0].photos[0])
          .width(1200)
          .height(630)
          .fit("crop")
          .url()
      : undefined;

  const lcpSrc = catalogLcpSrc(item.coloropts?.[0]?.photos?.[0]);

  return (
    <>
      <ProductOgType />
      <JsonLd
        data={[
          catalogProductJsonLd(item, { imageUrl: productImageUrl }),
          breadcrumbJsonLd([
            { name: "Головна", url: "/" },
            { name: "Каталог аксесуарів", url: "/catalog" },
            { name: item.name, url: `/catalog/${item.slug}` },
          ]),
        ]}
      />

      <CatalogDetailProvider item={item}>
        <section className="container-site pb-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="relative">
                {lcpSrc ? (
                  <CatalogHeroLcpImage src={lcpSrc} alt={item.name} />
                ) : (
                  <div className="card-frame-md flex aspect-square items-center justify-center overflow-hidden bg-surface/40 text-sm text-muted-foreground">
                    Без фото
                  </div>
                )}
                {lcpSrc ? <LazyCatalogGalleryOverlay /> : null}
              </div>
            </div>

            <div>
              <CatalogHeroTitle item={item} />
              <CatalogHeroPrice item={item} />
              <LazyCatalogPurchasePanel />
            </div>
          </div>
        </section>
      </CatalogDetailProvider>

      <CatalogDetailSections item={item} />

      {item.category?.slug && (
        <Suspense fallback={<SimilarCatalogSkeleton />}>
          <SimilarCatalogSection
            slug={item.slug}
            categorySlug={item.category.slug}
          />
        </Suspense>
      )}
    </>
  );
}
