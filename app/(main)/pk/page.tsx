import type { Metadata } from "next";
import { getAllBuilds } from "@/lib/sanity-pc/builds";
import { getAllGames, makeGameShortLabelMap } from "@/lib/sanity-pc/games";
import { CatalogFilters } from "./CatalogFilters";
import { BuildCardStatic } from "@/components/shared/BuildCardStatic";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import ArrowIcon from "@/components/icons/ArrowIcon";
import Image from "next/image";
import { SitePageSchemaJson } from "@/components/seo/SitePageSchemaJson";
import { SitePageSeoContent } from "@/components/seo/SitePageSeoContent";
import { metadataForSitePage, fetchSiteSeoByPageId } from "@/lib/sanity/siteSeoFetcher";
import { SITE_SEO_CONFIG } from "@/lib/sanity/siteSeoConfig";
import { JsonLd, pcCatalogCollectionPageJsonLd } from "@/lib/seo";
import {
  filterBuilds,
  highlightGamesForFilters,
  parseFiltersFromParams,
} from "@/lib/catalog/pkFilters";

export const revalidate = 60;

function hasSeoFilterParams(params: Record<string, string | undefined>): boolean {
  return ["min", "max", "games", "res", "sort"].some((key) => {
    const value = params[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const metadata = await metadataForSitePage("seoPcCatalogPage");
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

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [builds, games] = await Promise.all([getAllBuilds(), getAllGames()]);
  const validGameSlugs = new Set(games.map((g) => g.slug));
  const filters = parseFiltersFromParams(params, validGameSlugs);
  const filtered = filterBuilds(builds, filters);
  const gameLabels = Object.fromEntries(
    games.map((g) => [g.slug, g.ukrName || g.name]),
  );
  const gameShortLabels = makeGameShortLabelMap(games);
  const highlightGames = highlightGamesForFilters(filters);
  const isFiltered = hasSeoFilterParams(params);
  const catalogSeo = isFiltered
    ? null
    : await fetchSiteSeoByPageId("seoPcCatalogPage").catch(() => null);
  const catalogSeoConfig = SITE_SEO_CONFIG.seoPcCatalogPage;

  return (
    <>
      <SitePageSchemaJson
        pageId="seoPcCatalogPage"
        excludeTypes={["CollectionPage", "ItemList"]}
      />
      {!isFiltered ? (
        <JsonLd
          data={pcCatalogCollectionPageJsonLd(builds, {
            name:
              catalogSeo?.metaTitle?.trim() ||
              `${catalogSeoConfig.defaultTitle} — Kondor PC`,
            description:
              catalogSeo?.metaDescription?.trim() ||
              catalogSeoConfig.defaultDescription,
          })}
        />
      ) : null}
      <section className="relative container-site pt-8 lg:pt-12 pb-12 lg:pb-16">
        <div className="absolute -z-10 top-[-223px] lg:top-[-154px] left-[-860px] lg:left-[-160px] w-[1929px] h-[2007px]">
          <Image
            src="/images/pk/shadows.svg"
            alt=""
            width={1929}
            height={2007}
className="object-cover"
          />
        </div>
        <div className="mb-8 flex flex-wrap md:flex-nowrap items-end justify-between gap-4">
          <div className="mb-5 md:mb-0">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Каталог
            </div>
            <h1 className="py-2 font-display text-[24px] font-bold md:text-5xl">
              ІГРОВІ ПК
            </h1>
            <p className="mt-2 text-[14px] leading-[120%] text-muted-foreground">
              {builds.length} перевірених збірок у всіх цінових категоріях
            </p>
          </div>
          <TechButtonLink
            href="/pidbir"
            variant="white"
            size="sm"
            className="w-full md:max-w-[411px] h-7.5 px-2 font-heading text-[10px] lg:text-[13px] font-medium leading-none tracking-normal"
          >
            <span>Не знаєш, що обрати? Пройди підбір</span>
            <ArrowIcon className="inline-block size-4 mb-0.5 ml-1" />
          </TechButtonLink>
        </div>

        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <CatalogFilters games={games} filters={filters} />

          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Знайдено:{" "}
                <span className="font-semibold text-foreground">
                  {filtered.length}
                </span>
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface p-10 text-center">
                <div className="font-display text-xl font-bold">
                  За такими критеріями нічого не знайдено
                </div>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Спробуй: збільшити бюджет, прибрати обмеження по роздільній
                  або обрати менше ігор.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <TechButtonLink
                    href="/pk"
                    variant="white"
                    className="font-heading tracking-normal h-9"
                  >
                    Скинути фільтри
                  </TechButtonLink>
                  <TechButtonLink
                    href="/pidbir"
                    className="font-heading tracking-normal h-9"
                  >
                    Пройти підбір
                  </TechButtonLink>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((b, i) => (
                  <BuildCardStatic
                    key={b.slug}
                    build={b}
                    variant="full"
                    gameLabels={gameLabels}
                    gameShortLabels={gameShortLabels}
                    highlightGames={highlightGames}
                    priority={i < 2}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <SitePageSeoContent pageId="seoPcCatalogPage" />
    </>
  );
}
