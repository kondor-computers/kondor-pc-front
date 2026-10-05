import type { Build } from "@/types/build";
import { SITE_URL } from "@/lib/seo/constants";

// Спільна логіка товарного фіда Meta (Facebook/Instagram Catalog).
// У фід йдуть лише збірки ПК (`build`); аксесуари з /catalog не включаються.

export const BRAND = "Kondor PC";
export const CURRENCY = "UAH";
export const PRODUCT_TYPE = "Ігрові ПК";
export const GOOGLE_PRODUCT_CATEGORY =
  "Electronics > Computers > Desktop Computers";

export type FeedPlatform = "meta" | "google";

interface FeedPlatformConfig {
  /** Шлях роуту фіда (для `atom:link`). */
  path: string;
  channelDescription: string;
  /** Максимум додаткових зображень на offer. */
  maxAdditionalImages: number;
  /** Додаткові поля `<item>`, специфічні для платформи. */
  extraFields: string[];
}

export const FEED_PLATFORMS: Record<FeedPlatform, FeedPlatformConfig> = {
  meta: {
    path: "/api/feed/meta",
    channelDescription: "Динамічний фід збірок Kondor PC для Meta/Facebook Catalog",
    // Meta дозволяє до 20 зображень: 1 основне + 19 додаткових.
    maxAdditionalImages: 19,
    extraFields: [],
  },
  google: {
    path: "/api/feed/google",
    channelDescription:
      "Динамічний фід збірок Kondor PC для Google Merchant Center",
    // Google Merchant Center дозволяє до 10 додаткових зображень.
    maxAdditionalImages: 10,
    // У Sanity немає GTIN/MPN: без цього тега Google відхиляє offer як такий,
    // що не має унікального ідентифікатора. Для товарів власного бренду без
    // штрихкода це допустима практика.
    extraFields: ["<g:identifier_exists>no</g:identifier_exists>"],
  },
};

export type FeedAvailability = "in stock" | "preorder" | "out of stock";

export function getFeedBaseUrl(): string {
  return SITE_URL.replace(/\/+$/, "");
}

// Мінімальне екранування спецсимволів для текстових вузлів XML.
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Збірка потрапляє у фід, якщо увімкнено перемикач і вона не в архіві. */
export function isFeedBuild(build: Build): boolean {
  return build.showInFeed === true && build.status !== "archived";
}

/**
 * `g:id` = SKU збірки (fallback — slug). Саме це значення має передаватись
 * у `content_ids` Meta Pixel, щоб події зв'язувались із каталогом.
 */
export function buildFeedId(build: Build): string {
  return build.sku?.trim() || build.slug;
}

export function buildFeedLink(build: Build, baseUrl = getFeedBaseUrl()): string {
  return `${baseUrl}/pk/${build.slug}`;
}

export function buildFeedAvailability(build: Build): FeedAvailability {
  switch (build.status) {
    case "in_stock":
      return "in stock";
    case "assemble_on_order":
      return "preorder";
    default:
      return "out of stock";
  }
}

export function buildFeedTitle(build: Build): string {
  return normalizeSpaces(build.name);
}

// Опис генерується зі `spec` і слогана, а не з `seo.metaDescription`: у SEO-тексті
// з адмінки часто вказана ціна («Від 41 370 ₴»), яка може розходитись із `priceUah`.
export function buildFeedDescription(build: Build): string {
  const { cpu, gpu, gpuVram, ram, ramSpeed, storage } = build.spec;
  const gpuLabel =
    gpuVram && !gpu.toLowerCase().includes(gpuVram.toLowerCase())
      ? `${gpu} ${gpuVram}`
      : gpu;
  const ramLabel = ramSpeed ? `${ram} ${ramSpeed}` : ram;

  return normalizeSpaces(
    [
      `Ігровий ПК ${build.name}: ${cpu}, ${gpuLabel}, ${ramLabel}, ${storage}.`,
      build.shortTagline,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

// Sanity CDN віддає зображення залежно від заголовка Accept (content
// negotiation), а Meta відхиляє WebP у фіді. Прибираємо `auto=format`
// (його додає `urlForPc(...).auto("format")`) і примусово ставимо `fm=jpg`.
export function toFeedImageUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("auto");
    u.searchParams.set("fm", "jpg");
    return u.toString();
  } catch {
    return url;
  }
}

/** Унікальні URL зображень: основне фото першим, далі галерея. */
export function buildFeedImageUrls(build: Build): string[] {
  const urls = [build.heroImage, ...(build.galleryImages ?? [])]
    .map((image) => image?.url)
    .filter((url): url is string => Boolean(url))
    .map(toFeedImageUrl);

  return [...new Set(urls)];
}

/** Ціна у форматі Meta: `34999.00 UAH`. */
export function formatFeedPrice(value: number): string {
  return `${value.toFixed(2)} ${CURRENCY}`;
}

/**
 * `sale_price` потрібен лише якщо є стара ціна, більша за поточну.
 * Тоді `price` = стара ціна, `sale_price` = поточна (`priceUah`).
 */
export function buildFeedPrices(build: Build): {
  price: string;
  salePrice: string | null;
} {
  const hasDiscount =
    typeof build.oldPriceUah === "number" && build.oldPriceUah > build.priceUah;

  return hasDiscount
    ? {
        price: formatFeedPrice(build.oldPriceUah as number),
        salePrice: formatFeedPrice(build.priceUah),
      }
    : { price: formatFeedPrice(build.priceUah), salePrice: null };
}

export function buildFeedItemXml(
  build: Build,
  baseUrl = getFeedBaseUrl(),
  platform: FeedPlatform = "meta",
): string | null {
  const config = FEED_PLATFORMS[platform];
  const [mainImage, ...restImages] = buildFeedImageUrls(build);

  // Без зображення або з нульовою ціною offer не пройде валідацію Meta/Google.
  if (!mainImage || !(build.priceUah > 0)) return null;

  const { price, salePrice } = buildFeedPrices(build);

  const fields: string[] = [
    `<g:id>${escapeXml(buildFeedId(build))}</g:id>`,
    `<g:title>${escapeXml(buildFeedTitle(build))}</g:title>`,
    `<g:description>${escapeXml(buildFeedDescription(build))}</g:description>`,
    `<g:link>${escapeXml(buildFeedLink(build, baseUrl))}</g:link>`,
    `<g:image_link>${escapeXml(mainImage)}</g:image_link>`,
    ...restImages
      .slice(0, config.maxAdditionalImages)
      .map(
        (url) => `<g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`,
      ),
    `<g:brand>${escapeXml(BRAND)}</g:brand>`,
    `<g:condition>new</g:condition>`,
    `<g:availability>${buildFeedAvailability(build)}</g:availability>`,
    `<g:price>${price}</g:price>`,
    ...(salePrice ? [`<g:sale_price>${salePrice}</g:sale_price>`] : []),
    `<g:product_type>${escapeXml(PRODUCT_TYPE)}</g:product_type>`,
    `<g:google_product_category>${escapeXml(GOOGLE_PRODUCT_CATEGORY)}</g:google_product_category>`,
    ...config.extraFields,
  ];

  return `<item>\n${fields.map((field) => `      ${field}`).join("\n")}\n    </item>`;
}

export function buildFeedXml(
  builds: Build[],
  baseUrl = getFeedBaseUrl(),
  platform: FeedPlatform = "meta",
): string {
  const config = FEED_PLATFORMS[platform];
  const feedUrl = `${baseUrl}${config.path}`;
  const items = builds
    .filter(isFeedBuild)
    .map((build) => buildFeedItemXml(build, baseUrl, platform))
    .filter((item): item is string => Boolean(item));

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kondor PC — товарний фід</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(config.channelDescription)}</description>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    ${items.join("\n    ")}
  </channel>
</rss>
`;
}
