import type { ImageLoaderProps } from "next/image";

/**
 * Bypasses Vercel's paid Image Optimization pipeline entirely.
 *
 * IMPORTANT: once `images.loader` is set to `"custom"`, Next.js's own
 * `/_next/image` endpoint stops serving requests (returns 404) — there is no
 * "fall back to the default proxy" option once a custom loader is
 * configured. So every source this loader sees has to be resolved to a URL
 * the browser can fetch directly, with no `/_next/image` hop anywhere.
 *
 * - `cdn.sanity.io` (both the `if6dzz62` content/builds/blog project and the
 *   `qmszlzqu` accessories catalog) — build the transform URL directly
 *   against Sanity's own CDN, which already resizes/transcodes on the fly.
 * - `images.unsplash.com` — same idea, Unsplash's Imgix-based CDN accepts
 *   the same `w`/`q`/`auto=format` params.
 * - Everything else (Steam CDN headers, local `/public` assets) — served
 *   as-is, unoptimized. Steam has no on-the-fly resize API anyway, and
 *   local assets are small/pre-optimized, so nothing is lost.
 */
function applyTransformParams(src: string, width: number, quality: number): string {
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
  url.searchParams.set("q", quality.toString());

  return url.toString();
}

export default function sanityAwareLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const q = quality ?? 75;

  if (src.includes("cdn.sanity.io") || src.includes("images.unsplash.com")) {
    return applyTransformParams(src, width, q);
  }

  return src;
}
