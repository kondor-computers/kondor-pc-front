import type { NextConfig } from "next";

/**
 * Browser/CDN cache for assets that are NOT content-hashed: `app/favicon.ico`
 * and everything under `public/images`. Their defaults are `max-age=0`
 * (favicon: `must-revalidate`), so the browser re-requests every one of them
 * on every page view and each request counts as a Vercel CDN request. That
 * made `/favicon.ico` the #1 route by request count. `/_next/static/*` is
 * already `immutable`, so it needs nothing here.
 *
 * 30 days (+1 day of stale-while-revalidate) rather than `immutable` for a
 * year: these URLs are plain strings with no hash (99 `"/images/…"` references,
 * the favicon `<link>` has none). If you REPLACE one of these files under the
 * same name, returning visitors keep the old one for up to 30 days — rename the
 * file or append `?v=2` to its references instead. (`public/` has been
 * write-once since the first commit.)
 *
 * Deliberately not listed: `/fonts/*` (the Zenter font is bundled by
 * next/font under `/_next/static/media`), `/llms.txt` and other mutable files.
 */
const ASSET_CACHE_SECONDS = 60 * 60 * 24 * 30;
const ASSET_CACHE_CONTROL = `public, max-age=${ASSET_CACHE_SECONDS}, stale-while-revalidate=86400`;

const nextConfig: NextConfig = {
  images: {
    // Default is 60 s, so the browser re-validated every optimized image
    // (`/_next/image?url=/images/…`) a minute after loading it. The sources are
    // the same write-once `public/images` files (plus Steam CDN headers), so
    // the same 30 days apply. Only affects entries optimized from now on.
    minimumCacheTTL: ASSET_CACHE_SECONDS,
    formats: ["image/webp"],
    // Quality values passed via the `quality` prop must be allow-listed here.
    // Next.js 16 makes this required — an unlisted value falls back to 75,
    // which would silently soften the build/hero card photos again.
    qualities: [75, 80, 85, 90],
    // No global `images.loader` override: this project's Sanity/Unsplash
    // photography renders through `components/shared/SanityImage.tsx` (a
    // plain `<img>` hitting those CDNs' own on-the-fly resize APIs
    // directly), never through `next/image` at all — that's what used to
    // exceed Vercel's metered Image Optimization quota (402
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED). Every remaining
    // `next/image` usage is local/static assets, which keep using Next's
    // stock `/_next/image` (Vercel-optimized) pipeline as normal.
    remotePatterns: [
      // Steam CDN — game headers (free, stable, CDN-backed)
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "shared.fastly.steamstatic.com" },
      { protocol: "https", hostname: "cdn.akamai.steamstatic.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],
  },
  async redirects() {
    return [
      {
        source: "/dlya/:path*",
        destination: "/game-pc/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: "<https://cdn.sanity.io>; rel=preconnect; crossorigin",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: ASSET_CACHE_CONTROL }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: ASSET_CACHE_CONTROL }],
      },
    ];
  },
};

export default nextConfig;
