import type { Build, BuildImage } from "@/types/build";

export const BUILD_IMAGE_FALLBACK_ALT = "ігровий ПК";
export const ASSEMBLY_VIDEO_POSTER_FALLBACK_ALT = "Відеозвіт ПК";
export const GAMEPLAY_VIDEO_POSTER_FALLBACK_ALT = "Реальні тести";

export function defaultBuildImageAlt(): string {
  return BUILD_IMAGE_FALLBACK_ALT;
}

export function resolveImageAlt(
  image: BuildImage | undefined,
  fallback: string,
): string {
  const alt = image?.alt?.trim();
  return alt || fallback;
}

export function resolveBuildGalleryImages(build: Build): BuildImage[] {
  if (build.galleryImages?.length) return build.galleryImages;
  if (build.heroImage) return [build.heroImage];
  return [];
}

export function resolveBuildHeroImage(build: Build): BuildImage | null {
  return resolveBuildGalleryImages(build)[0] ?? null;
}

export function buildImageUrl(
  image: BuildImage | undefined,
): string | undefined {
  return image?.url;
}
