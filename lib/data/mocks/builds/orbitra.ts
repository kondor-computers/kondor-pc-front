import type { Build } from "../../types/build";

export const orbitra: Build = {
  slug: "orbitra",
  name: "ORBITRA",
  tagline: "4K геймінг та стрімінг",
  tier: "high",
  cpu: { name: "Ryzen 7 9800X3D" },
  gpu: { name: "RTX 5070 Ti", vram: "16 GB" },
  ram: { size: "32 GB", type: "DDR5 6000" },
  storage: { size: "1 TB", type: "NVMe" },
  priceUah: 89990,
  monobankInstallments: { months: 4, perMonthUah: 22498 },
  buildTimeText: "· Збираємо за 5 днів",
  images: [],
  fpsData: [
    { gameSlug: "cs2", resolution: "4K", preset: "high", fps: 240 },
    { gameSlug: "cs2", resolution: "1440p", preset: "competitive", fps: 600 },
    { gameSlug: "warzone", resolution: "4K", preset: "high", fps: 100 },
    { gameSlug: "gta-5", resolution: "4K", preset: "high", fps: 85 },
  ],
  tags: ["high", "4k", "streaming"],
  recommendedForGames: ["cyberpunk-2077", "warzone"],
};
