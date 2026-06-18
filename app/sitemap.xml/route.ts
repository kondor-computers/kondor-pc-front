import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { LEGAL_PAGES } from "@/lib/mock/legal-pages";
import { sanityPcClient } from "@/lib/sanity-pc/client";
import { sanityClient } from "@/lib/sanity/client";
import { contentClient } from "@/lib/sanity/contentClient";

type SitemapUrl = {
  loc: string;
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const DEFAULT_BASE_URL = "https://kondor-pc.ua";
const BUILD_SITEMAP_QUERY = `*[_type == "build" && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt
}`;
const CATALOG_SITEMAP_QUERY = `*[_type == "item" && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt
}`;
const BLOG_SITEMAP_QUERY = `*[_type == "blogPost" && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt
}`;
const LANDING_SITEMAP_QUERY = `*[_type == "page" && pathPrefix == $prefix && defined(slug.current)]{
  "slug": slug.current,
  "updatedAt": _updatedAt,
  expiresAt
}`;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

async function resolveBaseUrl(): Promise<string> {
  if (SITE_URL) return normalizeBaseUrl(SITE_URL);

  const headersList = await headers();
  const host = headersList.get("host") || headersList.get("x-forwarded-host");

  if (!host) return DEFAULT_BASE_URL;

  const protocol =
    headersList.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return `${protocol}://${host}`;
}

function toIsoDate(value?: string): string {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemapXml(baseUrl: string, urls: SitemapUrl[]): string {
  const entries = urls
    .map((url) => {
      const normalizedLoc = url.loc.startsWith("/") ? url.loc : `/${url.loc}`;

      return `  <url>
    <loc>${xmlEscape(`${baseUrl}${normalizedLoc}`)}</loc>
    <lastmod>${toIsoDate(url.lastmod)}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

export async function GET() {
  try {
    const baseUrl = normalizeBaseUrl(await resolveBaseUrl());
    const now = new Date().toISOString();

    const staticPages: SitemapUrl[] = [
      { loc: "/", lastmod: now, changefreq: "daily", priority: 1.0 },
      { loc: "/pk", lastmod: now, changefreq: "daily", priority: 0.9 },
      { loc: "/catalog", lastmod: now, changefreq: "daily", priority: 0.8 },
      { loc: "/pidbir", lastmod: now, changefreq: "weekly", priority: 0.9 },
      { loc: "/sborka", lastmod: now, changefreq: "monthly", priority: 0.7 },
      { loc: "/blog", lastmod: now, changefreq: "weekly", priority: 0.7 },
      { loc: "/garantiya", lastmod: now, changefreq: "monthly", priority: 0.6 },
      { loc: "/dostavka-oplata", lastmod: now, changefreq: "monthly", priority: 0.6 },
      { loc: "/kontakty", lastmod: now, changefreq: "monthly", priority: 0.5 },
    ];

    const [builds, gamePcPagesRaw, promoPagesRaw, catalogItems, blogPosts] =
      await Promise.all([
        sanityPcClient
          .fetch<Array<{ slug: string; updatedAt?: string }>>(BUILD_SITEMAP_QUERY)
          .catch(() => []),
        contentClient
          .fetch<Array<{ slug: string; updatedAt?: string; expiresAt?: string }>>(
            LANDING_SITEMAP_QUERY,
            { prefix: "game-pc" },
          )
          .catch(() => []),
        contentClient
          .fetch<Array<{ slug: string; updatedAt?: string; expiresAt?: string }>>(
            LANDING_SITEMAP_QUERY,
            { prefix: "promo" },
          )
          .catch(() => []),
        sanityClient
          .fetch<Array<{ slug: string; updatedAt?: string }>>(CATALOG_SITEMAP_QUERY)
          .catch(() => []),
        contentClient
          .fetch<Array<{ slug: string; updatedAt?: string }>>(BLOG_SITEMAP_QUERY)
          .catch(() => []),
      ]);

    const buildPages: SitemapUrl[] = builds.map((build) => ({
      loc: `/pk/${build.slug}`,
      lastmod: build.updatedAt ?? now,
      changefreq: "weekly",
      priority: 0.8,
    }));

    const isNotExpired = (expiresAt?: string): boolean => {
      if (!expiresAt) return true;
      const expiresAtMs = new Date(expiresAt).getTime();
      return Number.isFinite(expiresAtMs) && expiresAtMs > Date.now();
    };

    const gamePcPages: SitemapUrl[] = gamePcPagesRaw
      .filter((page) => isNotExpired(page.expiresAt))
      .map((page) => ({
        loc: `/game-pc/${page.slug}`,
        lastmod: page.updatedAt ?? now,
        changefreq: "weekly",
        priority: 0.7,
      }));

    const promoPages: SitemapUrl[] = promoPagesRaw
      .filter((page) => isNotExpired(page.expiresAt))
      .map((page) => ({
        loc: `/promo/${page.slug}`,
        lastmod: page.updatedAt ?? now,
        changefreq: "daily",
        priority: 0.6,
      }));

    const productPages: SitemapUrl[] = catalogItems
      .filter((item): item is { slug: string; updatedAt?: string } => Boolean(item.slug))
      .map((item) => ({
        loc: `/catalog/${item.slug}`,
        lastmod: item.updatedAt ?? now,
        changefreq: "weekly",
        priority: 0.6,
      }));

    const blogPostPages: SitemapUrl[] = blogPosts.map((post) => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updatedAt ?? now,
      changefreq: "monthly",
      priority: 0.6,
    }));

    const legalPages: SitemapUrl[] = LEGAL_PAGES.map((page) => ({
      loc: `/legal/${page.slug}`,
      lastmod: page.updatedAt,
      changefreq: "yearly",
      priority: 0.3,
    }));

    const xml = generateSitemapXml(baseUrl, [
      ...staticPages,
      ...buildPages,
      ...gamePcPages,
      ...promoPages,
      ...productPages,
      ...blogPostPages,
      ...legalPages,
    ]);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
