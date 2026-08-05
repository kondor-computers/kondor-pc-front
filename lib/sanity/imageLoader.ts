import type { ImageLoaderProps } from "next/image";

/**
 * Bypasses Vercel's paid Image Optimization pipeline for any image hosted on
 * Sanity's CDN — both the `if6dzz62` content/builds/blog project and the
 * `qmszlzqu` accessories catalog project. Sanity's own CDN already
 * resizes/transcodes on the fly via query params, so we build that URL
 * directly instead of double-processing through `/_next/image`, which was
 * hitting Vercel's monthly optimization quota
 * (see 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED).
 *
 * Everything else (Steam CDN, Unsplash, local `/public` assets) falls back
 * to Next's default `/_next/image` proxy, unchanged from stock behavior.
 */
const SANITY_HOSTNAME = "cdn.sanity.io";

function defaultProxy(src: string, width: number, quality: number): string {
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString(),
  });
  return `/_next/image?${params.toString()}`;
}

export default function sanityAwareLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const q = quality ?? 75;

  if (!src.includes(SANITY_HOSTNAME)) {
    return defaultProxy(src, width, q);
  }

  const url = new URL(src);

  // Callers that already pinned an explicit `height` (square thumbs,
  // avatars, `fit=fill` OG images) rely on a fixed width:height pair —
  // swapping in Next's requested breakpoint width without adjusting height
  // would distort the crop. Leave those exactly as `urlFor()` built them.
  if (!url.searchParams.has("h")) {
    url.searchParams.set("w", width.toString());
  }
  if (!url.searchParams.has("fit")) {
    url.searchParams.set("fit", "max");
  }
  if (!url.searchParams.has("auto")) {
    url.searchParams.set("auto", "format");
  }
  url.searchParams.set("q", q.toString());

  return url.toString();
}
