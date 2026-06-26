import type {
  Build,
  BuildAddonCategory,
  BuildBenefit,
  BuildFpsEntry,
  BuildImage,
  BuildSpecShort,
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
  sku?: string;
  /** @deprecated legacy slug before catalog SKU */
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

type RawCpuDoc = {
  brand?: string;
  model?: string;
  priceUah?: number;
  sku?: string;
};

type RawRamDoc = {
  title?: string;
  capacityGb?: number;
  memoryType?: string;
  speedMhz?: number;
  kitLayout?: string;
  priceUah?: number;
  sku?: string;
};

type RawGpuDoc = {
  brand?: string;
  model?: string;
  vram?: string;
  priceUah?: number;
  sku?: string;
  fps?: RawFps[];
};

type RawCpuConfigOption = {
  id?: string;
  description?: string;
  isDefault?: boolean;
  cpuDoc?: RawCpuDoc | null;
};

type RawRamConfigOption = {
  id?: string;
  description?: string;
  isDefault?: boolean;
  ramDoc?: RawRamDoc | null;
};

type RawGpuConfigOption = {
  id?: string;
  description?: string;
  isDefault?: boolean;
  fpsCoefficient?: number;
  gpuDoc?: RawGpuDoc | null;
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
  cpuOptions?: RawCpuConfigOption[];
  gpuOptions?: RawGpuConfigOption[];
  ramOptions?: RawRamConfigOption[];
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
  "cpuOptions": coalesce(cpuOptions[]{
    id,
    description,
    isDefault,
    "cpuDoc": cpu->{
      brand,
      model,
      priceUah,
      "sku": sku.current
    }
  }, []),
  "gpuOptions": coalesce(gpuOptions[]{
    id,
    description,
    isDefault,
    fpsCoefficient,
    "gpuDoc": gpu->{
      brand,
      model,
      vram,
      priceUah,
      "sku": sku.current,
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
    }
  }, []),
  "ramOptions": coalesce(ramOptions[]{
    id,
    description,
    isDefault,
    "ramDoc": ram->{
      title,
      capacityGb,
      memoryType,
      speedMhz,
      kitLayout,
      priceUah,
      "sku": sku.current
    }
  }, []),
  "ssdOptions": coalesce(ssdOptions, []),
  "warrantyOptions": coalesce(warrantyOptions, []),
  "availableAddons": coalesce(availableAddons[]{
    priceOverride,
    isIncluded,
    sortOrder,
    "addon": addon->{
      "sku": sku.current,
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

function normalizeCatalogOptionId(
  rawId: string | undefined,
  index: number,
  prefix: string,
): string {
  if (rawId?.trim()) return rawId.trim();
  return `${prefix}-${index}`;
}

function mapCpuOptions(options: RawCpuConfigOption[]): ConfigOption[] {
  const result: ConfigOption[] = [];
  options.forEach((row, index) => {
    const doc = row.cpuDoc;
    if (!doc?.brand?.trim() || !doc.model?.trim()) return;
    result.push({
      id: normalizeCatalogOptionId(row.id, index + 1, "cpu"),
      label: `${doc.brand.trim()} ${doc.model.trim()}`,
      description: row.description?.trim() || undefined,
      priceDelta: typeof doc.priceUah === "number" ? doc.priceUah : 0,
      isDefault: Boolean(row.isDefault),
      sku: doc.sku?.trim() || undefined,
    });
  });
  return result;
}

function mapRamOptions(options: RawRamConfigOption[]): ConfigOption[] {
  const result: ConfigOption[] = [];
  options.forEach((row, index) => {
    const doc = row.ramDoc;
    const title = doc?.title?.trim();
    if (!doc || !title) return;
    result.push({
      id: normalizeCatalogOptionId(row.id, index + 1, "ram"),
      label: title,
      description: row.description?.trim() || undefined,
      priceDelta: typeof doc.priceUah === "number" ? doc.priceUah : 0,
      isDefault: Boolean(row.isDefault),
      ramSpeed:
        typeof doc.speedMhz === "number" ? String(doc.speedMhz) : undefined,
      sku: doc.sku?.trim() || undefined,
    });
  });
  return result;
}

function mapGpuOptions(options: RawGpuConfigOption[]): ConfigOption[] {
  const result: ConfigOption[] = [];
  options.forEach((row, index) => {
    const doc = row.gpuDoc;
    if (!doc?.brand?.trim() || !doc.model?.trim()) return;
    const fpsCoefficient =
      typeof row.fpsCoefficient === "number" &&
      Number.isFinite(row.fpsCoefficient)
        ? row.fpsCoefficient
        : 1;
    result.push({
      id: normalizeCatalogOptionId(row.id, index + 1, "gpu"),
      label: `${doc.brand.trim()} ${doc.model.trim()}`,
      description: row.description?.trim() || undefined,
      priceDelta: typeof doc.priceUah === "number" ? doc.priceUah : 0,
      isDefault: Boolean(row.isDefault),
      gpuVram: doc.vram?.trim() || undefined,
      sku: doc.sku?.trim() || undefined,
      fpsCoefficient,
      fps: mapFpsRows(doc.fps ?? [], fpsCoefficient),
    });
  });
  return result;
}

function findDefaultOption(group?: ConfigGroup): ConfigOption | undefined {
  if (!group?.options.length) return undefined;
  return group.options.find((option) => option.isDefault) ?? group.options[0];
}

function deriveDefaultSpec(
  groups: ConfigGroup[] | undefined,
  components: Build["components"],
): BuildSpecShort {
  const byId = (id: string) => groups?.find((group) => group.id === id);
  const cpu = findDefaultOption(byId("cpu"));
  const gpu = findDefaultOption(byId("gpu"));
  const ram = findDefaultOption(byId("ram"));
  const storage = findDefaultOption(byId("storage"));

  const componentLabel = (category: Build["components"][number]["category"]) =>
    components.find((component) => component.category === category)?.displayName;

  return {
    cpu: cpu?.label ?? componentLabel("cpu") ?? "CPU",
    gpu: gpu?.label ?? componentLabel("gpu") ?? "GPU",
    gpuVram: gpu?.gpuVram,
    ram: ram?.label ?? componentLabel("ram") ?? "RAM",
    ramSpeed: ram?.ramSpeed,
    storage: storage?.label ?? componentLabel("ssd") ?? "SSD",
  };
}

function deriveDefaultFps(groups: ConfigGroup[] | undefined): BuildFpsEntry[] {
  const gpu = findDefaultOption(groups?.find((group) => group.id === "gpu"));
  return gpu?.fps ?? [];
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
  sku: string;
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
    const sku = doc.sku?.trim() || doc.key?.trim();
    const title = doc.title?.trim();
    if (!sku || !title) continue;

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
      sku,
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
    id: addon.sku,
    sku: addon.sku,
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

  const cpu = mapCpuOptions(raw.cpuOptions ?? []);
  if (cpu.length > 0) {
    groups.push({
      id: "cpu",
      label: "Процесор",
      overridesSpec: "cpu",
      options: cpu,
    });
  }

  const gpu = mapGpuOptions(raw.gpuOptions ?? []);
  if (gpu.length > 0) {
    groups.push({
      id: "gpu",
      label: "Відеокарта",
      overridesSpec: "gpu",
      options: gpu,
    });
  }

  const ram = mapRamOptions(raw.ramOptions ?? []);
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

function mapFpsRows(rows: RawFps[], coefficient = 1): BuildFpsEntry[] {
  const safeCoefficient =
    typeof coefficient === "number" && Number.isFinite(coefficient)
      ? coefficient
      : 1;

  const entries: BuildFpsEntry[] = [];
  for (const row of rows) {
    const resolution = mapResolution(row.resolution);
    if (!resolution || !row.gameSlug || typeof row.fpsAvg !== "number") continue;

    const adjustedAvg = Math.max(1, Math.round(row.fpsAvg * safeCoefficient));
    const adjustedMin =
      typeof row.fpsMin === "number"
        ? Math.max(1, Math.round(row.fpsMin * safeCoefficient))
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
  const configurableOptions = makeConfigGroups(raw);
  const components = raw.components ?? [];
  const spec = deriveDefaultSpec(configurableOptions, components);
  const fps = deriveDefaultFps(configurableOptions);

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
    spec,
    components,
    fps,
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
    configurableOptions,
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

