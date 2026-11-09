import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

async function headerRules() {
  expect(nextConfig.headers).toBeTypeOf("function");
  return (await nextConfig.headers!()) ?? [];
}

function cacheControlOf(rule: { headers: { key: string; value: string }[] }) {
  return rule.headers.find((h) => h.key.toLowerCase() === "cache-control")?.value;
}

describe("next.config: cache for non-hashed static assets", () => {
  it("favicon.ico and /images/** get a 30-day Cache-Control", async () => {
    const rules = await headerRules();
    for (const source of ["/favicon.ico", "/images/:path*"]) {
      const rule = rules.find((r) => r.source === source);
      expect(rule, `no header rule for ${source}`).toBeDefined();
      const cc = cacheControlOf(rule!);
      expect(cc).toContain(`max-age=${THIRTY_DAYS}`);
      expect(cc).toContain("public");
      expect(cc).not.toContain("immutable"); // URLs are not content-hashed
    }
  });

  it("only those two paths set Cache-Control (never HTML, _next/static, /fonts or mutable files)", async () => {
    const rules = await headerRules();
    const withCacheControl = rules.filter((r) => cacheControlOf(r) !== undefined);
    expect(withCacheControl.map((r) => r.source).sort()).toEqual(
      ["/favicon.ico", "/images/:path*"].sort(),
    );
  });

  it("optimized images (/_next/image) are cached for the same 30 days", () => {
    expect(nextConfig.images?.minimumCacheTTL).toBe(THIRTY_DAYS);
  });

  it("keeps the existing Link preconnect header on every path", async () => {
    const rules = await headerRules();
    const all = rules.find((r) => r.source === "/:path*");
    expect(all?.headers.some((h) => h.key === "Link" && h.value.includes("cdn.sanity.io"))).toBe(
      true,
    );
  });
});
