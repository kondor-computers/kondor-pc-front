import { NextResponse } from "next/server";
import { headers } from "next/headers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const DEFAULT_BASE_URL = "https://kondor-pc.ua";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export async function GET() {
  const headersList = await headers();
  const host = headersList.get("host") || headersList.get("x-forwarded-host");

  let baseUrl = SITE_URL || "";

  if (!baseUrl) {
    if (host) {
      const protocol =
        headersList.get("x-forwarded-proto") ||
        (process.env.NODE_ENV === "production" ? "https" : "http");
      baseUrl = `${protocol}://${host}`;
    } else {
      baseUrl = DEFAULT_BASE_URL;
    }
  }

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const hostName = normalizedBaseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /oformlennya
Disallow: /oformlennya/uspikh
Disallow: /styleguide
Disallow: /_next/image

Host: ${hostName}
Sitemap: ${normalizedBaseUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
    },
  });
}
