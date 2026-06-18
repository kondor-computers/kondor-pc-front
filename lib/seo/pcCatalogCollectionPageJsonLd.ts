import type { Build } from "@/types/build";
import { SITE_URL } from "@/lib/seo/constants";
import { formatPrice } from "@/lib/format";

function normalizeSiteUrl(): string {
  return SITE_URL.replace(/\/$/, "");
}

function visibleCatalogBuilds(builds: Build[]): Build[] {
  return builds.filter((build) => build.status !== "archived");
}

function defaultCatalogDescription(builds: Build[]): string | undefined {
  if (builds.length === 0) return undefined;

  const minPrice = builds.reduce(
    (min, build) => Math.min(min, build.priceUah),
    builds[0].priceUah,
  );

  return `${builds.length} готових ігрових ПК від ${formatPrice(minPrice)}. Реальний FPS у CS2, Warzone, Cyberpunk 2077. Збірка 3 дні, гарантія від 12 місяців.`;
}

export function pcCatalogCollectionPageJsonLd(
  builds: Build[],
  options?: { name?: string; description?: string },
) {
  const siteUrl = normalizeSiteUrl();
  const catalogUrl = `${siteUrl}/pk`;
  const catalogBuilds = visibleCatalogBuilds(builds);
  const name = options?.name?.trim() || "Каталог ігрових ПК — Kondor PC";
  const description =
    options?.description?.trim() || defaultCatalogDescription(catalogBuilds);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: catalogUrl,
    ...(description ? { description } : {}),
    inLanguage: "uk-UA",
    publisher: { "@id": `${siteUrl}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: catalogBuilds.map((build, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: build.name,
        url: `${siteUrl}/pk/${build.slug}`,
      })),
    },
  };
}
