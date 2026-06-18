import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { sanityPcClient } from "./client";

const builder = createImageUrlBuilder(sanityPcClient);

export function urlForPc(source: SanityImageSource) {
  return builder.image(source);
}

