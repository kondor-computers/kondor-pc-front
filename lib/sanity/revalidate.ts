/**
 * Резервний TTL Data Cache / ISR для запитів до Sanity (секунди) — 24 години.
 *
 * Основна інвалідація — on-demand: Sanity webhook → `/api/revalidate`
 * (мапінг «тип документа → теги/шляхи» у `lib/sanity/revalidateTargets.ts`).
 * TTL лише страхує на випадок збою webhook'а та контенту, що змінюється без
 * події в Sanity (наприклад, `expiresAt` промо).
 *
 * Чому доба, а не година: кожна ревалідація сторінки — це запис в ISR
 * (Write Units). З годинним TTL увесь сайт (~89 сторінок, ~800 write units за
 * один прохід) перегенеровувався до 24 разів на добу й упирався в ліміт Hobby.
 *
 * У `page.tsx` / `route.ts` для `export const revalidate` потрібен літерал
 * (Next.js не приймає імпортовану константу в segment config), тому його
 * треба тримати синхронізованим з цим значенням вручну —
 * `lib/sanity/revalidate.test.ts` перевіряє, що всі літерали в `app/` збігаються.
 */
export const SANITY_REVALIDATE_SECONDS = 86400;
