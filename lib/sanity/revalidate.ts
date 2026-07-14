/**
 * TTL Data Cache / ISR для запитів до Sanity (секунди) — резервний механізм.
 * Основна інвалідація тепер on-demand через Sanity webhook → `/api/revalidate`
 * → `revalidateTag`, тож цей TTL лише страхує на випадок збою webhook'а.
 * У `page.tsx` / `route.ts` для `export const revalidate` потрібен літерал
 * (Next.js не приймає імпортовану константу в segment config) — тримай його
 * синхронізованим з цим значенням вручну.
 */
export const SANITY_REVALIDATE_SECONDS = 3600;
