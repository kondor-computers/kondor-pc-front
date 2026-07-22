import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    // Quality values passed via the `quality` prop must be allow-listed here.
    // Next.js 16 makes this required — an unlisted value falls back to 75,
    // which would silently soften the build/hero card photos again.
    qualities: [75, 80, 85, 90],
    remotePatterns: [
      // Steam CDN — game headers (free, stable, CDN-backed)
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "shared.fastly.steamstatic.com" },
      { protocol: "https", hostname: "cdn.akamai.steamstatic.com" },
      // Unsplash — placeholder chassis photography (replaced when client delivers PNGs)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Sanity CDN — future
      { protocol: "https", hostname: "cdn.sanity.io" },
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
