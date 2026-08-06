import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
    ];
  },
};

export default nextConfig;
