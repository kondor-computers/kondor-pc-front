import type { Metadata } from "next";
import { BuildCard } from "@/components/shared/BuildCard";
import {
  parseBudget,
  parseGames,
  pickBuilds,
  BADGE_META,
  MATCH_QUALITY_COPY,
  formatCriteriaSuffix,
} from "@/lib/pidbir";
import { formatUah } from "@/lib/format";
import { getAllBuilds } from "@/lib/sanity-pc/builds";
import {
  getAllGames,
  makeGameLabelMap,
  makeGameShortLabelMap,
} from "@/lib/sanity-pc/games";
import type { Resolution } from "@/types/build";
import { cn } from "@/lib/utils";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import ArrowIcon from "@/components/icons/ArrowIcon";
import { SitePageSchemaJson } from "@/components/seo/SitePageSchemaJson";
import { SiteWebPageJsonLd } from "@/components/seo/SiteWebPageJsonLd";
import { SitePageSeoContent } from "@/components/seo/SitePageSeoContent";
import { metadataForSitePage } from "@/lib/sanity/siteSeoFetcher";

export async function generateMetadata(): Promise<Metadata> {
  const base = await metadataForSitePage("seoPickerResultPage");
  return {
    ...base,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const games = parseGames(sp.games);
  const { min, max } = parseBudget(sp.budget);
  const resolution = (sp.resolution ?? undefined) as Resolution | undefined;
  const [builds, gamesCatalog] = await Promise.all([
    getAllBuilds(),
    getAllGames(),
  ]);
  const gameLabels = makeGameLabelMap(gamesCatalog);
  const gameShortLabels = makeGameShortLabelMap(gamesCatalog);

  const criteria = {
    games,
    budgetMin: min,
    budgetMax: max,
    resolution,
  };
  const { results, aspirational, stableFpsFromPrice, matchQuality } =
    pickBuilds(criteria, builds);

  const budgetLabel =
    min === 0
      ? `до ${Math.round(max / 1000)}к ₴`
      : `${Math.round(min / 1000)}–${Math.round(max / 1000)}к ₴`;

  const gamesLabel =
    games.length > 0
      ? games.map((slug) => gameLabels[slug] ?? slug).join(" + ")
      : "УСІХ ПОПУЛЯРНИХ ІГОР";

  const criteriaLabel =
    games.length > 0
      ? games.map((slug) => gameLabels[slug] ?? slug).join(" + ")
      : undefined;

  const budgetOverage =
    aspirational && aspirational.build.priceUah > max
      ? aspirational.build.priceUah - max
      : 0;

  return (
    <>
      <SitePageSchemaJson
        pageId="seoPickerResultPage"
        excludeTypes={["WebPage"]}
      />
      <SiteWebPageJsonLd pageId="seoPickerResultPage" />
    <div className="container-site py-12 md:py-16">
      <div className="mb-10">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Результат підбору
        </div>
        <h1 className="font-display text-3xl font-bold md:text-5xl">
          ДЛЯ {gamesLabel}
          <br />
          <span className="text-muted-foreground">У БЮДЖЕТІ {budgetLabel}</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          {MATCH_QUALITY_COPY[matchQuality](
            results.length,
            games.length,
            criteriaLabel,
          )}
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <div key={r.build.slug} className="relative">
            {r.badge && (
              <BadgePill badge={r.badge} />
            )}
            <BuildCard
              build={r.build}
              variant="full"
              gameLabels={gameLabels}
              highlightGames={
                games.length > 0 ? games : ["cs2", "warzone", "cyberpunk"]
              }
            />
          </div>
        ))}
      </div>
      {aspirational && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Щоб отримати 60+ FPS для обраних критеріїв
            {formatCriteriaSuffix(criteriaLabel)}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {budgetOverage > 0 ? (
              <>
                Найближчий варіант зі стабільним FPS —{" "}
                <span className="text-foreground">
                  {formatUah(aspirational.build.priceUah)} ₴
                </span>{" "}
                (на{" "}
                <span className="text-foreground">
                  +{formatUah(budgetOverage)} ₴
                </span>{" "}
                до верхньої межі бюджету).
              </>
            ) : (
              <>
                Ось найдешевший варіант зі стабільним FPS для обраних критеріїв
                {formatCriteriaSuffix(criteriaLabel)} — він не потрапив у основний
                список, бо в бюджеті є лише компромісні збірки.
              </>
            )}
          </p>
          <div className="relative mt-8 max-w-md">
            {aspirational.badge && (
              <BadgePill badge={aspirational.badge} />
            )}
            <BuildCard
              build={aspirational.build}
              variant="full"
              gameLabels={gameLabels}
              highlightGames={games}
            />
          </div>
        </section>
      )}

      {!aspirational && stableFpsFromPrice && results.length === 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Для стабільного FPS потрібен більший бюджет
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            У діапазоні {budgetLabel} немає збірки з 60+ FPS для обраних
            критеріїв{formatCriteriaSuffix(criteriaLabel)}. Мінімальний варіант зі
            стабільним FPS коштує від{" "}
            <span className="text-foreground">
              {formatUah(stableFpsFromPrice)} ₴
            </span>
            . Спробуй розширити бюджет або знизити роздільність монітора.
          </p>
          <div className="mt-6">
            <TechButtonLink
              href="/pk"
              variant="muted"
              className="h-12 px-3 sm:px-6 font-heading tracking-normal text-[11px] sm:text-[12px]"
            >
              Переглянути каталог
            </TechButtonLink>
          </div>
        </section>
      )}

      <div className="mt-16 border-t border-border pt-10 text-center">
        <div className="mb-4 text-sm text-muted-foreground">
          Не знайшов оптимальне?
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <TechButtonLink
            href="/sborka"
            variant="white"
            className="h-12 px-3 sm:px-6 font-heading tracking-normal whitespace-nowrap"
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap text-[11px] sm:text-[12px]">
              Кастомна збірка під твої вимоги <ArrowIcon className="mb-0.5" />
            </span>
          </TechButtonLink>
          <TechButtonLink
            href="/pidbir"
            variant="muted"
            className="h-12 px-3 sm:px-6 font-heading tracking-normal text-[11px] sm:text-[12px]"
          >
            Змінити критерії
          </TechButtonLink>
        </div>
      </div>
    </div>
      <SitePageSeoContent pageId="seoPickerResultPage" />
    </>
  );
}

function BadgePill({ badge }: { badge: keyof typeof BADGE_META }) {
  return (
    <div
      className={cn(
        "absolute -top-3 left-5 z-10 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
        badge === "recommended" &&
          "border-[color:var(--fps-green)]/50 bg-[color:var(--fps-green)]/10 text-[color:var(--fps-green)]",
        badge === "stable-fps" &&
          "border-[color:var(--fps-green)]/50 bg-[color:var(--fps-green)]/10 text-[color:var(--fps-green)]",
        badge === "cheapest" && "border-border bg-surface text-foreground",
        badge === "with-headroom" &&
          "border-[color:var(--sku-pulsar)]/50 bg-[color:var(--sku-pulsar)]/10 text-[color:var(--sku-pulsar)]",
      )}
    >
      {BADGE_META[badge].label}
    </div>
  );
}
