import { NextResponse } from "next/server";

import {
  BRAND,
  GOOGLE_PRODUCT_CATEGORY,
  MAX_ADDITIONAL_IMAGES,
  PRODUCT_TYPE,
  buildFeedAvailability,
  buildFeedDescription,
  buildFeedId,
  buildFeedImageUrls,
  buildFeedLink,
  buildFeedPrices,
  buildFeedTitle,
  escapeXml,
  getFeedBaseUrl,
  isFeedBuild,
} from "@/lib/feed";
import { getAllBuilds } from "@/lib/sanity-pc/builds";
import type { Build } from "@/types/build";

// GET Route Handler'и в Next.js 15 за замовчуванням не кешуються — кожен
// запит бота Meta бив би напряму в Sanity. "force-static" вмикає ISR:
// відповідь генерується раз і перегенеровується не частіше ніж раз на годину.
// Літерал має збігатися з SANITY_REVALIDATE_SECONDS (lib/sanity/revalidate.ts).
export const dynamic = "force-static";
export const revalidate = 3600;

function buildItemXml(build: Build, baseUrl: string): string | null {
  const [mainImage, ...restImages] = buildFeedImageUrls(build);

  // Без зображення або з нульовою ціною offer не пройде валідацію Meta.
  if (!mainImage || !(build.priceUah > 0)) return null;

  const { price, salePrice } = buildFeedPrices(build);

  const fields: string[] = [
    `<g:id>${escapeXml(buildFeedId(build))}</g:id>`,
    `<g:title>${escapeXml(buildFeedTitle(build))}</g:title>`,
    `<g:description>${escapeXml(buildFeedDescription(build))}</g:description>`,
    `<g:link>${escapeXml(buildFeedLink(build, baseUrl))}</g:link>`,
    `<g:image_link>${escapeXml(mainImage)}</g:image_link>`,
    ...restImages
      .slice(0, MAX_ADDITIONAL_IMAGES)
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
  ];

  return `<item>\n${fields.map((field) => `      ${field}`).join("\n")}\n    </item>`;
}

function buildFeedXml(builds: Build[], baseUrl: string): string {
  const feedUrl = `${baseUrl}/api/feed/meta`;
  const items = builds
    .filter(isFeedBuild)
    .map((build) => buildItemXml(build, baseUrl))
    .filter((item): item is string => Boolean(item));

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kondor PC — товарний фід</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Динамічний фід збірок Kondor PC для Meta/Facebook Catalog</description>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    ${items.join("\n    ")}
  </channel>
</rss>
`;
}

export async function GET() {
  try {
    const builds = await getAllBuilds();
    const xml = buildFeedXml(builds, getFeedBaseUrl());

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Failed to generate Meta product feed:", error);
    return NextResponse.json(
      { error: "Failed to generate Meta product feed" },
      { status: 500 },
    );
  }
}
