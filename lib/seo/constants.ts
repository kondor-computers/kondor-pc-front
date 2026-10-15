export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kondor-pc.ua";

/**
 * Fallback phone (E.164) for when Sanity `siteContacts` is unavailable.
 * The live value comes from `getSiteContacts()` — keep this in sync with it.
 */
export const DEFAULT_PHONE = "+380633631066";

/** Host for UI copy (e.g. legal «на сайті example.com»). */
export function siteDisplayHost(url: string = SITE_URL): string {
  try {
    return new URL(url).host;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

/** Default share image — `app/opengraph-image.jpg` served by Next.js. */
export const DEFAULT_SOCIAL_IMAGE_URL = `${SITE_URL}/opengraph-image.jpg`;

/** Brand logo — `public/images/logo.png`. */
export const ORGANIZATION_LOGO_URL = `${SITE_URL.replace(/\/$/, "")}/images/logo.png`;
export const ORGANIZATION_LOGO_WIDTH = 270;
export const ORGANIZATION_LOGO_HEIGHT = 270;
