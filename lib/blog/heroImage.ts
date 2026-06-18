import { contentImageUrl } from "@/lib/sanity/contentClient";
import type { SanityImage } from "@/types/blogPost";

/** Mobile LCP — capped for 4G; only this frame gets `priority`. */
export function blogHeroLcpUrl(image: SanityImage) {
  return contentImageUrl(image).width(720).quality(75).auto("format").url();
}

/** Desktop hero — lazy-loaded below `md`. */
export function blogHeroDesktopUrl(image: SanityImage) {
  return contentImageUrl(image).width(1440).quality(80).auto("format").url();
}
