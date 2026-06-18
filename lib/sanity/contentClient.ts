import { createClient } from "@sanity/client";
import createImageUrlBuilder, {
  type SanityImageSource,
} from "@sanity/image-url";

/**
 * Content Sanity client — project `if6dzz62` (kondor-pc-admin).
 * Stores: landing pages (`page`), tags, FAQ entries, plus the existing
 * `build` / `gpu` / `game` catalogue.
 *
 * Separate from `./client` which targets `qmszlzqu` (legacy accessories
 * catalogue). Both clients coexist while we migrate; eventually accessories
 * will move into this project too.
 */
export const contentClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_CONTENT_PROJECT_ID || "if6dzz62",
  dataset: process.env.NEXT_PUBLIC_SANITY_CONTENT_DATASET || "production",
  apiVersion:
    process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-01",
  useCdn: true,
  perspective: "published",
});

const builder = createImageUrlBuilder({
  projectId: contentClient.config().projectId!,
  dataset: contentClient.config().dataset!,
});

/** Build a CDN URL for a Sanity image asset (works with refs and resolved images). */
export function contentImageUrl(source: SanityImageSource) {
  return builder.image(source);
}
