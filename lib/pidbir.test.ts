import { describe, expect, it } from "vitest";
import { BUILDS } from "@/lib/mock/builds";
import {
  findFpsEntry,
  formatCriteriaSuffix,
  getBuildFpsProfile,
  majorityThreshold,
  passesMajorityGood,
  pickBuilds,
  nearBudgetMax,
} from "@/lib/pidbir";
import type { Build, BuildFpsEntry } from "@/types/build";

function miniCatalog(
  entries: Array<{
    slug: string;
    priceUah: number;
    fps: BuildFpsEntry[];
    targetResolution?: Build["targetResolution"];
  }>,
): Build[] {
  const base = BUILDS[0];
  return entries.map((e) => ({
    ...base,
    slug: e.slug as Build["slug"],
    name: e.slug.toUpperCase(),
    priceUah: e.priceUah,
    targetResolution: e.targetResolution ?? "fullhd",
    fps: e.fps,
  }));
}

describe("majorityThreshold", () => {
  it("requires all selected games for 1–2 picks", () => {
    expect(majorityThreshold(1)).toBe(1);
    expect(majorityThreshold(2)).toBe(2);
    expect(majorityThreshold(3)).toBe(2);
  });
});

describe("getBuildFpsProfile", () => {
  it("evaluates any game set by FPS tier", () => {
    const vega = BUILDS.find((b) => b.slug === "vega")!;
    const profile = getBuildFpsProfile(
      vega,
      ["cs2", "fortnite", "cyberpunk"],
      "fullhd",
    );
    expect(profile).not.toBeNull();
    expect(profile!.goodCount).toBe(3);
    expect(passesMajorityGood(profile!, 3)).toBe(true);
  });

  it("fails majority when bottleneck game is weak", () => {
    const comet = BUILDS.find((b) => b.slug === "comet")!;
    const profile = getBuildFpsProfile(
      comet,
      ["cs2", "cyberpunk", "warzone"],
      "fullhd",
    );
    expect(profile!.goodCount).toBe(1);
    expect(passesMajorityGood(profile!, 3)).toBe(false);
  });
});

describe("pickBuilds", () => {
  it("returns ideal match for any light game in budget", () => {
    const { results, matchQuality } = pickBuilds(
      {
        games: ["cs2"],
        budgetMin: 25000,
        budgetMax: 40000,
        resolution: "fullhd",
      },
      BUILDS,
    );

    expect(results.length).toBeGreaterThan(0);
    expect(matchQuality).toBe("ideal");
    for (const r of results) {
      const profile = getBuildFpsProfile(r.build, ["cs2"], "fullhd");
      expect(profile?.goodCount).toBe(1);
    }
  });

  it("handles heavy game at 4K on low budget without expensive cards", () => {
    const criteria = {
      games: ["cyberpunk"],
      budgetMin: 0,
      budgetMax: 25000,
      resolution: "4k" as const,
    };
    const { results, matchQuality, aspirational, stableFpsFromPrice } =
      pickBuilds(criteria, BUILDS);

    expect(results.length).toBeGreaterThan(0);
    expect(matchQuality).toBe("fps_compromise");
    for (const r of results) {
      expect(r.build.priceUah).toBeLessThanOrEqual(nearBudgetMax(criteria));
    }
    expect(aspirational).toBeUndefined();
    expect(stableFpsFromPrice).toBeGreaterThan(nearBudgetMax(criteria));
  });

  it("shows all majority-good builds in next price band above budget", () => {
    const criteria = {
      games: ["dota2"],
      budgetMin: 0,
      budgetMax: 25000,
    };
    const catalog = miniCatalog([
      {
        slug: "stellar",
        priceUah: 37490,
        fps: [{ gameSlug: "dota2", resolution: "fullhd", fpsAvg: 185 }],
      },
      {
        slug: "atom",
        priceUah: 39490,
        fps: [{ gameSlug: "dota2", resolution: "fullhd", fpsAvg: 180 }],
      },
      {
        slug: "flagship",
        priceUah: 144900,
        fps: [{ gameSlug: "dota2", resolution: "fullhd", fpsAvg: 390 }],
      },
    ]);

    const { results, matchQuality } = pickBuilds(criteria, catalog);
    const slugs = results.map((r) => r.build.slug);

    expect(matchQuality).toBe("budget_relaxed");
    expect(slugs).toContain("stellar");
    expect(slugs).toContain("atom");
    expect(slugs).not.toContain("flagship");
    for (const r of results) {
      expect(r.build.priceUah).toBeLessThanOrEqual(nearBudgetMax(criteria));
      expect(r.build.priceUah).toBeGreaterThan(25000);
    }
  });

  it("uses full next budget bucket for 0-40 budget", () => {
    const criteria = {
      games: ["warthunder"],
      budgetMin: 0,
      budgetMax: 40000,
    };
    const catalog = miniCatalog([
      {
        slug: "nyx",
        priceUah: 41990,
        fps: [{ gameSlug: "warthunder", resolution: "fullhd", fpsAvg: 130 }],
      },
      {
        slug: "nova",
        priceUah: 78990,
        fps: [{ gameSlug: "warthunder", resolution: "fullhd", fpsAvg: 145 }],
      },
      {
        slug: "zenith",
        priceUah: 80990,
        fps: [{ gameSlug: "warthunder", resolution: "fullhd", fpsAvg: 180 }],
      },
    ]);

    const { results, matchQuality } = pickBuilds(criteria, catalog, 10);
    const slugs = results.map((r) => r.build.slug);

    expect(matchQuality).toBe("budget_relaxed");
    expect(slugs).toContain("nyx");
    expect(slugs).toContain("nova");
    expect(slugs).not.toContain("zenith");
    expect(nearBudgetMax(criteria)).toBe(80000);
  });

  it("uses fullhd FPS by default for any game", () => {
    const nyx = BUILDS.find((b) => b.slug === "nyx")!;
    for (const slug of ["dota2", "cs2", "cyberpunk", "warzone"]) {
      const entry = findFpsEntry(nyx, slug);
      if (!entry) continue;
      expect(entry.resolution).toBe("fullhd");
    }
  });

  it("does not duplicate aspirational when already in results", () => {
    const { results, aspirational } = pickBuilds(
      {
        games: ["cs2", "fortnite"],
        budgetMin: 25000,
        budgetMax: 40000,
        resolution: "fullhd",
      },
      BUILDS,
    );

    expect(results.length).toBeGreaterThan(0);
    if (aspirational) {
      expect(
        results.some((r) => r.build.slug === aspirational.build.slug),
      ).toBe(false);
    }
  });

  it("never returns empty results when catalog has builds", () => {
    const { results } = pickBuilds(
      {
        games: ["cyberpunk", "gta5"],
        budgetMin: 0,
        budgetMax: 25000,
        resolution: "4k",
      },
      BUILDS,
    );

    expect(results.length).toBeGreaterThan(0);
  });

  it("formats criteria list for neutral copy", () => {
    expect(formatCriteriaSuffix("Dota 2")).toBe(": Dota 2");
    expect(formatCriteriaSuffix("CS2 + Стримінг")).toBe(": CS2, Стримінг");
    expect(formatCriteriaSuffix(undefined)).toBe("");
  });

  it("near budget max uses next known bucket when available", () => {
    expect(nearBudgetMax({ games: [], budgetMin: 0, budgetMax: 25000 })).toBe(
      40000,
    );
    expect(nearBudgetMax({ games: [], budgetMin: 0, budgetMax: 40000 })).toBe(
      80000,
    );
  });
});
