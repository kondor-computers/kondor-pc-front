/**
 * TTL Data Cache / ISR для запитів до Sanity (секунди).
 * У `page.tsx` / `route.ts` для `export const revalidate` потрібен літерал `60`
 * (Next.js не приймає імпортовану константу в segment config).
 */
export const SANITY_REVALIDATE_SECONDS = 60;
