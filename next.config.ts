import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    // Quality values passed via the `quality` prop must be allow-listed here.
    // Next.js 16 makes this required — an unlisted value falls back to 75,
    // which would silently soften the build/hero card photos again.
    qualities: [75, 80, 85, 90],
    // Custom loader routes ALL Sanity-hosted images (both `if6dzz62`
    // builds/blog/landings and `qmszlzqu` accessories catalog) straight to
    // Sanity's own CDN transform, bypassing Vercel's Image Optimization
    // quota that was causing 402 errors. Every other source (Steam,
    // Unsplash, local assets) falls back to the stock `/_next/image`
    // behavior inside the loader itself, so `remotePatterns` below still
    // applies to them.
    loader: "custom",
    loaderFile: "./lib/sanity/imageLoader.ts",
    remotePatterns: [
      // Steam CDN — game headers (free, stable, CDN-backed)
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "shared.fastly.steamstatic.com" },
      { protocol: "https", hostname: "cdn.akamai.steamstatic.com" },
      // Unsplash — placeholder chassis photography (replaced when client delivers PNGs)
      { protocol: "https", hostname: "images.unsplash.com" },
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
