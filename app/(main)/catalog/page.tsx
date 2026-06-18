import type { Metadata } from "next";
import { getAllCategories, getCatalogItems } from "@/lib/sanity/fetchers";
import { CatalogFilters } from "./CatalogFilters";
import { CatalogCardStatic } from "@/components/catalog/CatalogCardStatic";
import Image from "next/image";
import { SitePageSchemaJson } from "@/components/seo/SitePageSchemaJson";
import { SitePageSeoContent } from "@/components/seo/SitePageSeoContent";
import { metadataForSitePage } from "@/lib/sanity/siteSeoFetcher";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import {
  buildCatalogGroups,
  computePriceBounds,
  filterCatalogGroups,
  parseFiltersFromParams,
} from "@/lib/catalog/accessoryFilters";

export const revalidate = 60;

function hasSeoFilterParams(
  params: Record<string, string | undefined>,
): boolean {
  return ["cat", "min", "max", "avail", "sort"].some((key) => {
    const value = params[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const metadata = await metadataForSitePage("seoAccessoriesPage");
  const params = await searchParams;
  if (!hasSeoFilterParams(params)) return metadata;

  return {
    ...metadata,
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}

function OtherProductsDivider() {
  return (
    <div className="my-10 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Інші товари, які можуть сподобатись
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [categories, items] = await Promise.all([
    getAllCategories(),
    getCatalogItems(),
  ]);

  const groups = buildCatalogGroups(items);
  const priceBounds = computePriceBounds(groups);
  const validCategorySlugs = new Set(categories.map((c) => c.slug));
  const filters = parseFiltersFromParams(params, validCategorySlugs, priceBounds);
  const { primary, secondary, hasFilters } = filterCatalogGroups(
    groups,
    filters,
    priceBounds,
  );

  return (
    <>
      <SitePageSchemaJson pageId="seoAccessoriesPage" />
      <div className="relative container-site pt-8 lg:pt-12 pb-12 lg:pb-16">
        <div className="absolute -z-10 top-[-223px] lg:top-[-154px] left-[-860px] lg:left-[-160px] w-[1929px] h-[2007px]">
          <Image
            src="/images/pk/shadows.svg"
            alt=""
            width={1929}
            height={2007}
className="object-cover"
          />
        </div>
        <div className="mb-8">
          <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Аксесуари
          </div>
          <h1 className="font-display text-[24px] font-bold md:text-5xl">
            КЛАВІАТУРИ, МИШІ, ПОВЕРХНІ
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] lg:text-[16px] leading-[120%] text-muted-foreground">
            Клавіатури, миші, ігрові поверхні та кейкапи — все, що потрібно для
            робочого місця навколо твого ПК.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <CatalogFilters
            categories={categories}
            filters={filters}
            priceBounds={priceBounds}
          />

          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Знайдено:{" "}
                <span className="font-semibold text-foreground">
                  {primary.length}
                </span>
                {hasFilters && <> із {groups.length}</>}
              </div>
            </div>

            {primary.length === 0 && !hasFilters ? (
              <div className="rounded-lg border border-border bg-surface p-10 text-center">
                <div className="font-display text-xl font-bold">
                  Каталог порожній
                </div>
              </div>
            ) : primary.length === 0 && hasFilters ? (
              <>
                <div className="rounded-lg border border-border bg-surface p-8 text-center">
                  <div className="font-display text-lg font-bold">
                    За такими критеріями нічого не знайдено
                  </div>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Спробуй скинути фільтри або розширити діапазон цін.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <TechButtonLink
                      href="/catalog"
                      variant="white"
                      className="font-heading tracking-normal h-9"
                    >
                      Скинути фільтри
                    </TechButtonLink>
                  </div>
                </div>
                {secondary.length > 0 && (
                  <>
                    <OtherProductsDivider />
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {secondary.map((group) => (
                        <CatalogCardStatic key={group.key} group={group} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {primary.map((group, i) => (
                    <CatalogCardStatic
                      key={group.key}
                      group={group}
                      priority={i < 2}
                    />
                  ))}
                </div>

                {hasFilters && secondary.length > 0 && (
                  <>
                    <OtherProductsDivider />
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {secondary.map((group) => (
                        <CatalogCardStatic key={group.key} group={group} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <SitePageSeoContent pageId="seoAccessoriesPage" />
    </>
  );
}
