import type { Build } from "../../types/build";

export const vega: Build = {
  slug: "vega",
  name: "VEGA",
  tagline: "Оптимально для Full HD геймінгу",
  tier: "budget",
  cpu: { name: "Ryzen 5 7400F" },
  gpu: { name: "RTX 5060", vram: "8 GB" },
  ram: { size: "32 GB", type: "DDR5 6000" },
  storage: { size: "500 GB", type: "NVMe" },
  priceUah: 34990,
  monobankInstallments: { months: 4, perMonthUah: 8748 },
  buildTimeText: "· Збираємо за 3 дні",
  images: [],
  fpsData: [
    { gameSlug: "cs2", resolution: "1080p", preset: "high", fps: 380 },
    { gameSlug: "cs2", resolution: "1080p", preset: "competitive", fps: 450 },
    { gameSlug: "cs2", resolution: "1440p", preset: "high", fps: 280 },
    { gameSlug: "warzone", resolution: "1080p", preset: "high", fps: 145 },
    { gameSlug: "gta-5", resolution: "1080p", preset: "high", fps: 140 },
  ],
  tags: ["budget", "competitive", "fullhd"],
  recommendedForGames: ["cs2", "valorant", "fortnite"],
};
