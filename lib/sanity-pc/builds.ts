import type {
  Build,
  BuildAddonCategory,
  BuildBenefit,
  BuildFpsEntry,
  BuildImage,
  ConfigGroup,
  ConfigOption,
  Review,
} from "@/types/build";
import type { PageSeo } from "@/types/blogPost";
import type { ContentNode } from "@/lib/data/types/content";
import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/revalidate";
import { portableTextToContent, portableTextToPlain } from "@/lib/sanity/portableText";
import { normalizeSanityDatetime } from "@/lib/sanity/normalizeDatetime";
import { SEO_SETTINGS_PROJECTION } from "@/lib/sanity/siteSeoQueries";
import {
  ASSEMBLY_VIDEO_POSTER_FALLBACK_ALT,
  defaultBuildImageAlt,
  GAMEPLAY_VIDEO_POSTER_FALLBACK_ALT,
} from "@/lib/build/images";
import { sanityPcClient } from "./client";
import { urlForPc } from "./image";

const DEFAULT_REVIEW_CARD_IMAGE = "/images/home/reviews/review.webp";

type RawFps = {
  gameSlug?: string;
  resolution?: string;
  settings?: string;
  fpsAvg?: number;
  fpsMin?: number;
  verified?: boolean;
  notes?: string;
};

type RawConfigOption = {
  id?: string;
  label?: string;
  description?: string;
  priceDelta?: number;
  isDefault?: boolean;
};

type RawReviewRow = {
  authorName?: string;
  authorPhoto?: unknown;
  rating?: number;
  text?: string;
  sourcePlatform?: string;
  externalUrl?: string;
  isVerified?: boolean;
};

type RawCustomFaqRow = {
  _key?: string;
  question?: string;
  answer?: unknown;
};

type RawBuildBenefit = {
  key?: string;
  title?: string;
  description?: string;
};

type RawBuildAddonDoc = {
  key?: string;
  title?: string;
  description?: string;
  priceUah?: number;
  category?: string;
  selectionMode?: string;
  sortOrder?: number;
  isActive?: boolean;
};

type RawAvailableAddon = {
  priceOverride?: number;
  isIncluded?: boolean;
  sortOrder?: number;
  addon?: RawBuildAddonDoc | null;
};

type RawBuild = {
  slug: string;
  sku?: string;
  name: string;
  tier: Build["tier"];
  status: Build["status"];
  showInHomeTop3?: boolean;
  shortTagline: string;
  priceUah: number;
  oldPriceUah?: number;
  assemblyDays: number;
  colorVariant?: Build["colorVariant"];
  targetResolution: Build["targetResolution"];
  cpu: string;
  baseRam: string;
  ramSpeed?: string;
  baseStorage: string;
  powerConsumptionW?: number;
  noiseLevelDb?: number;
  upgradePathNotes?: string;
  includedBenefits?: RawBuildBenefit[];
  customFaq?: RawCustomFaqRow[];
  components?: Build["components"];
  heroImage?: unknown;
  gallery?: unknown[];
  assemblyVideoUrl?: string;
  assemblyVideoPoster?: unknown;
  assemblyVideoUploadDate?: string;
  gameplayVideoUrl?: string;
  gameplayVideoPoster?: unknown;
  gameplayVideoUploadDate?: string;
  fpsCoefficient?: number;
  gpuDoc?: {
    brand?: string;
    model?: string;
    vram?: string;
    fps?: RawFps[];
  };
  ramOptions?: RawConfigOption[];
  ssdOptions?: RawConfigOption[];
  warrantyOptions?: RawConfigOption[];
  availableAddons?: RawAvailableAddon[];
  reviews?: RawReviewRow[];
  seo?: PageSeo | null;
};

const BUILDS_QUERY = `
*[_type == "build" && defined(slug.current)] | order(priceUah asc) {
  "slug": slug.current,
  sku,
  name,
  tier,
  status,
  showInHomeTop3,
  shortTagline,
  priceUah,
  oldPriceUah,
  assemblyDays,
  colorVariant,
  targetResolution,
  cpu,
  baseRam,
  ramSpeed,
  baseStorage,
  powerConsumptionW,
  noiseLevelDb,
  upgradePathNotes,
  "includedBenefits": coalesce(
    includedBenefits[]->{
      key,
      title,
      description
    },
    []
  ),
  "customFaq": coalesce(customFaq[]{_key, question, answer}, []),
  "components": coalesce(components, []),
  heroImage,
  "gallery": coalesce(gallery, []),
  assemblyVideoUrl,
  assemblyVideoPoster,
  assemblyVideoUploadDate,
  gameplayVideoUrl,
  gameplayVideoPoster,
  gameplayVideoUploadDate,
  fpsCoefficient,
  "gpuDoc": gpu->{
    brand,
    model,
    vram,
    "fps": coalesce(
      fps[]{
        "gameSlug": coalesce(game->slug, gameSlug),
        resolution,
        settings,
        fpsAvg,
        fpsMin,
        verified,
        notes
      },
      []
    )
  },
  "ramOptions": coalesce(ramOptions, []),
  "ssdOptions": coalesce(ssdOptions, []),
  "warrantyOptions": coalesce(warrantyOptions, []),
  "availableAddons": coalesce(availableAddons[]{
    priceOverride,
    isIncluded,
    sortOrder,
    "addon": addon->{
      key,
      title,
      description,
      priceUah,
      category,
      selectionMode,
      sortOrder,
      isActive
    }
  }, []),
  "reviews": coalesce(reviews, []),
  "seo": seo${SEO_SETTINGS_PROJECTION}
}
`;

function mapResolution(value?: string): BuildFpsEntry["resolution"] | null {
  if (value === "fullhd" || value === "2k" || value === "4k") return value;
  return null;
}

function mapSettings(value?: string): BuildFpsEntry["settings"] | undefined {
  if (value === "low" || value === "medium" || value === "high" || value === "ultra") {
    return value;
  }
  return undefined;
}

function normalizeOptionId(raw: RawConfigOption, index: number, fallbackPrefix: string): string {
  if (raw.id && raw.id.trim()) return raw.id.trim();
  if (raw.label && raw.label.trim()) {
    return `${fallbackPrefix}-${raw.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`;
  }
  return `${fallbackPrefix}-${index}`;
}

function mapConfigOptions(options: RawConfigOption[], prefix: string): ConfigOption[] {
  return options
    .filter((o) => Boolean(o?.label))
    .map((o, index) => ({
      id: normalizeOptionId(o, index + 1, prefix),
      label: o.label!.trim(),
      description: o.description?.trim() || undefined,
      priceDelta: typeof o.priceDelta === "number" ? o.priceDelta : 0,
      isDefault: Boolean(o.isDefault),
    }));
}

function mapAddonCategory(value?: string): BuildAddonCategory {
  if (
    value === "network" ||
    value === "power" ||
    value === "cooling" ||
    value === "software" ||
    value === "accessories" ||
    value === "other"
  ) {
    return value;
  }
  return "other";
}

type ResolvedBuildAddon = {
  key: string;
  title: string;
  description?: string;
  priceDelta: number;
  category: BuildAddonCategory;
  selectionMode: "additive" | "single";
  sortOrder: number;
  isIncluded: boolean;
};

function resolveBuildAddons(rows?: RawAvailableAddon[]): ResolvedBuildAddon[] {
  if (!rows?.length) return [];

  const resolved: ResolvedBuildAddon[] = [];
  for (const row of rows) {
    const doc = row.addon;
    if (!doc || doc.isActive === false) continue;
    const key = doc.key?.trim();
    const title = doc.title?.trim();
    if (!key || !title) continue;

    const isIncluded = Boolean(row.isIncluded);
    const priceDelta = isIncluded
      ? 0
      : typeof row.priceOverride === "number"
        ? row.priceOverride
        : typeof doc.priceUah === "number"
          ? doc.priceUah
          : 0;

    const sortOrder =
      typeof row.sortOrder === "number"
        ? row.sortOrder
        : typeof doc.sortOrder === "number"
          ? doc.sortOrder
          : 999;

    resolved.push({
      key,
      title,
      description: doc.description?.trim() || undefined,
      priceDelta,
      category: mapAddonCategory(doc.category),
      selectionMode: doc.selectionMode === "single" ? "single" : "additive",
      sortOrder,
      isIncluded,
    });
  }

  return resolved.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "uk"));
}

function mapAddonToOption(addon: ResolvedBuildAddon): ConfigOption {
  return {
    id: addon.key,
    addonKey: addon.key,
    addonCategory: addon.category,
    addonSelectionMode: addon.selectionMode,
    label: addon.title,
    description: addon.description,
    priceDelta: addon.priceDelta,
    isIncluded: addon.isIncluded,
    isDefault: addon.isIncluded,
  };
}

function makeAddonConfigGroups(addons: ResolvedBuildAddon[]): ConfigGroup[] {
  if (addons.length === 0) return [];

  return [
    {
      id: "addons",
      label: "Додаткові опції",
      selectionMode: "multiple",
      options: addons.map(mapAddonToOption),
    },
  ];
}

function makeConfigGroups(raw: RawBuild): ConfigGroup[] | undefined {
  const groups: ConfigGroup[] = [];

  const ram = mapConfigOptions(raw.ramOptions ?? [], "ram");
  if (ram.length > 0) {
    groups.push({
      id: "ram",
      label: "Оперативна пам'ять",
      icon: "memory-stick",
      overridesSpec: "ram",
      options: ram,
    });
  }

  const ssd = mapConfigOptions(raw.ssdOptions ?? [], "ssd");
  if (ssd.length > 0) {
    groups.push({
      id: "storage",
      label: "Накопичувач SSD",
      icon: "hard-drive",
      overridesSpec: "storage",
      options: ssd,
    });
  }

  const warranty = mapConfigOptions(raw.warrantyOptions ?? [], "warranty");
  if (warranty.length > 0) {
    groups.push({
      id: "warranty",
      label: "Гарантія",
      icon: "shield",
      options: warranty,
    });
  }

  groups.push(...makeAddonConfigGroups(resolveBuildAddons(raw.availableAddons)));

  return groups.length > 0 ? groups : undefined;
}

function mapFps(raw: RawBuild): BuildFpsEntry[] {
  const coefficient =
    typeof raw.fpsCoefficient === "number" && Number.isFinite(raw.fpsCoefficient)
      ? raw.fpsCoefficient
      : 1;

  const entries: BuildFpsEntry[] = [];
  for (const row of raw.gpuDoc?.fps ?? []) {
    const resolution = mapResolution(row.resolution);
    if (!resolution || !row.gameSlug || typeof row.fpsAvg !== "number") continue;

    const adjustedAvg = Math.max(1, Math.round(row.fpsAvg * coefficient));
    const adjustedMin =
      typeof row.fpsMin === "number"
        ? Math.max(1, Math.round(row.fpsMin * coefficient))
        : undefined;

    const settings = mapSettings(row.settings);
    const entry: BuildFpsEntry = {
      gameSlug: row.gameSlug,
      resolution,
      fpsAvg: adjustedAvg,
      fpsMin: adjustedMin,
      verified: row.verified,
      notes: row.notes,
    };
    if (settings) entry.settings = settings;
    entries.push(entry);
  }
  return entries;
}

function toImageUrl(image: unknown): string | undefined {
  if (!image) return undefined;
  try {
    return urlForPc(image as never).width(1600).quality(85).auto("format").url();
  } catch {
    return undefined;
  }
}

type SanityImageWithAlt = {
  alt?: string;
};

function toBuildImage(
  image: unknown,
  fallbackAlt?: string,
): BuildImage | undefined {
  const url = toImageUrl(image);
  if (!url) return undefined;
  const alt = (image as SanityImageWithAlt).alt?.trim();
  return {
    url,
    ...(alt ? { alt } : fallbackAlt ? { alt: fallbackAlt } : {}),
  };
}

function mapSourcePlatform(value?: string): Review["sourcePlatform"] {
  if (value === "google" || value === "instagram" || value === "telegram" || value === "direct") {
    return value;
  }
  return "direct";
}

function clampRating(n: number): Review["rating"] {
  const r = Number.isFinite(n) ? Math.round(n) : 5;
  const x = Math.min(5, Math.max(1, r));
  return x as Review["rating"];
}

function mapOneReview(row: RawReviewRow, buildSlug: Build["slug"]): Review | null {
  const authorName = row.authorName?.trim();
  const text = row.text?.trim();
  if (!authorName || !text) return null;

  const imageUrl = toImageUrl(row.authorPhoto) ?? DEFAULT_REVIEW_CARD_IMAGE;
  const imageAlt = (row.authorPhoto as SanityImageWithAlt | undefined)?.alt?.trim();

  return {
    authorName,
    image: {
      url: imageUrl,
      ...(imageAlt ? { alt: imageAlt } : { alt: authorName }),
    },
    rating: clampRating(typeof row.rating === "number" ? row.rating : 5),
    text,
    sourcePlatform: mapSourcePlatform(row.sourcePlatform),
    externalUrl: row.externalUrl?.trim() || undefined,
    relatedBuildSlug: buildSlug,
    isVerified: Boolean(row.isVerified),
  };
}

function mapReviews(
  rows: RawReviewRow[] | undefined,
  buildSlug: Build["slug"],
): Review[] | undefined {
  if (!rows?.length) return undefined;
  const list = rows.map((row) => mapOneReview(row, buildSlug)).filter((r): r is Review => r !== null);
  return list.length > 0 ? list : undefined;
}

function mapBenefits(rows?: RawBuildBenefit[]): BuildBenefit[] {
  if (!rows?.length) return [];
  return rows
    .map((row) => {
      const key = row.key?.trim();
      const title = row.title?.trim();
      if (!key || !title) return null;
      const description = row.description?.trim();
      return {
        key,
        title,
        ...(description ? { description } : {}),
      };
    })
    .filter((row): row is BuildBenefit => row !== null);
}

function mapCustomFaq(rows?: RawCustomFaqRow[]): Build["customFaqItems"] {
  if (!rows?.length) return undefined;
  const list = rows
    .map((row) => {
      const pt = row.answer as Parameters<typeof portableTextToPlain>[0];
      const answerContent = portableTextToContent(pt);
      const answer = portableTextToPlain(pt);
      return {
        id: row._key,
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

/** Перші `limit` відгуків у порядку документів збірок (як у списку getAllBuilds). */
const HOME_TOP_BUILDS_COUNT = 3;

/** Топ-3 на головній: спочатку з `showInHomeTop3` (до 3), решту — з каталогу. */
export function selectHomeTopBuilds(
  builds: Build[],
  count = HOME_TOP_BUILDS_COUNT,
): Build[] {
  const picked: Build[] = [];
  const used = new Set<string>();

  for (const b of builds) {
    if (!b.showInHomeTop3) continue;
    if (picked.length >= count) break;
    picked.push(b);
    used.add(b.slug);
  }

  if (picked.length < count) {
    for (const b of builds) {
      if (used.has(b.slug)) continue;
      picked.push(b);
      used.add(b.slug);
      if (picked.length >= count) break;
    }
  }

  return picked;
}

export function collectHomepageReviews(builds: Build[], limit = 3): Review[] {
  const out: Review[] = [];
  for (const b of builds) {
    for (const r of b.reviews ?? []) {
      if (out.length >= limit) return out;
      out.push(r);
    }
  }
  return out;
}

function mapBuild(raw: RawBuild): Build {
  const defaultAlt = defaultBuildImageAlt();
  const heroImage = toBuildImage(raw.heroImage, defaultAlt);
  const galleryImages = (raw.gallery ?? [])
    .map((img) => toBuildImage(img, defaultAlt))
    .filter((image): image is BuildImage => Boolean(image));

  const assemblyVideoPoster = toBuildImage(
    raw.assemblyVideoPoster,
    ASSEMBLY_VIDEO_POSTER_FALLBACK_ALT,
  );
  const gameplayVideoPoster = toBuildImage(
    raw.gameplayVideoPoster,
    GAMEPLAY_VIDEO_POSTER_FALLBACK_ALT,
  );
  const gpuLabel = [raw.gpuDoc?.brand, raw.gpuDoc?.model].filter(Boolean).join(" ").trim();

  return {
    slug: raw.slug as Build["slug"],
    sku: raw.sku ?? `KPC-${raw.name.toUpperCase().replace(/\s+/g, "-")}`,
    name: raw.name,
    tier: raw.tier,
    targetResolution: raw.targetResolution,
    colorVariant: raw.colorVariant ?? "black",
    shortTagline: raw.shortTagline,
    priceUah: raw.priceUah,
    oldPriceUah: raw.oldPriceUah,
    status: raw.status,
    showInHomeTop3: Boolean(raw.showInHomeTop3),
    assemblyDays: raw.assemblyDays,
    spec: {
      cpu: raw.cpu,
      gpu: gpuLabel || "GPU",
      gpuVram: raw.gpuDoc?.vram,
      ram: raw.baseRam,
      ramSpeed: raw.ramSpeed,
      storage: raw.baseStorage,
    },
    components: raw.components ?? [],
    fps: mapFps(raw),
    powerConsumptionW: raw.powerConsumptionW,
    noiseLevelDb: raw.noiseLevelDb,
    upgradePathNotes: raw.upgradePathNotes,
    includedBenefits: mapBenefits(raw.includedBenefits),
    customFaqItems: mapCustomFaq(raw.customFaq),
    reviews: mapReviews(raw.reviews, raw.slug as Build["slug"]),
    heroImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
    assemblyVideoUrl: raw.assemblyVideoUrl,
    assemblyVideoPoster,
    assemblyVideoUploadDate: normalizeSanityDatetime(raw.assemblyVideoUploadDate),
    gameplayVideoUrl: raw.gameplayVideoUrl,
    gameplayVideoPoster,
    gameplayVideoUploadDate: normalizeSanityDatetime(raw.gameplayVideoUploadDate),
    configurableOptions: makeConfigGroups(raw),
    seo: raw.seo ?? null,
  };
}

export async function getAllBuilds(): Promise<Build[]> {
  const rows = await sanityPcClient.fetch<RawBuild[]>(
    BUILDS_QUERY,
    {},
    {
      next: {
        revalidate: SANITY_REVALIDATE_SECONDS,
        tags: ["sanity:pc:builds"],
      },
    },
  );

  return rows.map(mapBuild);
}

export async function getBuildBySlug(slug: string): Promise<Build | null> {
  const builds = await getAllBuilds();
  return builds.find((b) => b.slug === slug) ?? null;
}

export async function getPopularBuilds(
  slugs: Build["slug"][] = ["vega", "nebula", "orbitra"],
): Promise<Build[]> {
  const builds = await getAllBuilds();
  return slugs
    .map((slug) => builds.find((b) => b.slug === slug))
    .filter((b): b is Build => Boolean(b));
}

export function pickSimilarBuilds(
  builds: Build[],
  currentSlug: string,
  limit = 3,
): Build[] {
  const current = builds.find((b) => b.slug === currentSlug);
  if (!current) return [];

  return builds
    .filter((b) => b.slug !== currentSlug)
    .sort(
      (a, b) =>
        Math.abs(a.priceUah - current.priceUah) -
        Math.abs(b.priceUah - current.priceUah),
    )
    .slice(0, limit);
}

export async function getSimilarBuilds(
  currentSlug: string,
  limit = 3,
): Promise<Build[]> {
  const builds = await getAllBuilds();
  return pickSimilarBuilds(builds, currentSlug, limit);
}

export async function getBuildSlugs(): Promise<Array<{ slug: string }>> {
  const builds = await getAllBuilds();
  return builds.map((b) => ({ slug: b.slug }));
}

