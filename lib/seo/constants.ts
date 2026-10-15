export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kondor-pc.ua";

/**
 * Fallback contacts for when Sanity `siteContacts` is unavailable.
 * The live values come from `getSiteContacts()` — keep these in sync with it.
 */
export const DEFAULT_PHONE = "+380633631066"; // E.164
export const DEFAULT_EMAIL = "info@kondorpc.com.ua";
export const DEFAULT_TELEGRAM_URL = "https://t.me/kondor_pc_admin";
export const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/kondor_pc";

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
