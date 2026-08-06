import type { CSSProperties } from "react";
import { preload } from "react-dom";
import Image from "next/image";

/**
 * Renders Sanity/Unsplash CDN photography as a plain `<img>`, bypassing
 * Next's `/_next/image` pipeline entirely so these requests never touch
 * Vercel's (metered) Image Optimization — Sanity's and Unsplash's own CDNs
 * already resize/transcode via query params (`w`, `h`, `q`, `auto=format`),
 * so there is nothing left for Next/Vercel to add.
 *
 * Some callers pass a `src` that *isn't* actually Sanity/Unsplash — e.g. a
 * local fallback asset used when a Sanity document has no photo attached
 * (`DEFAULT_REVIEW_CARD_IMAGE` in `lib/sanity-pc/builds.ts`). For those, this
 * component falls back to the regular `next/image` `<Image>`, so local/static
 * assets always get Next/Vercel's optimization pipeline regardless of which
 * image component a caller happens to reach for — the CDN-vs-local decision
 * lives here, not in every call site.
 *
 * A responsive `srcSet` is built by hand for the CDN-transformable path —
 * multiple width variants, plus a proportional height for fixed-aspect crops
 * — so the browser's native `<img srcset/sizes>` negotiation still picks the
 * right resolution per device/viewport, the same job `next/image`'s loader
 * would otherwise do.
 */

const CDN_HOSTS = ["cdn.sanity.io", "images.unsplash.com"];

function isCdnTransformable(src: string): boolean {
  return CDN_HOSTS.some((host) => src.includes(host));
}

function readAspectRatio(src: string): number | null {
  try {
    const url = new URL(src);
    const w = Number(url.searchParams.get("w"));
    const h = Number(url.searchParams.get("h"));
    return w > 0 && h > 0 ? w / h : null;
  } catch {
    return null;
  }
}

function transformUrl(
  src: string,
  targetWidth: number,
  quality: number,
  aspect: number | null,
): string {
  try {
    const url = new URL(src);
    url.searchParams.set("w", String(Math.round(targetWidth)));
    if (aspect) {
      url.searchParams.set("h", String(Math.round(targetWidth / aspect)));
    } else {
      url.searchParams.delete("h");
    }
    if (!url.searchParams.has("fit")) {
      url.searchParams.set("fit", aspect ? "crop" : "max");
    }
    if (!url.searchParams.has("auto")) {
      url.searchParams.set("auto", "format");
    }
    url.searchParams.set("q", String(quality));
    return url.toString();
  } catch {
    return src;
  }
}

// Breakpoint ladder for `fill` images, whose rendered size is dictated by a
// responsive parent container rather than a single known pixel value —
// mirrors Next's own `deviceSizes` default, capped at 2560 since nothing on
// this site renders wider than that.
const FILL_WIDTHS = [420, 640, 768, 1024, 1280, 1536, 1920, 2560];

function fixedWidths(base: number): number[] {
  return Array.from(new Set([base, Math.round(base * 1.5), base * 2, base * 3]));
}

interface SanityImageProps {
  src: string;
  alt: string;
  /** Default 75, matches the `next/image` default. Not restricted to an allow-list — Sanity/Unsplash accept any integer 0-100 directly. */
  quality?: number;
  /** LCP images: preloads the exact srcset/sizes pair actually rendered, and requests eager/high-priority loading. */
  priority?: boolean;
  className?: string;
  /** Same meaning as `next/image`'s `sizes` — defaults to `100vw` when `fill` is set. */
  sizes?: string;
  /** Same meaning as `next/image`'s `fill` — absolutely positioned to cover the nearest positioned ancestor. */
  fill?: boolean;
  width?: number;
  height?: number;
  style?: CSSProperties;
}

export function SanityImage({
  src,
  alt,
  quality = 75,
  priority = false,
  className,
  sizes,
  fill = false,
  width,
  height,
  style,
}: SanityImageProps) {
  const transformable = isCdnTransformable(src);
  const effectiveSizes = sizes ?? (fill ? "100vw" : undefined);

  // Not a Sanity/Unsplash URL — a local/static asset slipped in through a
  // fallback (e.g. missing author photo). Hand it to `next/image` so it
  // still gets Next/Vercel's optimization pipeline instead of loading raw.
  if (!transformable) {
    return fill ? (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={effectiveSizes}
        quality={quality}
        priority={priority}
        className={className}
        style={style}
      />
    ) : (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={effectiveSizes}
        quality={quality}
        priority={priority}
        className={className}
        style={style}
      />
    );
  }

  const aspect = (width && height ? width / height : null) ?? readAspectRatio(src);
  // `sizes` means the rendered width is fluid/responsive (a `fill` image,
  // or an explicit-width image that still stretches with its container
  // via CSS) — the full breakpoint ladder lets the browser's srcset
  // negotiation pick the right one per viewport. No `sizes` means a truly
  // fixed pixel size (icon/avatar), where only DPR variants matter.
  const widths = effectiveSizes ? FILL_WIDTHS : width ? fixedWidths(width) : FILL_WIDTHS;
  const srcSet = widths
    .map((w) => `${transformUrl(src, w, quality, aspect)} ${w}w`)
    .join(", ");
  const displaySrc = transformUrl(src, width ?? widths[widths.length - 1], quality, aspect);

  if (priority) {
    preload(displaySrc, {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: srcSet,
      imageSizes: effectiveSizes,
    });
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional: bypasses Next's metered Image Optimization for CDN-hosted photography (see file header)
    <img
      src={displaySrc}
      srcSet={srcSet}
      sizes={effectiveSizes}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      className={className}
      style={
        fill
          ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
          : style
      }
    />
  );
}

export default SanityImage;
