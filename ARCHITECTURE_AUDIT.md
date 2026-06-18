# Kondor PC — Architecture Audit

Дата: 2026-05-27.
Скоп: `kondor-pc-frontend` (магазин) + `kondor-pc-admin` (Sanity Studio, ../kondor-pc-admin).
Мета: зафіксувати стан перед написанням ТЗ на конструктор посадкових сторінок на Sanity.

> Аудит — read-only. Жодних правок коду не вносилось.

---

## TL;DR (8 рядків)

1. **Стек**: Next.js 15.5 (App Router, Turbopack) · React 19 · Tailwind v4 · TypeScript 5 · npm. Хост — Vercel-сумісний (vercel.json відсутній, але стандартний `next build/start`).
2. **CMS-стан змішаний**: для **аксесуарів** (`/catalog`) фронт уже читає з Sanity-проекту `kondor-devices-admin` (projectId `qmszlzqu`). Для **ігрових ПК** (`/pk/*`) і ВСІХ лендингів — досі моки в `lib/mock/*.ts` і `lib/data/mocks/*.ts`. Sanity-схеми для ПК існують у `kondor-pc-admin` (projectId `pz334smw`), але **фронт у них не ходить** — мок-дані описують ту саму форму, що й схеми.
3. **Конструктор сторінок уже частково побудований на фронті** (`/dlya/[slug]` + `lib/data/adapter.ts` + `components/blocks/`): 17 блоків, реєстр `_type`→Component, sections[] моки для `cs2` та `montazh-4k`. Це *майже* Sanity Portable-Text-сумісна модель — її легко переселити в Sanity.
4. **Адмінка-Studio** (Sanity v4) описує тільки **продуктовий каталог**: `build`, `gpu`, `game` (+ object-типи). Жодних схем `page`/`section`/`block`/`useCase`/`review`/`faq`/`testimonial`. Конструктор сторінок треба будувати з нуля.
5. **Візард `/pidbir`** — client-side React Hook Form + Zustand-вільний (локальний `useState`). Передача параметрів — query string (`?games=cs2,warzone&budget=40-80&resolution=2k`). **Predfilled-параметри з лендингу — підтримуються без правок** через `?game=cs2`/`?ref=montazh-4k` (адаптер уже додає це до посилань).
6. **Сабміти замовлень — stub-логи** (`console.log("[order:stub]", …)`). Жодного `/api/orders`, KeyCRM/Telegram/Webhook. Все валідовано Zod, готове під server action.
7. **SEO**: статичні `app/sitemap.ts` (підтягує BUILDS + SEO_LANDINGS + LEGAL_PAGES), `app/robots.ts`, JSON-LD utility `lib/seo.tsx` (Organization, WebSite, BreadcrumbList, Product, FAQPage). i18n немає, лише `uk` хардкод.
8. **Найбільші ризики для Sanity-переходу**: (a) два паралельних типи `Build` — у фронт-моках і у Sanity-схемі — поки що **не зведено в один контракт**; (b) `includedFeatureKeys` і `faqKeys` — це **закриті whitelists у схемі + локальні тексти на фронті**, що ламається в редакторському сценарії; (c) старий `/[seoSlug]` (`pk-dlya-cs2`, `pk-dlya-warzone` тощо) бере дані з `lib/mock/seo-landings.ts` — він **дублює** новий `/dlya/[slug]` і їх потрібно зведувати.

**Що вже готово до переїзду**: `lib/data/adapter.ts` (єдина точка даних — це і є abstraction layer, який треба переписати на GROQ), 17 блоків з чистими props-контрактами, `BLOCKS`-реєстр, типи `Section` структурно ідентичні Sanity object-union.

**Повний звіт нижче.**

---

## 1. Стек і версії

### Frontend (`kondor-pc-frontend/package.json`)

| Категорія | Значення | Файл |
|---|---|---|
| Framework | Next.js `^15.5.15` (App Router) | `package.json:20` |
| Runtime | React `19.1.0`, Node без `engines` | `package.json:21-22` |
| Build | Turbopack: `next dev --turbopack` / `next build --turbopack` | `package.json:6-8` |
| TypeScript | `^5` (strict — див. `tsconfig.json`) | `package.json:41` |
| Tailwind | `^4` (v4) — без `tailwind.config.*`, конфіг через `@theme inline` у `app/globals.css:7-52` | `package.json:40` |
| Package mgr | **npm** (`package-lock.json` присутній, інших lock-файлів немає) | — |
| Sanity client | `@sanity/client ^7.21.0` + `@sanity/image-url ^2.1.1` | `package.json:14-15` |
| Forms | `react-hook-form ^7.72` + `@hookform/resolvers ^5.2` + `zod ^4.3` | `package.json:13, 24, 29` |
| State | `zustand ^5.0` (cart, корзина) | `package.json:30` |
| UI primitives | `@base-ui/react ^1.4` (shadcn-стиль) + `shadcn ^4.3` CLI + `class-variance-authority ^0.7` + `tailwind-merge ^3.5` + `clsx` | `package.json:12, 16, 17, 26` |
| Icons | `lucide-react ^1.8` (треба перевірити — звичайна версія ~0.4xx) | `package.json:19` |
| Animation | `framer-motion ^12.38` + `tw-animate-css ^1.4` | `package.json:18, 27` |
| Інше | `react-fast-marquee ^1.6` (marquee-стрічка), `yet-another-react-lightbox ^3.31` (галерея) | `package.json:23, 28` |

### Admin (`kondor-pc-admin/package.json`)

- **Sanity Studio v4** standalone (не вбудована в Next): `sanity ^4.15` + `@sanity/vision ^4.15` + `@sanity/color-input ^4.0.6`.
- React `^19.1`, TypeScript `^5.8`, **npm**.
- Деплой: `sanity deploy` → CDN на `*.sanity.studio`. `autoUpdates: true` у `sanity.cli.ts:13-15`.

### Хостинг
- `vercel.json` **відсутній** в обох репо. Vercel сам сприйме стандартний Next.js build.
- `next.config.ts:4-16` — `remotePatterns` дозволені для Steam CDN, Unsplash, **`cdn.sanity.io`**.
- ENV: жодного `.env*` файлу в репо. Дефолти захардкоджені (Sanity projectId fallback, BASE_URL fallback `https://kondor-pc.ua`).

✅ **Уже готово до переіспользування**: сучасний стек, Sanity client уже встановлений і налаштований під devices-проект → переключення на другий dataset/проект — це питання env-змінних.

⚠️ **Ризик для конструктора**: версія `lucide-react ^1.8` виглядає не як справжня версія пакета (у npm 0.x). Якщо це не якийсь форк — імовірний typo. Перевірити при `npm install`.

---

## 2. Структура проєкту

### Frontend tree (depth 3, без node_modules/.next)

```
kondor-pc-frontend/
├── app/                                  <-- App Router
│   ├── (checkout)/                       <-- route group: header/footer outside
│   │   ├── layout.tsx
│   │   └── oformlennya/                  <-- checkout
│   │       ├── CheckoutView.tsx          <-- client form (RHF + zod)
│   │       ├── page.tsx
│   │       └── uspikh/page.tsx           <-- success
│   ├── (main)/                           <-- route group: with header/footer
│   │   ├── [seoSlug]/page.tsx            <-- LEGACY: catch-all "/pk-dlya-*"
│   │   ├── catalog/                      <-- аксесуари (Sanity-driven)
│   │   ├── dlya/[slug]/page.tsx          <-- NEW page builder
│   │   ├── dostavka-oplata/page.tsx
│   │   ├── garantiya/page.tsx
│   │   ├── kontakty/page.tsx
│   │   ├── layout.tsx                    <-- Header + Footer
│   │   ├── legal/[slug]/page.tsx         <-- з lib/mock/legal-pages.ts
│   │   ├── page.tsx                      <-- HOME
│   │   ├── pidbir/                       <-- wizard
│   │   │   ├── SelectionForm.tsx
│   │   │   ├── page.tsx
│   │   │   └── rezultat/page.tsx
│   │   ├── pk/                           <-- ігрові ПК
│   │   │   ├── CatalogClient.tsx
│   │   │   ├── [slug]/page.tsx
│   │   │   └── page.tsx
│   │   └── sborka/                       <-- кастомна збірка
│   │       ├── CustomBuildForm.tsx
│   │       └── page.tsx
│   ├── api/addons/route.ts               <-- ONE API route: cross-sell аксесуари
│   ├── favicon.ico
│   ├── globals.css                       <-- TOKENS + utilities (923 рядки)
│   ├── layout.tsx                        <-- ROOT: fonts + CartDrawer + ScrollToTop
│   ├── robots.ts
│   ├── sitemap.ts
│   └── styleguide/page.tsx               <-- internal demo, disallowed in robots
│
├── components/
│   ├── blocks/                           <-- NEW page-builder blocks (17 шт)
│   │   ├── AnchorNav/
│   │   ├── Breadcrumbs/
│   │   ├── BuildCardSingle/
│   │   ├── BuildsRow/
│   │   ├── CtaWizardPrefilled/
│   │   ├── FaqAccordion/
│   │   ├── FeatureList/
│   │   ├── FpsTablePerGame/
│   │   ├── HeroWithBuild/
│   │   ├── ImageFull/
│   │   ├── ImageTextSplit/
│   │   ├── ProductRecommendedForGame/
│   │   ├── RichContent/                  <-- ContentNode renderer
│   │   ├── SocialTestimonialForGame/
│   │   ├── SpecsGraphicsSettings/
│   │   ├── SpecsSystemRequirements/
│   │   ├── StatsStrip/
│   │   ├── TextBlock/
│   │   └── index.ts                      <-- BLOCKS registry
│   ├── brand/                            <-- ChassisArt, GameTile, Wordmark
│   ├── cart/                             <-- Drawer, ListItem, CrossSell
│   ├── catalog/                          <-- AccessoriesRail, CatalogCard
│   ├── icons/                            <-- inline SVG (6 шт)
│   ├── layout/                           <-- Header, Footer, MobileMenu, CartButton
│   ├── shared/                           <-- спільні UI-блоки старої моделі
│   │   ├── BuildCard.tsx                 <-- картка ПК для home/seoSlug
│   │   ├── BuildHeroCard.tsx             <-- картка в hero-секції home
│   │   ├── FaqBlock.tsx                  <-- shadcn-Accordion (для seoSlug, /pk/[slug])
│   │   ├── FpsTable.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── SectionHeader.tsx             <-- kicker + title + subtitle
│   │   ├── TechButton.tsx                <-- основний CTA primitive
│   │   ├── BudgetChipLink.tsx
│   │   ├── ProductConfigurator.tsx       <-- single React Context
│   │   ├── … (24 файли загалом)
│   └── ui/                               <-- shadcn-style primitives (13 файлів)
│       └── accordion/button/card/checkbox/dialog/input/label/radio-group/select/separator/sheet/slider/badge
│
├── lib/
│   ├── cartStore.ts                      <-- Zustand persist (localStorage)
│   ├── catalog/group.ts
│   ├── data/                             <-- NEW: data for page builder
│   │   ├── adapter.ts                    <-- ⭐ SINGLE POINT OF DATA
│   │   ├── index.ts
│   │   ├── mocks/
│   │   │   ├── builds/{vega,nebula,orbitra,index}.ts
│   │   │   ├── games/cs2.ts
│   │   │   ├── pages/{cs2-landing,montazh-4k-landing}.ts
│   │   │   ├── testimonials/index.ts
│   │   │   └── useCases/{montazh-4k,index}.ts
│   │   └── types/{build,content,game,landingPage,testimonial,useCase,index}.ts
│   ├── format.ts
│   ├── fps-thresholds.ts                 <-- 144/60/30 tier mapping
│   ├── mock/                             <-- LEGACY mocks (used by /pk, /, /[seoSlug])
│   │   ├── builds.ts                     <-- 568 рядків, 8 SKU
│   │   ├── faqs.ts                       <-- 84 рядки, 10 FAQ
│   │   ├── games.ts                      <-- 124 рядки, 10 ігор зі Steam CDN
│   │   ├── included-features.ts
│   │   ├── legal-pages.ts                <-- 150 рядків
│   │   ├── np-cities.ts                  <-- Нова Пошта міста
│   │   ├── reviews.ts                    <-- 64 рядки, 6 reviews
│   │   ├── seo-landings.ts               <-- 269 рядків, 4 SEO лендинги
│   │   └── trust.ts                      <-- метрики
│   ├── pidbir.ts                         <-- wizard scoring + parse
│   ├── sanity/                           <-- ОНДЕ-проектний клієнт (devices)
│   │   ├── client.ts
│   │   ├── fetchers.ts
│   │   ├── image.ts
│   │   └── queries.ts                    <-- GROQ для аксесуарів
│   ├── seo.tsx                           <-- JSON-LD helpers
│   ├── sku-accents.ts                    <-- 8 SKU кольорів
│   ├── utils.ts                          <-- cn(twMerge+clsx)
│   └── validations/order.ts              <-- zod схема замовлення + custom-build
│
├── public/
│   ├── fonts/ZenterSPDemo.woff2          <-- localFont
│   └── images/                           <-- 60+ декоративних webp/svg для секцій
│       ├── delivery/, garantiya/, footer/, header/
│       ├── home/{faq,hero,how-it-works,reviews,top-rated,trust,use-cases}/
│       ├── pidbir/, pk/, sborka/
│
├── types/
│   ├── build.ts                          <-- LEGACY Build/Game/Review/Faq/TrustSignal (172 line)
│   └── catalog.ts                        <-- Sanity peripherals shapes
│
├── components.json                       <-- shadcn config
├── eslint.config.mjs
├── next.config.ts                        <-- remotePatterns: steam/unsplash/sanity
├── next-env.d.ts
├── package.json, package-lock.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

### Admin tree

Деталі — у звіті agent-аудита нижче (розділ "Аудит admin"). Коротко:
```
kondor-pc-admin/
├── sanity.cli.ts               <-- projectId pz334smw fallback
├── sanity.config.ts            <-- структура: structureTool + visionTool + colorInput
├── structure.ts                <-- 3 пункти меню: Ігрові ПК / GPU / Ігри
├── schemaTypes/
│   ├── index.ts                <-- 3 document + 5 object
│   ├── build.ts                <-- картка ПК (групи: basics/media/specs/performance/upgrades/content/seo)
│   ├── gpu.ts                  <-- одна GPU тримає FPS-таблицю, ПК на неї посилаються
│   ├── game.ts                 <-- довідник ігор
│   ├── gpuFpsRow.ts            <-- рядок FPS у GPU
│   ├── buildColor.ts           <-- варіант кольору
│   ├── buildComponent.ts       <-- компонент ПК
│   ├── configOption.ts         <-- апгрейд-опція
│   └── configOptionGroup.ts    <-- група опцій
├── scripts/seed-kondor-build.ts
└── .env.local                  <-- SANITY_AUTH_TOKEN=PASTE_TOKEN_HERE (placeholder)
```

✅ **Готово**: чітке розділення `(checkout)` vs `(main)` route groups; `components/blocks/` уже існує як окремий шар.

⚠️ **Ризик для конструктора**: дві окремі директорії моків (`lib/mock/` legacy + `lib/data/mocks/` new) + два окремих типи `Build` (`types/build.ts` зі `SkuSlug`, 8 полів проти `lib/data/types/build.ts` зі спрощеним shape) — їх треба зведувати під час Sanity-міграції, інакше будуть два паралельних світи назавжди.

---

## 3. Дані: як вони доїжджають до фронта

Цей розділ — найважливіший. Розпишу три потоки.

### 3.1 Ігрові ПК (`/pk/[slug]`, `/`, `/[seoSlug]`) — ПОВНІСТЮ МОКИ

**Джерело**: `lib/mock/builds.ts` (568 рядків, 8 SKU). Експорт:
```ts
// lib/mock/builds.ts
export const BUILDS: Build[] = [/* vega, hyper, nebula, orbitra, nyx, velar, pulsar, comet */];
export function buildBySlug(slug: SkuSlug): Build | undefined { … }
export function popularBuilds(slugs: SkuSlug[]): Build[] { … }
export function similarBuilds(b: Build, n: number): Build[] { … }
```

**Як фронт отримує**:
- `app/(main)/pk/[slug]/page.tsx:41-48` — прямий імпорт `BUILDS, buildBySlug, similarBuilds`. Без `fetch`, без GROQ.
- `app/(main)/page.tsx:9` — `popularBuilds(["vega", "nebula", "orbitra"])`.
- `app/(main)/[seoSlug]/page.tsx:8` — `BUILDS`-фільтр в `filterBuilds(landing)`.
- `app/sitemap.ts:2` — `BUILDS.map(b => /pk/${b.slug})`.

**Shape** (`types/build.ts:75-107`):
```ts
export interface Build {
  slug: SkuSlug;          // 'vega' | 'hyper' | 'nebula' | 'orbitra' | 'nyx' | 'velar' | 'pulsar' | 'comet'
  name: string;
  tier: BuildTier;        // 'starter' | 'base' | 'prime' | 'phantom' | 'pulsar'
  targetResolution: Resolution;  // 'fullhd' | '2k' | '4k'
  colorVariant: 'black' | 'white';
  shortTagline: string;
  priceUah: number;
  oldPriceUah?: number;
  status: BuildStatus;    // 'in_stock' | 'assemble_on_order' | 'out_of_stock' | 'archived'
  assemblyDays: number;
  spec: BuildSpecShort;
  components: BuildComponent[];   // повний перелік з warranty
  fps: BuildFpsEntry[];           // одразу всередині збірки
  powerConsumptionW?, noiseLevelDb?, upgradePathNotes?: …
  includedFeatureKeys: string[];  // whitelist від INCLUDED_ALL
  faqKeys: string[];              // ['b-gta6', 'b-monitor', …]
  heroImageUrl?: string;          // Unsplash placeholder
  galleryImageUrls?: string[];    // Unsplash placeholder pool
  assemblyVideoUrl?, assemblyVideoPosterUrl?: string;
  configurableOptions?: ConfigGroup[];  // RAM/SSD upgrade matrices
}
```

**Sanity-схема (`kondor-pc-admin/schemaTypes/build.ts`)** дзеркалить цей shape 1:1 — підтверджено коментарем `build.ts:5-8`: *"Field structure mirrors the existing frontend Build type so a 1:1 adapter can replace the current mock data file"*. Але **поки що мок-файл — не замінено**.

**FPS-дані**:
- Зараз: всередині `Build.fps[]` (масив `{gameSlug, resolution, fpsAvg, fpsMin?, settings?, verified?, notes?}`).
- У Sanity-схемі: FPS винесено в окремий document `gpu`, у якого є `fps: gpuFpsRow[]` (`gpu.ts:99-115`), а кожен `build.gpu` — це reference. Тобто **у Sanity FPS живуть на рівні GPU, не build**. Це інша модель.
- ⚠️ Це найбільший контрактний gap: фронт очікує `build.fps`, Sanity дає `build.gpu->fps`. Адаптер при міграції повинен інлайнувати GPU-FPS у відповідь, інакше доведеться переробляти `lib/pidbir.ts` (scoring) і `components/shared/BuildCard.tsx` (вивід FPS).

### 3.2 Аксесуари (`/catalog`, `/catalog/[slug]`) — ВЖЕ САНІТІ

**Джерело**: Sanity project `qmszlzqu` ("Kondor Devices") — окремий від `pz334smw`.

**Клієнт** (`lib/sanity/client.ts:9-15`):
```ts
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "qmszlzqu",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  perspective: "published",
});
```

**Fetchers** (`lib/sanity/fetchers.ts`):
- `getAllCategories()`, `getCatalogItems(categorySlugs)`, `getItemBySlug(slug)`, `getSimilarItems(slug, category)`, `getAddonItems()` — Server Components з `next: { revalidate, tags: ["sanity:items"] }`.
- Revalidate: 300с (listing), 600с (detail). Кеш-теги для майбутніх webhook-revalidate.

**GROQ** (`lib/sanity/queries.ts`):
- `ALL_CATEGORIES`, `CATALOG_ITEMS`, `ITEM_BY_SLUG`, `SIMILAR_ITEMS`, `ADDON_ITEMS`, `HOMEPAGE_ITEMS` — все на типі `item` зі своїми projections `LISTING_PROJECTION` / `DETAIL_PROJECTION`.

**Shape** (`types/catalog.ts`): окремий `CatalogProductListItem` / `CatalogProductDetail`. **Не змішаний** з `Build`.

**API-роут**: `app/api/addons/route.ts` — same-origin JSON-проксі, щоб уникнути CORS у клієнтського `CartCrossSell`.

✅ **Готово до переіспользування**: це **взірцевий приклад** того, як підключити фронт до іншого Sanity (`pz334smw`). Просто додати другий клієнт або параметризувати через ENV. Кеш-теги, revalidate, GROQ projections — все вже за патерном.

### 3.3 Лендинги (`/dlya/[slug]`) — МОКИ через адаптер

**Адаптер** (`lib/data/adapter.ts:1-115`) — ⭐ ключовий шар. Усі блоки/сторінки звертаються тільки сюди:
```ts
getGameBySlug(slug) · getUseCaseBySlug(slug) · getBuildBySlug(slug) · getAllBuilds()
getBuildsRecommendedForGame(gameSlug) · getTestimonialsByGameTag(tag, limit?)
getLandingPageBySlug(slug) · getAllLandingPageSlugs()
resolvePageContext(ref) → { refType, refSlug, game?, useCase?, displayName }
```

Поточна імплементація — словники з імпортів моків:
```ts
const PAGES_BY_SLUG: Record<string, LandingPage> = { cs2: cs2Landing, "montazh-4k": montazh4kLanding };
```

**Shape `LandingPage`** (`lib/data/types/landingPage.ts:1-30`):
```ts
export type Section = { _type: string; _key: string; [k: string]: unknown };
export type LandingPage = {
  slug: string;
  type: "game" | "event" | "use_case";
  context: { refType: "game" | "event" | "use_case"; refSlug: string };
  seo: { title: string; description: string; ogImage?: string };
  sections: Section[];
};
export type ResolvedPageContext = {
  refType, refSlug, game?, useCase?, displayName: string
};
```

`Section` структурно ідентичний Sanity object-array (`_key`, `_type`, довільні поля). Адаптер можна замінити одним файлом GROQ-запитів — самі блоки і page-rendering не зміняться.

✅ **Готово**: адаптер уже існує, типи `Section` уже PortableText-сумісні, реєстр `BLOCKS` уже працює.

⚠️ **Ризик**: тип `Build` в `lib/data/types/build.ts` (31 рядок, спрощений) **відрізняється** від `types/build.ts` (172 рядки, повний). У новій моделі немає `components[]`, `colorVariant`, `configurableOptions`, статусу — лише шортспек. Якщо `/dlya/[slug]` має показувати ту саму картку, що `/pk/[slug]`, ці типи треба зведувати в одну Sanity-схему.

---

## 4. CMS / джерело контенту

### 4.1 Sanity, який підключений ЗАРАЗ
- **Project**: `qmszlzqu` ("Kondor Devices") — окремий каталог аксесуарів. Адмінка-репо для нього в репозиторії **`kondor-devices-admin`** (за межами цієї сесії, не аудовано).
- Используется тільки фронт-клієнтом для `/catalog`.

### 4.2 Sanity, який існує паралельно
- **Project**: `pz334smw` ("Kondor PC — Admin") — каталог ігрових ПК.
- Адмінка-репо: `../kondor-pc-admin` (аудовано).
- Схеми: `build, gpu, game, gpuFpsRow, buildColor, buildComponent, configOption, configOptionGroup`.
- **Фронт у цей проект НЕ ходить.** Дані ПК — досі моки.

### 4.3 Чи є preview/draft mode?
- **Немає.** Grep по `draftMode|enableDraftMode|previewMode|presentationTool` — без матчів.
- Sanity-клієнт у `lib/sanity/client.ts:14` фіксує `perspective: "published"`.
- `presentationTool` не підключено у `sanity.config.ts:14`.

### 4.4 Live-оновлення / ISR
- Аксесуари: `next: { revalidate: 300 | 600, tags: ["sanity:items"] }` у `lib/sanity/fetchers.ts`. Webhook → `revalidateTag` **не налаштований** (немає `/api/revalidate` роута).
- ПК і лендинги: статика (`generateStaticParams` + `dynamicParams = false` у `/dlya/[slug]`), тобто оновлення лише при білді.

### 4.5 Інший CMS / база
- Немає. Всі не-Sanity дані — TS-моки в репо.
- Юридичні сторінки (`lib/mock/legal-pages.ts`) і SEO-лендинги (`lib/mock/seo-landings.ts`) написані як TS structured data, не markdown і не Sanity.

⚠️ **Ризик для конструктора**: відсутність `presentationTool` означає що редактор зараз не може робити live-preview правок у Studio. Якщо в новому ТЗ це треба — додавання вимагає підключення draft-mode на фронт + `<VisualEditing>` + перебудова `sanity-client` під `perspective: "previewDrafts"` для preview-роута.

✅ **Готово**: revalidate-tag pattern уже існує (`["sanity:items", "sanity:item:${slug}"]`) — можна продовжити цю конвенцію для лендингів.

---

## 5. Компонентна бібліотека

### 5.1 Дизайн-токени (`app/globals.css`)

**Все в одному файлі**, 923 рядки. Структура:
- `@theme inline` (рядки 7-52) — Tailwind v4 token mapping: `--color-background`, `--font-display`, `--radius-*`, FPS-тон-колірки.
- `:root` (рядки 58-123) — реальні значення:
  - `--brand-primary: #20deff` (cyan), `--background: #07090e`, `--surface: #0f1217`, `--muted-foreground: #8b939d`.
  - `--fps-green: #47e684`, `--fps-yellow: #fcca21`, `--fps-orange: #ff8928`, `--fps-red: #ff4b57`.
  - **8 per-SKU кольорів**: `--sku-vega/hyper/nebula/orbitra/nyx/velar/pulsar/comet`.
- `@layer base` (125-244) — body, scrollbar, atmospheric backgrounds (radial-gradient + grid).
- `@layer components` (246-263, 591-905) — `.container-site/-prose/-narrow`, `.tech-btn` (4 variants), `.budget-chip`, `.tech-field`, `.header-bar`.
- `@layer utilities` (276-584) — `.font-display`, `.clip-angular-{xs,sm,12,md,lg}`, `.card-frame-{sm,md,lg}`, `.build-hero-card`, `.sku-glow`, `.bg-grid`, `.card-spotlight`, `.animate-fps-pulse`, `.reveal-init/-show`.

**ZenterSP `@font-face`** із `unicode-range: U+0000-024F` (тільки латиниця, кирилиця падає в Unbounded) — `globals.css:269-274`.

### 5.2 Шрифти (`app/layout.tsx:8-26`)
- `next/font/google` Montserrat (300/400/500/600, latin+cyrillic) → `--font-body`
- `next/font/google` Unbounded (400-700, latin+cyrillic) → `--font-heading`
- `next/font/local` ZenterSPDemo.woff2 → `--font-display`

### 5.3 Іконки
- **`lucide-react`** (~46 використань у `components/shared/*`, `app/(main)/page.tsx:22-33`, тощо).
- **Inline SVG**: `components/icons/{ArrowIcon,ArrowInCircleIcon,CartIcon,CodeSiteIcon,MenuIcon,TagIcon}.tsx`. Декоративні SVG (`/public/images/**/shadows.svg`) як `<Image>`.
- В `components/blocks/FeatureList/index.tsx` — окремий `ICONS` реєстр з 8 inline SVG (`shield/truck/zap/tools/chart/cpu/headset/box`).

### 5.4 Семантичні класи vs hardcode
**Семантичні** (через токени) **домінують**: `text-foreground`, `text-muted-foreground`, `text-brand-primary`, `bg-surface`, `border-border`, `bg-background`, `text-fps-green/yellow/orange/red`. Лендингові блоки під новий дизайн — **повністю на токенах**.

**Hardcode** залишився де є:
- Атмосферні blob-и: `bg-[#00FFFE] blur-[110px]`, `bg-[#005996] blur-[220px]` (`app/(main)/page.tsx:139-141`, `components/blocks/HeroWithBuild/index.tsx:21-23`).
- Hex у `globals.css`: header-bar gradient `#183b42 → #09b5ff` (рядки 793), кардове кольорове змішування через `color-mix(in srgb, …)`.

### 5.5 Каталог переіспользуваних блоків

| Файл | Призначення | Де використовується |
|---|---|---|
| `components/blocks/Breadcrumbs/index.tsx` | breadcrumbs з `displayName` | `/dlya/[slug]` |
| `components/blocks/HeroWithBuild/index.tsx` | hero + BuildCardSingle | `/dlya/[slug]` |
| `components/blocks/AnchorNav/index.tsx` | sticky nav, `_type=anchorNav` | `/dlya/[slug]` |
| `components/blocks/BuildCardSingle/index.tsx` | картка ПК для блоків | `HeroWithBuild`, `BuildsRow`, `ProductRecommendedForGame` |
| `components/blocks/FpsTablePerGame/index.tsx` | таблиця FPS усіх ПК у грі | `/dlya/[slug]` |
| `components/blocks/SpecsSystemRequirements/index.tsx` | 3 колонки: мін/реком/competitive | `/dlya/cs2` |
| `components/blocks/SpecsGraphicsSettings/index.tsx` | пресети low/med/high/ultra | `/dlya/cs2` |
| `components/blocks/ProductRecommendedForGame/index.tsx` | 3 рекомендовані ПК під гру | `/dlya/[slug]` |
| `components/blocks/SocialTestimonialForGame/index.tsx` | відгуки з tag | `/dlya/cs2` |
| `components/blocks/CtaWizardPrefilled/index.tsx` | bg-brand-primary CTA → wizard | `/dlya/[slug]` |
| `components/blocks/FaqAccordion/index.tsx` | `<details>` + JSON-LD FAQPage | `/dlya/[slug]` |
| `components/blocks/StatsStrip/index.tsx` | 4 метрики | `/dlya/cs2` |
| `components/blocks/TextBlock/index.tsx` | rich SEO-текст | `/dlya/[slug]` |
| `components/blocks/ImageTextSplit/index.tsx` | 50/50 пара + опц. CTA | `/dlya/montazh-4k` |
| `components/blocks/ImageFull/index.tsx` | широка картинка | `/dlya/montazh-4k` |
| `components/blocks/FeatureList/index.tsx` | сітка фічей з 8 inline-SVG | `/dlya/[slug]` |
| `components/blocks/BuildsRow/index.tsx` | явний список ПК | `/dlya/montazh-4k` |
| `components/blocks/RichContent/index.tsx` | ContentNode-renderer (shared) | `TextBlock`, `ImageTextSplit` |

**Reused project primitives** (не блоки, а нативні):
- `components/shared/SectionHeader.tsx` — kicker+title+subtitle, використовується у 7 з 17 блоків.
- `components/shared/TechButton.tsx` — `<TechButton>` / `<TechButtonLink>` / `<TechButtonDisplay>` з 4 варіантами (primary/inverse/swap/white).
- `components/shared/BudgetChipLink.tsx` — клиповані chip-link'и.
- `components/shared/Reveal.tsx` — IntersectionObserver-based scroll reveal.

**Інші переіспользувані блоки старої моделі** (поки що не в `/blocks`):
- `components/shared/BuildCard.tsx` — головна картка ПК на `/`, `/pk`, `/[seoSlug]`.
- `components/shared/BuildHeroCard.tsx` — варіант для home hero.
- `components/shared/FpsTable.tsx` — таблиця FPS на `/pk/[slug]`.
- `components/shared/ReviewCard.tsx` — карта відгуку.
- `components/shared/ComponentList.tsx`, `BuildIdentityColumn.tsx`, `BuildAudience.tsx`, `BuildRepeatCta.tsx`, `IncludedFeaturesBlock.tsx`, `ProductGallery.tsx`, `PurchaseActions.tsx`, `StickyMobileBuyBar.tsx`, `UpgradeSuggestion.tsx`, `ContactManager.tsx` — деталі сторінки ПК.
- `components/shared/ProductConfigurator.tsx` — єдиний React Context на сайті, для конфігуратора апгрейдів.

### 5.6 UI-кит (shadcn-like)

`components/ui/` — 13 файлів (`accordion, badge, button, card, checkbox, dialog, input, label, radio-group, select, separator, sheet, slider`). На базі `@base-ui/react`. `components.json` — конфіг shadcn-CLI.

`components/ui/button.tsx`:
```ts
const buttonVariants = cva(
  "group/button clip-angular-sm inline-flex …",
  { variants: { variant: default|outline|secondary|ghost|destructive|link, size: default|xs|sm|lg|icon|icon-{xs,sm,lg} } }
)
```

✅ **Готово**: переіспользувані примітиви та токенізована система — конструктор сторінок успадковує все одразу.

⚠️ **Ризик**: дублювання — `components/blocks/FaqAccordion` (нова, `<details>`) vs `components/shared/FaqBlock` (стара, shadcn `Accordion` з `lib/mock/faqs`). Обидві в коді. Якщо ТЗ скаже "уніфікувати" — треба домовлятись, хто переможе.

---

## 6. Маршрутизація і сторінки

| Маршрут | Файл | Тип |
|---|---|---|
| `/` (home) | `app/(main)/page.tsx` | Server Component, моки з `lib/mock/builds`, `reviews`, `faqs` |
| `/pk` | `app/(main)/pk/page.tsx` + `CatalogClient.tsx` | Server + Client filter (моки) |
| `/pk/[slug]` | `app/(main)/pk/[slug]/page.tsx` (~600 рядків) | Server (`generateStaticParams` → BUILDS) |
| `/pidbir` | `app/(main)/pidbir/page.tsx` + `SelectionForm.tsx` | Server + Client wizard |
| `/pidbir/rezultat` | `app/(main)/pidbir/rezultat/page.tsx` | Server (читає searchParams) |
| `/sborka` | `app/(main)/sborka/page.tsx` + `CustomBuildForm.tsx` | Server + Client form |
| `/catalog` | `app/(main)/catalog/page.tsx` + `CatalogClient.tsx` | Server, **Sanity** (`getCatalogItems`) |
| `/catalog/[slug]` | `app/(main)/catalog/[slug]/page.tsx` | Server, **Sanity** (`getItemBySlug`) |
| `/dlya/[slug]` | `app/(main)/dlya/[slug]/page.tsx` | Server, `dynamicParams=false`, через адаптер |
| `/[seoSlug]` | `app/(main)/[seoSlug]/page.tsx` | **LEGACY** SEO-лендинги з `lib/mock/seo-landings.ts` |
| `/dostavka-oplata`, `/garantiya`, `/kontakty` | окремі сторінки | Static, з inline даними і декоративними webp |
| `/legal/[slug]` | `app/(main)/legal/[slug]/page.tsx` | Static, `lib/mock/legal-pages.ts` |
| `/oformlennya` | `app/(checkout)/oformlennya/page.tsx` + `CheckoutView.tsx` | Server + Client RHF+zod, **stub submit** |
| `/oformlennya/uspikh` | `app/(checkout)/oformlennya/uspikh/page.tsx` | Server (читає `?order=…&payment=…`) |
| `/styleguide` | `app/styleguide/page.tsx` | Server (disallowed in robots) |
| `/api/addons` | `app/api/addons/route.ts` | GET → JSON-проксі Sanity addons |

**Спостереження**:
- Єдиний API-роут — `/api/addons` (proxy для уникнення CORS).
- Жодних server actions.
- Жодних webhook-роутів (`/api/revalidate`, `/api/sanity-webhook`, тощо).

⚠️ **Ризик**: дублювання `/dlya/[slug]` (нова модель, через адаптер) і `/[seoSlug]` (legacy, з моків seo-landings). Обидва генерують типу SEO-лендинги під ігри. Перші конкретно називаються `cs2`, другі — `pk-dlya-cs2`. Це **дві паралельні URL-структури**. Якщо в ТЗ Sanity-конструктор повинен покривати **обидві** — треба вирішити, як уніфікувати URL і чи робити 301-редіректи зі старих.

---

## 7. Візард `/pidbir`

### 7.1 Стек

**`SelectionForm.tsx`** (`app/(main)/pidbir/SelectionForm.tsx:1-226`):
- "use client", `useState` local, без RHF (на відміну від checkout).
- Стани: `games: string[]` (max 3), `budget: string|null`, `resolution: string|null`, `other: string`, `otherOpen`, `showRefine`.
- Submit: `router.push('/pidbir/rezultat?games=…&budget=…&resolution=…&other=…')`.

### 7.2 Передача параметрів

**Query string**, не URL state і не Zustand:
```ts
// SelectionForm.tsx:48-56
const params = new URLSearchParams();
params.set("games", games.join(","));           // 'cs2,warzone'
if (budget) params.set("budget", budget);       // '40-80'
if (resolution) params.set("resolution", resolution);
if (other.trim()) params.set("other", other.trim());
router.push(`/pidbir/rezultat?${params.toString()}`);
```

### 7.3 Підтримка predfilled з лендингу

**Не підтримується** *читання* `?game=…` у формі (тільки запис на submit). Form ініціалізується порожньою.

Натомість блоки лендингу `HeroWithBuild` і `CtaWizardPrefilled` уже сипуть параметри:
```ts
// components/blocks/HeroWithBuild/index.tsx:51
href={`/pidbir?ref=${pageContext.refSlug}`}
// components/blocks/CtaWizardPrefilled/index.tsx:46
href={`/pidbir?ref=${pageContext.refSlug}`}
```

⚠️ **Ризик**: лендинги вже посилають `?ref=cs2` / `?ref=montazh-4k`, але `/pidbir` нічого з ними не робить. Дрібний фікс (~10 рядків): у `SelectionForm.tsx` зробити `useSearchParams()` і ініціалізувати state з нього. Якщо в ТЗ конструктор повинен робити "точкову конверсію з лендинга в підбір з заповненими полями" — це обов'язковий патч.

### 7.4 Результат сторінки `/pidbir/rezultat`

`app/(main)/pidbir/rezultat/page.tsx` + `lib/pidbir.ts`:
- Парсить `parseGames(searchParams.games)`, `parseBudget(searchParams.budget)`.
- Викликає `pickBuilds(criteria, limit)` — оцінює BUILDS-мок по скору `Σ fpsAvg(game@resolution)` у бюджеті, fallback ±20-40% бюджет, бейджі `cheapest|recommended|with-headroom`.
- Рендерить через `<BuildCard>`.

⚠️ **Ризик**: `lib/pidbir.ts:2` напряму імпортує `BUILDS` з `lib/mock/builds`. Коли ПК переїдуть до Sanity, цей файл потрібно перебудувати під `await getAllBuilds()` (через адаптер). Не критично, але треба пам'ятати.

### 7.5 Submit / куди йде форма

`/pidbir/rezultat` — **не submit-точка**, лише відображення. Реальний submit — `/sborka/CustomBuildForm.tsx` (custom build) та `/oformlennya/CheckoutView.tsx` (order). Обидва — **stub**:
```ts
// CheckoutView.tsx:117-130
async function onSubmit(values: OrderFormValues) {
  const orderNumber = `UA-${date}-${rand}`;
  console.log("[order:stub]", { orderNumber, ...values, items, totalUah });
  clear();
  router.push(`/oformlennya/uspikh?order=${orderNumber}&payment=${values.paymentMethod}`);
}
// CustomBuildForm.tsx:69-71
async function onSubmit(values: CustomBuildValues) {
  console.log("[custom-build:stub]", { orderNumber, ...values });
  …
}
```

Коментар в коді: *"Stub: real server action will create Sanity Order + notify KeyCRM/Telegram/Sheets"* (`CheckoutView.tsx:119`).

### 7.6 Анти-спам/капча
- **Немає.** Жодного hCaptcha / reCAPTCHA / Turnstile / honeypot.
- Zod-валідація — це **формальна валідація**, не анти-spam.

⚠️ **Ризик**: будь-яка форма (`/sborka`, `/oformlennya`, потенційний `/pidbir`-submit) потребує антиспаму перед production-launch.

---

## 8. SEO-інфраструктура

### 8.1 Metadata

- Root: `app/layout.tsx:28-41` — title template `%s · Kondor PC`, metadataBase, OG defaults.
- Per-page: `export const metadata` (static) або `generateMetadata` (dynamic). Стиль вдається.
- `/dlya/[slug]` (`app/(main)/dlya/[slug]/page.tsx:18-37`) — динамічний title/description/OG з `page.seo`.
- `/pk/[slug]` (~600 рядків) — динамічний title формату `${name} — ${cpu} + ${gpu}`.
- `/[seoSlug]` — динамічний з `seoLandingBySlug(slug)`, `alternates.canonical` хардкод на `kondor-pc.ua/${slug}`.

### 8.2 JSON-LD

`lib/seo.tsx` (107 рядків):
```ts
organizationJsonLd()      // адреса Київ, sameAs IG/TG/YT, phone/email placeholders
websiteJsonLd()
breadcrumbJsonLd(items)
productJsonLd(build)      // Product, Offer{priceCurrency: UAH, availability ↔ build.status}
faqPageJsonLd(items)
<JsonLd data={…} />       // ScriptTag renderer
```

Використання:
- `/` — Organization + WebSite + FAQPage (`app/(main)/page.tsx:100-105`).
- `/pk/[slug]` — Product + Breadcrumb + FAQPage.
- `/[seoSlug]` — FAQPage (inline JSON, не через helper).
- `/dlya/[slug]` — FAQPage inline у `FaqAccordion` (`components/blocks/FaqAccordion/index.tsx`).

⚠️ **Дублювання**: FAQ JSON-LD рендериться **і** через helper, **і** inline. Якщо у конструкторі редактор додасть FAQ-блок у Sanity, потрібно щоб JSON-LD генерувався в одному місці (краще на рівні page.tsx, а не у блоці).

### 8.3 sitemap.xml / robots.txt

- **`app/sitemap.ts`** (45 рядків) — статика з імпортів `BUILDS`, `SEO_LANDINGS`, `LEGAL_PAGES`. **`/dlya/*` сторінки в sitemap НЕ ВКЛЮЧЕНІ.**
- **`app/robots.ts`** (22 рядки) — `disallow: /api/, /oformlennya, /oformlennya/uspikh, /styleguide`.

⚠️ **Ризик для конструктора**: коли лендинги почнуть масово створюватись редактором, `sitemap.ts` повинен динамічно тягнути всі slugs з адаптера/Sanity, а не імпортувати мок-список.

### 8.4 Локалізація
- **Хардкод UA**. `<html lang="uk">` у `app/layout.tsx:50`, `locale: "uk_UA"` у OG-мета.
- `next-intl` / `next-i18next` — не встановлені.
- `hreflang` — немає.
- `game.ukrName` як окреме поле (`lib/mock/games.ts:13-20`) натякає на двомовність, але `name` (англ) і `ukrName` (укр) використовуються міксом, без перемикача мов.

### 8.5 Open Graph картинки
- `opengraph-image.tsx` / `twitter-image.tsx` — немає.
- `productJsonLd` посилається на `/og/pk-${slug}.png` (`lib/seo.tsx:59`), але **папки `/public/og` не існує** — це placeholder для майбутньої статики.
- `landingPage.seo.ogImage` — поле є в типі `lib/data/types/landingPage.ts:13`, але жоден мок його не заповнює.

⚠️ **Ризик**: коли Sanity почне віддавати OG-картинки (`heroImage`/`seoImage`), `generateMetadata` повинен підставляти CDN-URL через `@sanity/image-url` (вже встановлено).

---

## 9. Зображення і медіа

### 9.1 `next/image`
- Використовується всюди. `next.config.ts:4-16` — формати `image/webp`, `remotePatterns`:
  - `cdn.cloudflare.steamstatic.com`, `shared.fastly.steamstatic.com`, `cdn.akamai.steamstatic.com` (Steam game headers)
  - `images.unsplash.com` (placeholder chassis)
  - `cdn.sanity.io` (вже доданий)

### 9.2 Папка `/public/`
```
public/
├── fonts/ZenterSPDemo.woff2
└── images/
    ├── delivery/      (hero-shadows-mob.svg, pc-packaging.webp, pc.webp, right-decor-desk.webp, shadow-bottom-desk.svg)
    ├── footer/        (decor-desk.svg, decor-mob.svg)
    ├── garantiya/     (5 svg/webp)
    ├── header/        (cart.svg)
    ├── home/          (faq/, hero/, how-it-works/, reviews/, top-rated/, trust/, use-cases/) — 60+ файлів
    ├── pidbir/        (4 декоративних)
    ├── pk/            (shadows.svg)
    └── sborka/        (decor.webp, shadows.svg)
```
≈ 75 декоративних webp/svg для атмосфери секцій. **Жодних фото ПК** — для них placeholder Unsplash через `lib/mock/builds.ts:8-20`.

### 9.3 Sanity CDN
- `@sanity/image-url ^2.1.1` встановлено, утиліта вже є у `lib/sanity/image.ts` (не читав детально, але існує).
- `cdn.sanity.io` у `remotePatterns` — фронт готовий приймати картинки з обох Sanity-проектів.

### 9.4 Image-optimization pipeline
- Sharp — не у dependencies, але Vercel автоматично встановлює sharp в build. Локальний dev може мати warnings.

✅ **Готово**: Sanity CDN дозволений, `@sanity/image-url` встановлений, `next/image` сконфігурований під WebP.

---

## 10. State management і форми

### 10.1 Глобальний state
- **Zustand**: `lib/cartStore.ts` (197 рядків). `persist` middleware → localStorage.
  ```ts
  interface CartStore { items, isOpen, hydrated, add, remove, setQuantity, clear,
    openDrawer, closeDrawer, toggleDrawer, lineKey, count, totalUah }
  ```
- `lineKey` = `${slug}#${optionsSignature}#${colorCode}` — використовується як ключ для cart-item ідентичності.
- Cart підтримує два типи: `'build' | 'accessory'`.

### 10.2 React Context (єдиний)
- `components/shared/ProductConfigurator.tsx` — `ProductConfiguratorContext` для конфігуратора апгрейдів на `/pk/[slug]`. Кешує вибір RAM/SSD/etc., обчислює price delta. Не використовується поза цією сторінкою.

### 10.3 Форми
- **`react-hook-form` + `@hookform/resolvers/zod`** у `oformlennya/CheckoutView.tsx` і `sborka/CustomBuildForm.tsx`.
- `/pidbir/SelectionForm.tsx` — `useState`-based (без RHF).

### 10.4 Глобальні модалки/sidebar
- `app/layout.tsx:55` — `<CartDrawer />` рендериться на рівні root, стан з `useCartStore.isOpen`.
- `<ScrollToTopButton />` — також у root.
- `components/layout/MobileMenu.tsx` — full-screen overlay, локальний state в `Header.tsx:26-27`.

✅ **Готово**: cart pre-existing, переживе будь-яку Sanity-міграцію.

---

## 11. i18n / контент українською

### 11.1 Поточний стан
- **Усе хардкодом українською** в JSX та в моках.
- Жодних `messages.json`, `dictionary.ts`, `next-intl`, `next-i18next`, `@formatjs/intl`.

### 11.2 Натяки на двомовність
- `Game.ukrName?: string` (`types/build.ts:112`) — частина моків має українську назву, частина — лише англійську.
- `gameLabel(slug)` (`lib/mock/games.ts:99-102`) — повертає `ukrName ?? name`.

### 11.3 Якщо знадобиться RU/EN
- Потрібно: `next-intl` (App Router native), middleware для locale-detect, `[locale]`-сегмент у URL, перегенерація `sitemap`/`robots`.

⚠️ **Ризик**: якщо Sanity Studio для конструктора буде багатомовною, фронт потрібно одночасно обернути в `next-intl`. Це **окремий епік**, не змішувати з конструктором.

---

## 12. Аналітика і пікселі

**Нічого не підключено.**
- `grep -rn "GA_|gtag|GTM|fbq|posthog|amplitude|mixpanel|trackEvent"` — порожньо.
- У `<head>` через layout — жодних `<Script>` для аналітики.

⚠️ **Ризик**: усі CTA на лендингах (`Підібрати ПК`, `Купити`, відкриття wizard) **не трекаються**. До production-launch конструктора треба додати хоча б GTM/GA4 + хелпер `trackEvent` + обернути основні CTA-кліки.

---

## 13. Існуючі лендинги — анатомія

### 13.1 Новий конструктор (`/dlya/[slug]`)

**Сторінка** (`app/(main)/dlya/[slug]/page.tsx`, 77 рядків):
```tsx
export const dynamicParams = false;
export async function generateStaticParams() {
  const slugs = await getAllLandingPageSlugs();
  return slugs.map((slug) => ({ slug }));
}
export default async function DlyaLandingPage({ params }) {
  const page = await getLandingPageBySlug(slug);
  if (!page) notFound();
  const pageContext = await resolvePageContext(page.context);
  return page.sections.map((section) => {
    const Block = BLOCKS[section._type];
    const { _type, _key, anchor, ...rest } = section;
    const body = <Block {...rest} pageContext={pageContext} />;
    return anchor ? <section key={_key} id={anchor}>{body}</section> : <div key={_key}>{body}</div>;
  });
}
```

**Реєстр блоків** (`components/blocks/index.ts:21-40`):
```ts
export const BLOCKS: Record<string, ComponentType<any>> = {
  breadcrumbs, heroWithBuild, anchorNav, specsSystemRequirements, fpsTablePerGame,
  productRecommendedForGame, specsGraphicsSettings, socialTestimonialForGame,
  ctaWizardPrefilled, faqAccordion, buildCardSingle, statsStrip,
  // content blocks (universal):
  textBlock, imageTextSplit, imageFull, featureList, buildsRow,
};
```

**Sections мок** (`lib/data/mocks/pages/cs2-landing.ts`, 157 рядків):
```ts
export const cs2Landing: LandingPage = {
  slug: "cs2",
  type: "game",
  context: { refType: "game", refSlug: "cs2" },
  seo: { title: "…", description: "…" },
  sections: [
    { _key: "s1", _type: "breadcrumbs" },
    { _key: "s2", _type: "heroWithBuild", h1: "…", subtitle: "…", buildSlug: "vega" },
    { _key: "s2b", _type: "statsStrip" },
    { _key: "s3", _type: "anchorNav", items: [{label, anchor}, …] },
    { _key: "s4", _type: "specsSystemRequirements", anchor: "requirements" },
    { _key: "s5", _type: "fpsTablePerGame", anchor: "fps", resolutions: ["1080p","1440p","4K"] },
    { _key: "s5a", _type: "textBlock", maxWidth: "narrow", heading: "…", content: [ContentNode…] },
    { _key: "s6", _type: "productRecommendedForGame", anchor: "builds", heading: "…" },
    { _key: "s7", _type: "specsGraphicsSettings", anchor: "settings" },
    { _key: "s8", _type: "socialTestimonialForGame", anchor: "reviews", limit: 2 },
    { _key: "s8a", _type: "featureList", heading: "…", columns: 3, features: [{icon,title,text}…] },
    { _key: "s9", _type: "ctaWizardPrefilled", heading: "…", buttonText: "…" },
    { _key: "s10", _type: "faqAccordion", anchor: "faq", heading: "…", items: [{question,answer}…] },
  ],
};
```

**ContentNode-shape** (`lib/data/types/content.ts:1-41`):
```ts
export type InlineNode =
  | { type: "text"; text: string; bold?: boolean; italic?: boolean }
  | { type: "link"; text: string; href: string; external?: boolean };

export type ContentNode =
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "p"; children: InlineNode[] }
  | { type: "list"; ordered?: boolean; items: InlineNode[][] }
  | { type: "quote"; text: string; cite?: string };

export type ImageAsset = { src, alt, width?, height?, caption? };
export type FeatureItem = { icon, title, text };
```

**Цей формат структурно дуже близький до спрощеного Sanity Portable Text** (block `_type: 'block'` + style markers + children spans + marks). При міграції адаптер може робити `portableText → ContentNode[]` без втрати точності для блоків з RichContent.

✅ **Уже готово до Sanity**: цей шар — це **і є** скелет конструктора, який треба переселити до Sanity. Логіка реєстру блоків, page-rendering, adapter pattern — все готове.

### 13.2 Legacy конструктор (`/[seoSlug]`)

**Сторінка** (`app/(main)/[seoSlug]/page.tsx`, 237 рядків) — **hardcoded JSX** з 4 секціями (Hero, Builds grid, Body content, FAQ, Final CTA). Дані — `lib/mock/seo-landings.ts` (269 рядків, 4 лендинги: `pk-dlya-cs2`, `pk-dlya-warzone`, `pk-do-25000-grn`, `pk-dlya-strimu`).

`SeoLanding` shape (`lib/mock/seo-landings.ts:5-21`):
```ts
export interface SeoLanding {
  slug: string;                                            // 'pk-dlya-cs2'
  type: 'by_game' | 'by_budget' | 'by_task';
  title, metaDescription, h1, intro: string;
  body: Array<{ heading: string; paragraphs: string[]; list?: string[] }>;
  faqs: { question: string; answer: string }[];
  filter: { gameSlug?, budgetMaxUah?, resolution?, maxBuilds?, onlySlugs? };
}
```

**Старі URL** (`/pk-dlya-cs2`) **досі живі** і **досі в sitemap.ts** (рядки 29-33). Якщо вони мають SEO-вагу, не можна просто видаляти.

⚠️ **Ризик для конструктора**: дві системи конкурують за один тип контенту. Найімовірніший шлях:
1. Перенести `seo-landings` дані в Sanity як такі ж sections-based записи з новими slugs (наприклад `cs2`, `warzone`).
2. Старі URL `/pk-dlya-cs2` → 301-редірект на нові `/dlya/cs2`.
3. Видалити `/[seoSlug]` route і `lib/mock/seo-landings.ts`.

---

## 14. Що НЕ повинно ламатися при впровадженні Sanity

### 14.1 Критична воронка

| Що | Чому критично |
|---|---|
| `/` (home) | Точка входу. Зараз тягне моки `BUILDS`, `REVIEWS`, `FAQS`, `TRUST`. |
| `/pk` + `/pk/[slug]` | Каталог + сторінка ПК. Зараз — моки. Sanity-схема готова, фронт ні. |
| `/pidbir` + `/pidbir/rezultat` | Конверсійна точка. Залежить від `BUILDS` через `lib/pidbir.ts`. |
| Корзина (Zustand persist) | Перенесе будь-яку міграцію — самостійний шар з localStorage. |
| `/oformlennya` checkout | Залежить від `buildBySlug` (мок). При Sanity-переході — переключити на адаптер. |
| `/catalog` (Sanity devices) | Уже працює — не зачіпати. |

### 14.2 SEO-вага старих URL

**Поточні URL, які можуть бути проіндексовані**:
- `/pk-dlya-cs2`, `/pk-dlya-warzone`, `/pk-do-25000-grn`, `/pk-dlya-strimu` (через `/[seoSlug]`).
- `/pk/vega`, `/pk/nebula`, `/pk/orbitra`, `/pk/hyper`, `/pk/nyx`, `/pk/velar`, `/pk/pulsar`, `/pk/comet`.
- `/legal/publichna-oferta`, `/legal/polityka-konfidentsiynosti`, `/legal/rekvizyty`.
- `/garantiya`, `/dostavka-oplata`, `/kontakty`, `/sborka`, `/pidbir`.

⚠️ **Якщо ТЗ містить migration**: треба rewrite/redirect-карту для кожного `/pk-dlya-*` → `/dlya/*` URL.

### 14.3 КРМ-контракти (з адмінки)
- `buildColor.crmId` — KeyCRM SKU per color variant.
- `configOption.crmId` — KeyCRM order line item.
- Cart line key (`slug#options#colorCode`) **уже** включає `colorCode` і `options[]` — KeyCRM-сумісний.

✅ **Готово**: cart-shape і checkout-shape вже узгоджені з очікуваною формою Sanity-build.

---

## 15. Open questions — що уточнити перед написанням ТЗ

1. **Який Sanity-проект буде "конструктор"?**
   - В **`pz334smw`** (`kondor-pc-admin`, де вже є `build/gpu/game`) — додати документ `page` + section-types. Один проект, єдиний access-control.
   - Чи окремий **третій** Sanity-проект (`kondor-pc-content` тощо)?
   - У будь-якому разі — як трактується `kondor-devices-admin` (`qmszlzqu`)? Залишається назавжди окремим, чи в перспективі мерджиться?

2. **Сценарій preview/draft mode** — потрібен?
   - Якщо так → потрібно `presentationTool` у Studio, `enableDraftMode` API-роут на фронті, `<VisualEditing>` обгортка, окремий клієнт із `perspective: "previewDrafts"`.
   - Це **не тривіально** — додатковий епік.

3. **Live updates / webhook revalidate**
   - Зараз: статика з `revalidate: 300|600s` для аксесуарів, повна статика для ПК і лендингів.
   - Чи потрібен **миттєвий** apply редагувань (webhook → `/api/revalidate` → `revalidateTag`)?

4. **URL-стратегія**
   - Залишити `/dlya/[slug]` для нових лендингів, чи перейти на `/[slug]` плоско (як `/cs2`, `/montazh-4k`)?
   - Що робити з legacy `/pk-dlya-cs2` і `/[seoSlug]`-роутом — повний 301-redirect чи продовжувати підтримувати?
   - Чи будуть `/podii/*` (події) і `/dlya/*` мати один контент-тип `page` чи різні?

5. **FAQ / Reviews / Trust signals — у Sanity чи на фронті?**
   - Зараз: `lib/mock/faqs.ts`, `lib/mock/reviews.ts`, `lib/mock/trust.ts`. Якщо вони залишаються в коді — окей. Якщо переїжджають у Sanity — потрібні документи `faq`, `review`, `trustSignal`. Адмінка-схема їх не має взагалі.

6. **`includedFeatureKeys` whitelist**
   - У Sanity-схемі `build.includedFeatureKeys` — закритий список з 10 значень (`build.ts:317-334`). Якщо конструктор повинен дозволяти редактору **додавати нові фічі без коміту коду**, цю модель треба ламати: винести у окремий document `feature` з посиланнями.

7. **FPS-модель**
   - У мок-`Build` — `fps: BuildFpsEntry[]` напряму всередині.
   - У Sanity-схемі — `build.gpu->fps` (FPS живуть на GPU). Це **різні моделі**.
   - Як буде в кінцевому шарі? Ймовірно — адаптер інлайнує (фронт бачить плаский `fps[]` через GROQ-projection), але це треба зафіксувати.

8. **`Build` shape: один тип чи два?**
   - Зараз: `types/build.ts:75-107` (172 рядки, повний) ≠ `lib/data/types/build.ts:13-31` (31 рядок, спрощений).
   - При Sanity-міграції — мерджити в один?

9. **Який whitelist блоків у редакторі**?
   - Зараз: 17 блоків у `BLOCKS`-реєстрі. Чи всі переїздять до Sanity як object-types?
   - Чи буде разное обмеження «які блоки можна в `type: 'game'`» vs «які можна в `type: 'event'`»?

10. **Хто редагує**
    - Один маркетолог чи команда? Чи потрібні ролі (editor/admin/viewer)?
    - Чи потрібен `scheduledPublishing` плагін?

11. **Багатомовність** — `uk` only, чи перспектива `uk + ru/en`? Це впливає на схему (поля з locale-варіантами vs `documentInternationalization`).

12. **OG-картинки** — динамічна генерація (`opengraph-image.tsx`), чи редактор завантажує `seoImage` у Sanity для кожного лендинга?

13. **Аналітика** — GTM/GA4/Meta Pixel — частина проекту "конструктор" чи окремий епік?

14. **CRM-інтеграція** — `console.log("[order:stub]", …)` має стати справжнім server action → KeyCRM/Telegram. Частина цього ТЗ?

15. **Анти-спам** — Cloudflare Turnstile? hCaptcha? Honeypot? Перед публікацією конструктора форми /sborka і /oformlennya потребують захисту.

16. **Стан адмін-репо**: чому весь код Studio (`schemaTypes/`, `sanity.config.ts`, `structure.ts`) **не запушений у `kondor-pc-admin` origin/main**? Поточна версія — лише `Initial commit` із `.gitignore` + порожнім README. Локальний working tree містить повну імплементацію, але вона існує тільки на машині розробника. **Перед стартом ТЗ цей репо треба синхронізувати** з GitHub — інакше team членам нема куди стягнути актуальні схеми.

---

## Додаток: аудит адмінки (`kondor-pc-admin`)

> Викладено з agent-аудиту окремого підпроцесу. Скорочена версія — повний текст усередині сесії.

### Базова ідентифікація
- **Чистий Sanity Studio v4 (standalone репо)**. Не Next.js.
- `sanity ^4.15.0` + `@sanity/vision ^4.15.0` + `@sanity/color-input ^4.0.6`. React 19, TS 5.8, npm.
- Хостинг: `sanity deploy` → CDN `*.sanity.studio`. `autoUpdates: true`.

> ⚠️ **КРИТИЧНО**: на момент аудиту весь код адмінки **не запушений у GitHub**. У origin/main лише `Initial commit` з `.gitignore` + порожнім `README.md`. Усі схеми, `sanity.config.ts`, `structure.ts`, `scripts/seed-kondor-build.ts` лежать локально як **untracked**. Аудит проводився по локальному working tree.
>
> Перед стартом конструктора це треба зафіксувати: або (a) запушити поточне, щоб був точка істини; або (b) переконатися, що локальна копія справді актуальна — можливо хтось працював у іншій гілці / форку.

### Структура
```
kondor-pc-admin/
├── sanity.config.ts          (plugins: structureTool, visionTool, colorInput)
├── sanity.cli.ts             (projectId: pz334smw fallback, dataset: production)
├── structure.ts              (3 пункти меню)
├── schemaTypes/
│   ├── index.ts              (3 document + 5 object)
│   ├── build.ts              (картка ПК, 7 груп: basics/media/specs/performance/upgrades/content/seo)
│   ├── gpu.ts                (тримає FPS-таблицю)
│   ├── game.ts               (довідник)
│   ├── gpuFpsRow.ts
│   ├── buildColor.ts         (з @sanity/color-input!)
│   ├── buildComponent.ts
│   ├── configOption.ts
│   └── configOptionGroup.ts
└── scripts/seed-kondor-build.ts
```

### Документи
- **`build`**: SKU/slug/tier/price/status/components[]/colors[]/heroImage/gallery/gpu(reference)/configurableOptions/SEO. Дзеркало фронтового `types/build.ts`.
- **`gpu`**: name/brand/vram/tdp/fps(gpuFpsRow[])/enabled. **FPS живуть тут**, не на build.
- **`game`**: slug/name/ukrName/genre/cover.

### Object types
- `buildColor` (variant), `buildComponent` (line item), `configOption`, `configOptionGroup`, `gpuFpsRow`.

### Що **відсутнє** в адмінці
- Жодного `page`/`landing`/`section`/`block` документу.
- Жодного `review`/`testimonial`/`faq`/`useCase` документу.
- Жодного `type: 'array'` з `of: [{type: 'block'}]` (Portable Text).
- GROQ-запити — на фронті, не в адмін-репо.
- Webhook → revalidate на фронт — не сконфігуровано (або поза кодом).
- `presentationTool` + visual editing — не підключено.
- README порожнє (1 рядок).

### Готовність до конструктора
- ✅ **Reference-pattern** уже використовується.
- ✅ **Inline-object** з cross-field валідаціями — приклад для майбутніх section-types.
- ✅ **`@sanity/color-input`** уже у залежностях (для секцій з акцентом).
- ✅ **Image+alt** convention повторюється в кожному image-полі.
- ❌ **Жодного page/section/block** — потрібно будувати з нуля.

---

## Перевірочний чек-лист (по чек-листу ТЗ-запиту)

| Розділ | Стан |
|---|---|
| 2.1 Стек і версії | ✅ Зафіксовано |
| 2.2 Структура проєкту | ✅ Tree обох репо |
| 2.3 Дані: цепочка | ✅ Три потоки розписано |
| 2.4 CMS / джерела | ✅ Два Sanity-проекти + моки |
| 2.5 Компонентна бібліотека | ✅ 17 блоків + 13 ui + 24 shared |
| 2.6 Маршрутизація | ✅ 17 page.tsx + 1 API route |
| 2.7 Wizard `/pidbir` | ✅ Стек + параметри + ризики |
| 2.8 SEO | ✅ Metadata + JSON-LD + sitemap + robots |
| 2.9 Зображення | ✅ next/image + CDN config |
| 2.10 State / forms | ✅ Zustand + RHF + Zod |
| 2.11 i18n | ✅ Не підключено, лише `uk` |
| 2.12 Аналітика | ✅ Не підключено |
| 2.13 Лендинги анатомія | ✅ Нова (`/dlya`) + legacy (`/[seoSlug]`) |
| 2.14 Що не повинно ламатись | ✅ Воронка + SEO-URL + CRM-контракти |
| 2.15 Open questions | ✅ 15 запитань |
