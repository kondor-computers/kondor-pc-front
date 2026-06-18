/**
 * Sanity → adapter contract normalization for landing pages.
 *
 * Goal: blocks stay unchanged. They consume the same shape they consumed
 * when data lived in mocks (`lib/data/mocks/*`). All Sanity-specific
 * transformations (Portable Text → ContentNode, image refs → URLs,
 * inline faqQuestion → `{question, answer, answerContent}`, field renames like
 * `body → content`, `stats → items`) happen here.
 */
import type {
  LandingPage,
  ResolvedPageContext,
  Section,
} from "@/lib/data/types";
import {
  contentClient,
  contentImageUrl,
} from "@/lib/sanity/contentClient";
import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/revalidate";
import {
  LANDING_PAGE_BY_SLUG,
  LANDING_SLUGS_BY_PREFIX,
  LANDING_NAV_BY_PREFIX,
  LANDING_PREVIEWS_BY_PREFIX,
} from "@/lib/sanity/landingQueries";
import type { SanityImage as BlogSanityImage } from "@/types/blogPost";
import {
  portableTextToContent,
  portableTextToPlain,
} from "@/lib/sanity/portableText";

type SanityImage = {
  asset?: {_ref?: string; _type?: string; url?: string};
  alt?: string;
  caption?: string;
  hotspot?: unknown;
  crop?: unknown;
};

function resolveImage(
  img: SanityImage | undefined,
  fallbackAlt = "",
): {src: string; alt: string; caption?: string} | undefined {
  if (!img || !img.asset?._ref) return undefined;
  const src = contentImageUrl(img).auto("format").fit("max").url();
  return {
    src,
    alt: img.alt || fallbackAlt,
    caption: img.caption || undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSection(s: any): Section {
  const base = {_key: s._key, _type: s._type, anchor: s.anchor};

  switch (s._type) {
    case "breadcrumbs":
      return {...base};

    case "anchorNav":
      return {...base, items: s.items ?? [], sticky: s.sticky};

    case "heroSimple":
      return {
        ...base,
        h1: s.h1,
        subtitle: s.subtitle,
        cta: s.cta,
        bgImage: resolveImage(s.bgImage, s.h1),
      };

    case "statsStrip":
      // Sanity field is `stats`, frontend block expects `items`.
      return {...base, items: s.stats ?? []};

    case "textBlock":
      return {
        ...base,
        heading: s.heading,
        subheading: s.subheading,
        maxWidth: s.maxWidth,
        content: portableTextToContent(s.body),
      };

    case "imageFull": {
      const image = resolveImage(s.image);
      return {
        ...base,
        image,
        caption: s.caption,
        aspectRatio: s.aspectRatio,
      };
    }

    case "imageTextSplit": {
      const image = resolveImage(s.image, s.heading);
      return {
        ...base,
        image,
        imagePosition: s.imagePosition,
        heading: s.heading,
        content: portableTextToContent(s.body),
        cta: s.cta,
      };
    }

    case "featureList":
      return {
        ...base,
        heading: s.heading,
        subheading: s.subheading,
        columns: s.columns,
        features: s.features ?? [],
      };

    case "mediaVideo":
      return {
        ...base,
        videoUrl: s.videoUrl,
        caption: s.caption,
        posterImage: resolveImage(s.posterImage, s.caption),
      };

    case "faqAccordion":
      return {
        ...base,
        heading: s.heading,
        items: (s.items ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((it: any) => it && it.question)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((it: any) => ({
            question: it.question,
            answer: portableTextToPlain(it.answer),
            answerContent: portableTextToContent(it.answer),
          })),
      };

    case "ctaPromoBanner":
      return {
        ...base,
        title: s.title,
        promoText: s.promoText,
        promoCode: s.promoCode?.code
          ? {
              code: s.promoCode.code,
              validFrom: s.promoCode.validFrom,
              validUntil: s.promoCode.validUntil,
              discountPc: s.promoCode.discountPc,
              discountAccessories: s.promoCode.discountAccessories,
            }
          : undefined,
        button: s.button,
      };

    default:
      // Unknown section — pass through raw. The BLOCKS registry will skip
      // it with a console.warn in dev.
      return {...base, ...s};
  }
}

export type LandingPathPrefix = "game-pc" | "promo";

export async function fetchLandingPageBySlug(
  slug: string,
  prefix: LandingPathPrefix,
): Promise<LandingPage | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = await contentClient.fetch(
    LANDING_PAGE_BY_SLUG,
    {slug, prefix},
    {
      next: {
        revalidate: SANITY_REVALIDATE_SECONDS,
        tags: [`landing:${prefix}:${slug}`, "landings:all"],
      },
    },
  );
  if (!raw) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: Section[] = (raw.sections ?? []).map((s: any) =>
    normalizeSection(s),
  );

  return {
    slug: raw.slug,
    type: prefix === "promo" ? "event" : "game",
    context: {refType: prefix === "promo" ? "event" : "game", refSlug: raw.slug},
    internalTitle: raw.internalTitle,
    seo: raw.seo ?? null,
    expiresAt: raw.expiresAt ?? undefined,
    sections,
  };
}

export async function fetchLandingSlugs(
  prefix: LandingPathPrefix,
): Promise<string[]> {
  const rows: Array<{slug: string; expiresAt?: string}> =
    await contentClient.fetch(
      LANDING_SLUGS_BY_PREFIX,
      {prefix},
      {
        next: {
          revalidate: SANITY_REVALIDATE_SECONDS,
          tags: ["landings:all", `landings:${prefix}`],
        },
      },
    );
  const now = Date.now();
  return rows
    .filter((r) => {
      if (!r.expiresAt) return true;
      return new Date(r.expiresAt).getTime() > now;
    })
    .map((r) => r.slug);
}

export type LandingPagePreview = {
  slug: string;
  title: string;
  description: string;
  image?: BlogSanityImage;
};

export type LandingNavItem = { href: string; label: string };

/** Card data for /game-pc or /promo landing grids. */
export async function fetchLandingPreviews(
  prefix: LandingPathPrefix = "game-pc",
): Promise<LandingPagePreview[]> {
  const rows: Array<LandingPagePreview & { expiresAt?: string }> =
    await contentClient.fetch(
      LANDING_PREVIEWS_BY_PREFIX,
      { prefix },
      {
        next: {
          revalidate: SANITY_REVALIDATE_SECONDS,
          tags: ["landings:all", `landings:${prefix}`, "landings:previews"],
        },
      },
    );

  const now = Date.now();
  return rows
    .filter((r) => {
      if (!r.slug || !r.title?.trim()) return false;
      if (!r.expiresAt) return true;
      return new Date(r.expiresAt).getTime() > now;
    })
    .map(({ slug, title, description, image }) => ({
      slug,
      title: title.trim(),
      description: description?.trim() ?? "",
      image,
    }));
}

/** Links for the «Підбірки» nav group — /game-pc/* pages from Sanity. */
export async function fetchLandingNavItems(
  prefix: LandingPathPrefix = "game-pc",
): Promise<LandingNavItem[]> {
  const rows: Array<{
    slug: string;
    label?: string;
    expiresAt?: string;
  }> = await contentClient.fetch(
    LANDING_NAV_BY_PREFIX,
    {prefix},
    {
      next: {
        revalidate: SANITY_REVALIDATE_SECONDS,
        tags: ["landings:all", `landings:${prefix}`, "landings:nav"],
      },
    },
  );

  const now = Date.now();
  return rows
    .filter((r) => {
      if (!r.slug) return false;
      if (!r.expiresAt) return true;
      return new Date(r.expiresAt).getTime() > now;
    })
    .map((r) => ({
      href: `/${prefix}/${r.slug}`,
      label: r.label?.trim() || r.slug,
    }));
}

/**
 * Page context resolution for Sanity-driven pages.
 *
 * In Sprint 1A the `page` schema doesn't have a `contextRef` field, so we
 * derive `displayName` from the slug. Blocks that need real game/event
 * context (HeroWithBuild, FpsTablePerGame, etc.) aren't used by Sanity-
 * driven pages today — they remain reserved for the mock-driven landings.
 */
export function buildSanityPageContext(
  prefix: LandingPathPrefix,
  slug: string,
): ResolvedPageContext {
  return {
    refType: prefix === "promo" ? "event" : "game",
    refSlug: slug,
    displayName: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  };
}
