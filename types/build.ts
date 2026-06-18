import type { SkuSlug } from "@/lib/sku-accents";
import type { PageSeo } from "@/types/blogPost";
import type { ContentNode } from "@/lib/data/types/content";

export type { SkuSlug };

export type Resolution = "fullhd" | "2k" | "4k";
export type BuildStatus =
  | "in_stock"
  | "assemble_on_order"
  | "out_of_stock"
  | "archived";
export type BuildTier = "starter" | "base" | "prime" | "phantom" | "pulsar";
export type SettingsPreset = "low" | "medium" | "high" | "ultra";

export type ComponentCategory =
  | "cpu"
  | "gpu"
  | "ram"
  | "ssd"
  | "hdd"
  | "motherboard"
  | "psu"
  | "case"
  | "cooling"
  | "os";

export interface BuildSpecShort {
  cpu: string;
  gpu: string;
  gpuVram?: string;
  ram: string;
  ramSpeed?: string;
  storage: string;
}

export interface BuildComponent {
  category: ComponentCategory;
  brand: string;
  model: string;
  displayName: string;
  humanDescription: string;
  warrantyMonths: number;
}

export interface BuildFpsEntry {
  gameSlug: string;
  resolution: Resolution;
  fpsAvg: number;
  fpsMin?: number;
  settings?: SettingsPreset;
  verified?: boolean;
  notes?: string;
}

export interface ConfigOption {
  /** Stable slug — key for selection state and cart identity. */
  id: string;
  label: string;
  description?: string;
  /** ₴ delta relative to base price. Can be 0 or negative. */
  priceDelta: number;
  isDefault?: boolean;
}

export interface ConfigGroup {
  /** "ram" | "ssd" | "warranty" | ... — stable slug. */
  id: string;
  label: string;
  /** Lucide icon name (e.g. "memory-stick", "hard-drive", "shield"). */
  icon?: string;
  /** Overrides one of `build.spec` fields when selected — e.g. "ram" rewrites spec.ram. */
  overridesSpec?: "ram" | "storage";
  options: ConfigOption[];
}

export interface Build {
  slug: SkuSlug;
  /** Артикул для CRM / інвентаризації (Sanity `build.sku`). */
  sku: string;
  name: string;
  tier: BuildTier;
  targetResolution: Resolution;
  colorVariant: "black" | "white";
  shortTagline: string;
  priceUah: number;
  oldPriceUah?: number;
  status: BuildStatus;
  /** Показувати в блоці топ-3 на головній (Sanity `showInHomeTop3`). */
  showInHomeTop3?: boolean;
  assemblyDays: number;
  spec: BuildSpecShort;
  components: BuildComponent[];
  fps: BuildFpsEntry[];
  powerConsumptionW?: number;
  noiseLevelDb?: number;
  upgradePathNotes?: string;
  /** Переваги з Sanity (`build.includedBenefits` → `buildBenefit`). */
  includedBenefits: BuildBenefit[];
  /** FAQ з Sanity (`customFaq`, inline faqQuestion). */
  customFaqItems?: Array<{
    id?: string;
    question: string;
    answer: string;
    answerContent: ContentNode[];
  }>;
  /** Optional chassis photo — replaces ChassisArt SVG when present. Any absolute URL (Sanity CDN, Unsplash, etc.). */
  heroImageUrl?: string;
  /** Additional gallery shots. Future: from Sanity `gallery[]`. */
  galleryImageUrls?: string[];
  /** Відео збірки в галереї hero. MP4 або YouTube (Sanity `assemblyVideoUrl`). */
  assemblyVideoUrl?: string;
  /** Постер відео збірки (Sanity `assemblyVideoPoster`). */
  assemblyVideoPosterUrl?: string;
  /** Дата публікації відеозвіту (Sanity `assemblyVideoUploadDate`, ISO). */
  assemblyVideoUploadDate?: string;
  /** Відео секції «Реальні тести» (Sanity `gameplayVideoUrl`). */
  gameplayVideoUrl?: string;
  /** Постер відео секції «Реальні тести» (Sanity `gameplayVideoPoster`). */
  gameplayVideoPosterUrl?: string;
  /** Дата публікації геймплей-відео (Sanity `gameplayVideoUploadDate`, ISO). */
  gameplayVideoUploadDate?: string;
  /** Optional upgrade/option groups shown on the PC page configurator. When absent — configurator is hidden. */
  configurableOptions?: ConfigGroup[];
  /** Відгуки з Sanity (масив на документі збірки). */
  reviews?: Review[];
  /** SEO з Sanity (`build.seo` → `seoSettings`). */
  seo?: PageSeo | null;
}

export interface Game {
  slug: string;
  name: string;
  ukrName?: string;
  shortName?: string;
  genre?:
    | "fps"
    | "moba"
    | "battle_royale"
    | "sandbox"
    | "mmorpg"
    | "simulation"
    | "rpg"
    | "strategy"
    | "other";
  isPopular?: boolean;
  isSystemHeavy?: boolean;
  /** Optional key/cover art. When present, GameTile renders it as backdrop. */
  coverImageUrl?: string;
}

export interface BuildBenefit {
  key: string;
  title: string;
  description?: string;
}

export interface Review {
  authorName: string;
  /** Author photo — defaults to shared review avatar in mock data. */
  imageUrl: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  sourcePlatform: "google" | "instagram" | "telegram" | "direct";
  externalUrl?: string;
  relatedBuildSlug?: SkuSlug;
  isVerified?: boolean;
}

export interface Faq {
  key: string;
  scope:
    | "global"
    | "build"
    | "seo"
    | "delivery"
    | "warranty"
    | "payment"
    | "assembly";
  question: string;
  answer: string;
  /** Portable Text з Sanity — bold, italic, списки, посилання. */
  answerContent?: ContentNode[];
  relatedBuildSlug?: SkuSlug;
  /** false — не показувати на сайті (дані лишаються в коді). */
  visible?: boolean;
}

export interface TrustSignal {
  key:
    | "total_builds"
    | "years_active"
    | "instagram_followers"
    | "reviews_count"
    | "warranty_max_years";
  value: string;
  label: string;
  sourceUrl?: string;
}
