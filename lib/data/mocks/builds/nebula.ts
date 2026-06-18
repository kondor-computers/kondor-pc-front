import type { Build } from "../../types/build";

export const nebula: Build = {
  slug: "nebula",
  name: "NEBULA",
  tagline: "2K геймінг без компромісів",
  tier: "mid",
  cpu: { name: "Ryzen 7 7800X3D" },
  gpu: { name: "RTX 5060 Ti", vram: "16 GB" },
  ram: { size: "32 GB", type: "DDR5 6000" },
  storage: { size: "500 GB", type: "NVMe" },
  priceUah: 49990,
  oldPriceUah: 54990,
  monobankInstallments: { months: 4, perMonthUah: 12498 },
  buildTimeText: "✓ В наявності",
  badge: "хіт",
  images: [],
  fpsData: [
    { gameSlug: "cs2", resolution: "1440p", preset: "high", fps: 380 },
    { gameSlug: "cs2", resolution: "1080p", preset: "competitive", fps: 500 },
    { gameSlug: "warzone", resolution: "1440p", preset: "high", fps: 130 },
    { gameSlug: "gta-5", resolution: "1440p", preset: "high", fps: 110 },
  ],
  tags: ["mid", "2k", "streaming"],
  recommendedForGames: ["warzone", "cyberpunk-2077", "cs2"],
};
