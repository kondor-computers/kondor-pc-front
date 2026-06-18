import type { Build } from "@/types/build";
import { SITE_URL } from "@/lib/seo/constants";

type VideoObjectFields = {
  name: string;
  description: string;
  uploadDate: string;
  thumbnailUrl: string;
  contentUrl: string;
};

function normalizeSiteUrl(): string {
  return SITE_URL.replace(/\/$/, "");
}

function normalizeUploadDate(value: string): string {
  const trimmed = value.trim();
  if (/([+-]\d{2}:\d{2}|Z)$/i.test(trimmed)) return trimmed;
  if (/T/.test(trimmed)) return `${trimmed}+03:00`;
  return `${trimmed}T00:00:00+03:00`;
}

function videoObjectJsonLd(fields: VideoObjectFields) {
  const siteUrl = normalizeSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: fields.name,
    description: fields.description,
    uploadDate: normalizeUploadDate(fields.uploadDate),
    thumbnailUrl: fields.thumbnailUrl,
    contentUrl: fields.contentUrl,
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

function buildVideoObject(
  fields: Partial<VideoObjectFields>,
): object | null {
  const { name, description, uploadDate, thumbnailUrl, contentUrl } = fields;

  if (
    !name?.trim() ||
    !description?.trim() ||
    !uploadDate?.trim() ||
    !thumbnailUrl?.trim() ||
    !contentUrl?.trim()
  ) {
    return null;
  }

  return videoObjectJsonLd({
    name: name.trim(),
    description: description.trim(),
    uploadDate: uploadDate.trim(),
    thumbnailUrl: thumbnailUrl.trim(),
    contentUrl: contentUrl.trim(),
  });
}

function gameplayVideoDescription(
  build: Build,
  gameLabels: Record<string, string>,
): string {
  const gameNames = Array.from(
    new Set(
      build.fps.map((entry) => gameLabels[entry.gameSlug] ?? entry.gameSlug),
    ),
  ).slice(0, 2);

  if (gameNames.length >= 2) {
    return `Реальні тести FPS на ПК ${build.name} у ${gameNames.join(", ")} та інших іграх`;
  }

  if (gameNames.length === 1) {
    return `Реальні тести FPS на ПК ${build.name} у ${gameNames[0]} та інших іграх`;
  }

  return `Реальні тести FPS на ПК ${build.name} у CS2, Warzone та інших іграх`;
}

export function pcBuildVideoObjectJsonLd(
  build: Build,
  options?: { gameLabels?: Record<string, string> },
): object[] {
  const gameLabels = options?.gameLabels ?? {};
  const schemas: object[] = [];

  const assemblyVideo = buildVideoObject({
    name: `Відеозвіт ПК ${build.name} - Kondor PC`,
    description: `Відеозвіт готового ПК ${build.name} перед відправкою`,
    uploadDate: build.assemblyVideoUploadDate,
    thumbnailUrl: build.assemblyVideoPosterUrl,
    contentUrl: build.assemblyVideoUrl,
  });
  if (assemblyVideo) schemas.push(assemblyVideo);

  const gameplayVideo = buildVideoObject({
    name: `Реальний геймплей на ${build.name} - тест FPS`,
    description: gameplayVideoDescription(build, gameLabels),
    uploadDate: build.gameplayVideoUploadDate,
    thumbnailUrl: build.gameplayVideoPosterUrl,
    contentUrl: build.gameplayVideoUrl,
  });
  if (gameplayVideo) schemas.push(gameplayVideo);

  return schemas;
}
