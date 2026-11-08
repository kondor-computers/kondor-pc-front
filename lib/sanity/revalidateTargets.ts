import { SITE_SEO_CONFIG, SITE_SEO_PAGE_IDS } from "@/lib/sanity/siteSeoConfig";

/**
 * Що саме скидати в кеші Next.js, коли в Sanity змінився документ.
 *
 * Це чисті функції (без `next/cache`), щоб їх можна було покрити тестами:
 * `app/api/revalidate/route.ts` лише викликає їх і виконує `revalidateTag` /
 * `revalidatePath`.
 *
 * ВАЖЛИВО 1 — TTL. ISR-TTL (`SANITY_REVALIDATE_SECONDS`) тепер 24 години, тож
 * сторінка, залежна від документа, якого тут немає, показуватиме застарілі
 * дані до доби. Додаючи в запити нові `->`-посилання на документи іншого типу,
 * додайте цей тип сюди й повісьте його тег на `fetch` запиту.
 *
 * ВАЖЛИВО 2 — що насправді працює. Перевірено на збірці (теги сторінок —
 * заголовок `x-next-cache-tags` у файлах `*.meta` в `.next/server/app`):
 *   - `revalidateTag(...)` скидає всі сторінки, чиї `fetch` мали цей тег;
 *   - `revalidatePath("/x/[slug]", "page")` (сегментний sweep) НЕ скидає
 *     нічого: `type: "page"` формує тег `_N_T_/x/[slug]/page`, а сторінки в
 *     route group `(main)` мають тег `_N_T_/(main)/x/[slug]/page`;
 *   - працюють лише конкретні шляхи (`/pk/vega`) і `revalidatePath("/", "layout")`.
 * Тому для НОВИХ типів нижче використано лише теги. Наявні сегментні шляхи
 * лишені як були (вони безпечні, просто нічого не роблять); теги покривають ті
 * самі сторінки.
 */

export type WebhookPayload = {
  _id?: string;
  _type?: string;
  slug?: string;
  pathPrefix?: "game-pc" | "promo";
  code?: string;
};

export type PathTarget = { path: string; type?: "page" | "layout" };

export function tagsForDocument(doc: WebhookPayload): string[] {
  const tags = new Set<string>();
  const { _id, _type, slug, pathPrefix, code } = doc;

  switch (_type) {
    case "item":
      tags.add("sanity:items");
      tags.add("sanity:addons");
      if (slug) tags.add(`sanity:item:${slug}`);
      break;
    case "badge":
      // `badge->{text, hex}` у запитах товарів: картки, деталі й addon-пул
      // (тобто сторінки каталогу, блок аксесуарів на збірках, /api/addons).
      tags.add("sanity:items");
      tags.add("sanity:addons");
      break;
    case "category":
      tags.add("sanity:categories");
      break;
    case "build":
    case "cpu":
    case "gpu":
    case "ram":
    case "buildAddon":
    case "buildBenefit":
      // cpu/gpu/ram/buildAddon/buildBenefit розгортаються (`->`) всередині
      // BUILDS_QUERY, тож живуть під тим самим тегом, що й `build`. Їх пише
      // скрипт синхронізації цін (kondor-pc-adm), а зв'язок «компонент →
      // збірка» вебхук не знає, тож скидаємо всі сторінки, що читають збірки.
      tags.add("sanity:pc:builds");
      break;
    case "game":
      tags.add("sanity:pc:games");
      break;
    case "page":
      tags.add("landings:all");
      tags.add("landings:previews");
      tags.add("landings:nav");
      if (pathPrefix) tags.add(`landings:${pathPrefix}`);
      if (pathPrefix && slug) tags.add(`landing:${pathPrefix}:${slug}`);
      break;
    case "tag":
      // `tags[]->` лише в LANDING_PAGE_BY_SLUG. Окремий тег (а не `landings:all`),
      // бо на `landings:all` висить ще й навігація в layout — це скинуло б
      // увесь сайт. Тег повішено на fetch у `fetchLandingPageBySlug`.
      tags.add("landings:tags");
      break;
    case "blogPost":
      tags.add("blog:posts");
      if (slug) tags.add(`blog:post:${slug}`);
      break;
    case "blogAuthor":
      // `author->` у запитах статей блогу (список і деталі).
      tags.add("blog:posts");
      break;
    case "blogPage":
      tags.add("blog:page");
      break;
    case "siteContacts":
      tags.add("sanity:siteContacts");
      break;
    case "paymentRequisites":
      tags.add("sanity:paymentRequisites");
      break;
    case "promoCode":
      tags.add("promo-codes");
      if (code) tags.add(`promo-code:${code.trim().toUpperCase()}`);
      break;
    case "homePcTasksSection":
      tags.add("sanity:homePcTasksSection");
      break;
    default:
      break;
  }

  // Site-wide SEO singletons are matched by `_id`, not `_type`.
  if (_id && (SITE_SEO_PAGE_IDS as readonly string[]).includes(_id)) {
    tags.add("site-seo");
    tags.add(`site-seo:${_id}`);
  }

  return [...tags];
}

/**
 * `revalidateTag` alone was observed to leave stale HTML behind on Vercel's
 * edge cache for statically-generated (`generateStaticParams`) routes — the
 * Sanity API itself was already fresh, but `/pk/[slug]` kept serving the old
 * value. `revalidatePath` purges the Full Route Cache directly for the given
 * path.
 *
 * IMPORTANT: passing the *route pattern* with `type: "page"` (e.g.
 * `"/pk/[slug]"`) was meant to bust **every** param of that dynamic route —
 * one webhook event then counts as N ISR writes (N = number of
 * builds/items/articles). Whenever the payload gives us the concrete `slug`, we
 * revalidate only that one concrete path instead; the segment-wide sweep is
 * kept solely as a fallback for the rare case where the slug is unknown (e.g.
 * delete events without a slug in the projection) or where a change genuinely
 * affects every page in the segment.
 *
 * (Див. «ВАЖЛИВО 2» вгорі файлу: такі сегментні шляхи для сторінок у `(main)`
 * зараз нічого не скидають — працюють теги й конкретні шляхи.)
 */
export function pathsForDocument(doc: WebhookPayload): PathTarget[] {
  const paths: PathTarget[] = [];
  const { _id, _type, slug, pathPrefix } = doc;

  switch (_type) {
    case "item":
      paths.push({ path: "/catalog", type: "page" });
      if (slug) {
        paths.push({ path: `/catalog/${slug}` });
      } else {
        paths.push({ path: "/catalog/[slug]", type: "page" });
      }
      break;
    case "category":
      paths.push({ path: "/catalog", type: "page" });
      break;
    case "build":
      paths.push({ path: "/", type: "page" });
      paths.push({ path: "/pk", type: "page" });
      paths.push({ path: "/api/feed/meta" });
      paths.push({ path: "/api/feed/google" });
      if (slug) {
        paths.push({ path: `/pk/${slug}` });
      } else {
        paths.push({ path: "/pk/[slug]", type: "page" });
      }
      break;
    case "game":
      // A game's FPS numbers can appear on any build's configurator table,
      // so this one genuinely needs the full sweep. Game edits should be
      // infrequent — if they aren't, revisit this.
      paths.push({ path: "/pk", type: "page" });
      paths.push({ path: "/pk/[slug]", type: "page" });
      paths.push({ path: "/pidbir", type: "page" });
      break;
    case "page":
      if (pathPrefix && slug) {
        paths.push({ path: `/${pathPrefix}/${slug}` });
      } else if (pathPrefix) {
        paths.push({ path: `/${pathPrefix}/[slug]`, type: "page" });
      }
      break;
    case "blogPost":
      paths.push({ path: "/blog", type: "page" });
      if (slug) {
        paths.push({ path: `/blog/${slug}` });
      } else {
        paths.push({ path: "/blog/[article]", type: "page" });
      }
      break;
    case "blogPage":
      paths.push({ path: "/blog", type: "page" });
      break;
    case "siteContacts":
      // Rendered in the footer on every page — bust the whole site.
      paths.push({ path: "/", type: "layout" });
      break;
    case "paymentRequisites":
      paths.push({ path: "/oformlennya", type: "page" });
      paths.push({ path: "/legal/pravova-informatsiya", type: "page" });
      break;
    case "promoCode":
      paths.push({ path: "/game-pc/[slug]", type: "page" });
      paths.push({ path: "/promo/[slug]", type: "page" });
      break;
    case "homePcTasksSection":
      paths.push({ path: "/", type: "page" });
      break;
    default:
      break;
  }

  if (_id && _id in SITE_SEO_CONFIG) {
    const config = SITE_SEO_CONFIG[_id as keyof typeof SITE_SEO_CONFIG];
    paths.push({ path: config.path, type: "page" });
  }

  // De-dupe (same path can be pushed by multiple branches).
  const seen = new Set<string>();
  return paths.filter(({ path, type }) => {
    const key = `${type ?? ""}:${path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
