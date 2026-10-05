import { describe, expect, it } from "vitest";
import { BUILDS } from "@/lib/mock/builds";
import {
  buildFeedAvailability,
  buildFeedDescription,
  buildFeedId,
  buildFeedImageUrls,
  buildFeedItemXml,
  buildFeedLink,
  buildFeedPrices,
  buildFeedXml,
  escapeXml,
  isFeedBuild,
  toFeedImageUrl,
} from "@/lib/feed";
import type { Build } from "@/types/build";

const BASE_URL = "https://kondor-pc.ua";
const IMG = "https://cdn.sanity.io/images/p/production/abc-1200x800.webp?w=1600&q=85&auto=format";

function makeBuild(overrides: Partial<Build> = {}): Build {
  return {
    ...BUILDS[0],
    slug: "test-pc" as Build["slug"],
    sku: "KPC-TEST",
    name: "TEST",
    priceUah: 40000,
    oldPriceUah: undefined,
    status: "in_stock",
    showInFeed: true,
    heroImage: { url: IMG },
    galleryImages: undefined,
    seo: null,
    ...overrides,
  };
}

describe("escapeXml", () => {
  it("escapes XML special characters", () => {
    expect(escapeXml(`A & B <c> "d" 'e'`)).toBe(
      "A &amp; B &lt;c&gt; &quot;d&quot; &apos;e&apos;",
    );
  });
});

describe("isFeedBuild", () => {
  it("requires showInFeed", () => {
    expect(isFeedBuild(makeBuild({ showInFeed: false }))).toBe(false);
    expect(isFeedBuild(makeBuild({ showInFeed: undefined }))).toBe(false);
    expect(isFeedBuild(makeBuild())).toBe(true);
  });

  it("excludes archived builds", () => {
    expect(isFeedBuild(makeBuild({ status: "archived" }))).toBe(false);
  });
});

describe("buildFeedAvailability", () => {
  it("maps build status to Meta availability", () => {
    expect(buildFeedAvailability(makeBuild({ status: "in_stock" }))).toBe("in stock");
    expect(buildFeedAvailability(makeBuild({ status: "assemble_on_order" }))).toBe(
      "preorder",
    );
    expect(buildFeedAvailability(makeBuild({ status: "out_of_stock" }))).toBe(
      "out of stock",
    );
  });
});

describe("buildFeedId / buildFeedLink", () => {
  it("uses SKU as id and falls back to slug", () => {
    expect(buildFeedId(makeBuild())).toBe("KPC-TEST");
    expect(buildFeedId(makeBuild({ sku: " " }))).toBe("test-pc");
  });

  it("links to the /pk/[slug] page", () => {
    expect(buildFeedLink(makeBuild(), BASE_URL)).toBe("https://kondor-pc.ua/pk/test-pc");
  });
});

describe("buildFeedPrices", () => {
  it("returns only price without discount", () => {
    expect(buildFeedPrices(makeBuild())).toEqual({
      price: "40000.00 UAH",
      salePrice: null,
    });
  });

  it("uses old price as price and current price as sale_price", () => {
    expect(buildFeedPrices(makeBuild({ oldPriceUah: 45000 }))).toEqual({
      price: "45000.00 UAH",
      salePrice: "40000.00 UAH",
    });
  });

  it("ignores old price that is not higher than the current one", () => {
    expect(buildFeedPrices(makeBuild({ oldPriceUah: 40000 })).salePrice).toBeNull();
  });
});

describe("images", () => {
  it("forces jpg and drops auto=format", () => {
    const url = new URL(toFeedImageUrl(IMG));
    expect(url.searchParams.get("fm")).toBe("jpg");
    expect(url.searchParams.has("auto")).toBe(false);
  });

  it("dedupes images and keeps the hero image first", () => {
    const build = makeBuild({
      galleryImages: [{ url: IMG }, { url: `${IMG}&x=1` }],
    });
    const urls = buildFeedImageUrls(build);
    expect(urls).toHaveLength(2);
    expect(urls[0]).toBe(toFeedImageUrl(IMG));
  });
});

describe("buildFeedDescription", () => {
  it("is built from spec and tagline, not from SEO text with a price", () => {
    const build = makeBuild({
      seo: { metaDescription: "Від 41 370 ₴" } as Build["seo"],
    });
    const description = buildFeedDescription(build);
    expect(description).not.toContain("41 370");
    expect(description).toContain(build.spec.cpu);
  });
});

describe("buildFeedItemXml", () => {
  it("renders all required Meta fields", () => {
    const xml = buildFeedItemXml(makeBuild(), BASE_URL) ?? "";
    for (const tag of [
      "g:id",
      "g:title",
      "g:description",
      "g:link",
      "g:image_link",
      "g:brand",
      "g:condition",
      "g:availability",
      "g:price",
    ]) {
      expect(xml).toContain(`<${tag}>`);
    }
    expect(xml).not.toContain("g:sale_price");
  });

  it("skips builds without an image or price", () => {
    expect(buildFeedItemXml(makeBuild({ heroImage: undefined }), BASE_URL)).toBeNull();
    expect(buildFeedItemXml(makeBuild({ priceUah: 0 }), BASE_URL)).toBeNull();
  });
});

describe("buildFeedXml", () => {
  it("includes only builds enabled for the feed", () => {
    const xml = buildFeedXml(
      [
        makeBuild({ sku: "KPC-ON" }),
        makeBuild({ sku: "KPC-OFF", showInFeed: false }),
        makeBuild({ sku: "KPC-ARCHIVED", status: "archived" }),
      ],
      BASE_URL,
    );
    expect(xml).toContain("<g:id>KPC-ON</g:id>");
    expect(xml).not.toContain("KPC-OFF");
    expect(xml).not.toContain("KPC-ARCHIVED");
    expect(xml.match(/<item>/g)).toHaveLength(1);
  });

  it("returns a valid empty channel when nothing is enabled", () => {
    const xml = buildFeedXml([makeBuild({ showInFeed: false })], BASE_URL);
    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
  });
});
