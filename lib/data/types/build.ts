export type FpsResolution = "1080p" | "1440p" | "4K";
export type FpsPreset = "low" | "medium" | "high" | "ultra" | "competitive";

export type FpsEntry = {
  gameSlug: string;
  resolution: FpsResolution;
  preset: FpsPreset;
  fps: number;
};

export type BuildTier = "budget" | "mid" | "high";

export type Build = {
  slug: string;
  name: string;
  tagline: string;
  tier: BuildTier;
  cpu: { name: string; details?: string };
  gpu: { name: string; vram: string };
  ram: { size: string; type: string };
  storage: { size: string; type: string };
  priceUah: number;
  oldPriceUah?: number;
  monobankInstallments?: { months: number; perMonthUah: number };
  buildTimeText: string;
  badge?: "хіт" | "нова" | "акція";
  images: string[];
  fpsData: FpsEntry[];
  tags: string[];
  recommendedForGames: string[];
};
