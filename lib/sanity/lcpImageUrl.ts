/**
 * Smaller, CDN-optimized Sanity URL for above-the-fold LCP frames (mobile 4G).
 *
 * - `auto=format` lets Sanity serve AVIF/WebP to supporting browsers (far
 *   fewer bytes than the source JPEG/PNG → faster LCP on slow connections).
 * - `fit=max` avoids upscaling.
 * - Width defaults to 800px: hero cards render at ~380 CSS px, so 800px covers
 *   ~2x DPR mobile without shipping a needlessly large frame.
 */
export function lcpImageUrl(src: string, width = 800): string {
  if (!src.includes("cdn.sanity.io")) return src;
  try {
    const u = new URL(src);
    u.searchParams.set("w", String(width));
    u.searchParams.set("q", "72");
    u.searchParams.set("fit", "max");
    u.searchParams.set("auto", "format");
    return u.toString();
  } catch {
    return src;
  }
}
