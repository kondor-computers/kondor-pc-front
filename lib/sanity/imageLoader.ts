import type { ImageLoaderProps } from "next/image";

/**
 * Bypasses Vercel's paid Image Optimization pipeline for images hosted in the
 * `if6dzz62` Sanity project (PC builds, blog, landings — the bulk of site
 * traffic). Sanity's own CDN already resizes/transcodes on the fly via query
 * params, so we build that URL directly instead of double-processing through
 * `/_next/image`, which was hitting Vercel's monthly optimization quota
 * (see 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED).
 *
 * Everything else (Steam CDN, Unsplash, the `qmszlzqu` accessories project,
 * local `/public` assets) falls back to Next's default `/_next/image` proxy,
 * unchanged from stock behavior.
 */
const SANITY_CONTENT_PROJECT_PATH = "/images/if6dzz62/";

export default function sanityAwareLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (src.includes("cdn.sanity.io") && src.includes(SANITY_CONTENT_PROJECT_PATH)) {
    const url = new URL(src);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("q", (quality ?? 75).toString());
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.toString();
  }

  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: (quality ?? 75).toString(),
  });
  return `/_next/image?${params.toString()}`;
}
