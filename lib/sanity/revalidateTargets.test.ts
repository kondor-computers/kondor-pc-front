import { describe, expect, it } from "vitest";

import { SITE_SEO_CONFIG } from "@/lib/sanity/siteSeoConfig";
import {
  pathsForDocument,
  tagsForDocument,
  type PathTarget,
  type WebhookPayload,
} from "./revalidateTargets";

/** `page:/pk` — сегмент/сторінка за шаблоном; `path:/pk/vega` — конкретний шлях. */
function keys(paths: PathTarget[]): string[] {
  return paths.map((p) => `${p.type ?? "path"}:${p.path}`);
}

function paths(doc: WebhookPayload): string[] {
  return keys(pathsForDocument(doc));
}

describe("revalidateTargets: типи, що були раніше (поведінка не змінена)", () => {
  it("build зі slug скидає конкретну сторінку збірки, а не весь сегмент /pk/[slug]", () => {
    const doc = { _type: "build", slug: "vega" };
    expect(tagsForDocument(doc)).toEqual(["sanity:pc:builds"]);
    expect(paths(doc)).toEqual([
      "page:/",
      "page:/pk",
      "path:/api/feed/meta",
      "path:/api/feed/google",
      "path:/pk/vega",
    ]);
  });

  it("build без slug (delete без slug у projection) скидає весь сегмент /pk/[slug]", () => {
    expect(paths({ _type: "build" })).toContain("page:/pk/[slug]");
  });

  it("item зі slug скидає конкретну сторінку товару й /catalog", () => {
    const doc = { _type: "item", slug: "glass-pad-black" };
    expect(tagsForDocument(doc)).toEqual([
      "sanity:items",
      "sanity:addons",
      "sanity:item:glass-pad-black",
    ]);
    expect(paths(doc)).toEqual(["page:/catalog", "path:/catalog/glass-pad-black"]);
  });

  it("item без slug скидає весь сегмент /catalog/[slug]", () => {
    expect(paths({ _type: "item" })).toContain("page:/catalog/[slug]");
  });

  it("game, category", () => {
    expect(tagsForDocument({ _type: "game" })).toEqual(["sanity:pc:games"]);
    expect(paths({ _type: "game" })).toEqual([
      "page:/pk",
      "page:/pk/[slug]",
      "page:/pidbir",
    ]);
    expect(tagsForDocument({ _type: "category" })).toEqual(["sanity:categories"]);
    expect(paths({ _type: "category" })).toEqual(["page:/catalog"]);
  });

  it("page (лендинг) зі slug і pathPrefix скидає конкретний лендинг", () => {
    const doc = { _type: "page", slug: "cs2", pathPrefix: "game-pc" as const };
    expect(tagsForDocument(doc)).toEqual(
      expect.arrayContaining([
        "landings:all",
        "landings:game-pc",
        "landing:game-pc:cs2",
      ]),
    );
    expect(paths(doc)).toEqual(["path:/game-pc/cs2"]);
  });

  it("blogPost, blogPage, siteContacts, paymentRequisites, promoCode, homePcTasksSection", () => {
    expect(tagsForDocument({ _type: "blogPost", slug: "a" })).toEqual([
      "blog:posts",
      "blog:post:a",
    ]);
    expect(paths({ _type: "blogPost", slug: "a" })).toEqual([
      "page:/blog",
      "path:/blog/a",
    ]);
    expect(tagsForDocument({ _type: "blogPage" })).toEqual(["blog:page"]);
    expect(paths({ _type: "siteContacts" })).toEqual(["layout:/"]);
    expect(tagsForDocument({ _type: "paymentRequisites" })).toEqual([
      "sanity:paymentRequisites",
    ]);
    expect(tagsForDocument({ _type: "promoCode", code: " sale10 " })).toEqual([
      "promo-codes",
      "promo-code:SALE10",
    ]);
    expect(paths({ _type: "promoCode" })).toEqual([
      "page:/game-pc/[slug]",
      "page:/promo/[slug]",
    ]);
    expect(paths({ _type: "homePcTasksSection" })).toEqual(["page:/"]);
  });

  it("SEO-синглтон розпізнається за _id", () => {
    const doc = { _id: "seoPcCatalogPage", _type: "seoPcCatalogPage" };
    expect(tagsForDocument(doc)).toEqual(
      expect.arrayContaining(["site-seo", "site-seo:seoPcCatalogPage"]),
    );
    expect(paths(doc)).toEqual([`page:${SITE_SEO_CONFIG.seoPcCatalogPage.path}`]);
  });
});

describe("revalidateTargets: типи, яких раніше не було (прогалини покриття)", () => {
  const COMPONENT_TYPES = ["cpu", "gpu", "ram", "buildAddon", "buildBenefit"];

  it.each(COMPONENT_TYPES)(
    "%s скидає все, що читає збірки (тег sanity:pc:builds)",
    (_type) => {
      expect(tagsForDocument({ _id: `${_type}-1`, _type })).toEqual(["sanity:pc:builds"]);
    },
  );

  it("tag (довідник тегів лендингів) має власний тег, а не `landings:all` (він скинув би весь сайт)", () => {
    const tags = tagsForDocument({ _type: "tag" });
    expect(tags).toEqual(["landings:tags"]);
    expect(tags).not.toContain("landings:all");
    expect(tags).not.toContain("landings:nav");
  });

  it("blogAuthor скидає статті блогу", () => {
    expect(tagsForDocument({ _type: "blogAuthor" })).toEqual(["blog:posts"]);
  });

  it("badge скидає каталог, блок аксесуарів і /api/addons (теги items/addons)", () => {
    expect(tagsForDocument({ _type: "badge" })).toEqual(["sanity:items", "sanity:addons"]);
  });

  it("нові типи не додають сегментних шляхів (вони не збігаються з тегами сторінок у (main))", () => {
    for (const _type of [...COMPONENT_TYPES, "tag", "blogAuthor", "badge"]) {
      expect(pathsForDocument({ _type })).toEqual([]);
    }
  });
});

describe("revalidateTargets: загальні інваріанти", () => {
  const HANDLED_TYPES = [
    "item",
    "badge",
    "category",
    "build",
    "cpu",
    "gpu",
    "ram",
    "buildAddon",
    "buildBenefit",
    "game",
    "page",
    "tag",
    "blogPost",
    "blogAuthor",
    "blogPage",
    "siteContacts",
    "paymentRequisites",
    "promoCode",
    "homePcTasksSection",
  ];

  it.each(HANDLED_TYPES)("%s дає хоча б один тег або шлях", (_type) => {
    const doc = { _type, slug: "s", pathPrefix: "promo" as const, code: "c" };
    expect(tagsForDocument(doc).length + pathsForDocument(doc).length).toBeGreaterThan(0);
  });

  it.each(HANDLED_TYPES)("%s не дублює шляхи й теги", (_type) => {
    const doc = { _type, slug: "s", pathPrefix: "game-pc" as const };
    const p = paths(doc);
    expect(new Set(p).size).toBe(p.length);
    const t = tagsForDocument(doc);
    expect(new Set(t).size).toBe(t.length);
  });

  it("невідомий тип нічого не скидає", () => {
    expect(tagsForDocument({ _type: "review" })).toEqual([]);
    expect(pathsForDocument({ _type: "review" })).toEqual([]);
    expect(tagsForDocument({})).toEqual([]);
    expect(pathsForDocument({})).toEqual([]);
  });
});
