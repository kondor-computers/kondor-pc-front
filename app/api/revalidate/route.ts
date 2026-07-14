import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { SITE_SEO_CONFIG, SITE_SEO_PAGE_IDS } from "@/lib/sanity/siteSeoConfig";

/**
 * On-demand ISR invalidation triggered by Sanity webhooks (both projects:
 * `qmszlzqu` accessories catalog and `if6dzz62` kondor-pc-admin content).
 *
 * Configure a webhook per project in the Sanity dashboard:
 *   URL: https://<your-domain>/api/revalidate
 *   Secret: same value as SANITY_REVALIDATE_SECRET
 *   Trigger on: Create, Update, Delete
 *   Projection:
 *     { "_id": _id, "_type": _type, "slug": slug.current, "pathPrefix": pathPrefix, "code": code }
 *
 * This replaces short (60s) `revalidate` polling as the primary cache-busting
 * mechanism, so page-level `revalidate` can be safely raised.
 */

type WebhookPayload = {
  _id?: string;
  _type?: string;
  slug?: string;
  pathPrefix?: "game-pc" | "promo";
  code?: string;
};

function tagsForDocument(doc: WebhookPayload): string[] {
  const tags = new Set<string>();
  const { _id, _type, slug, pathPrefix, code } = doc;

  switch (_type) {
    case "item":
      tags.add("sanity:items");
      tags.add("sanity:addons");
      if (slug) tags.add(`sanity:item:${slug}`);
      break;
    case "category":
      tags.add("sanity:categories");
      break;
    case "build":
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
    case "blogPost":
      tags.add("blog:posts");
      if (slug) tags.add(`blog:post:${slug}`);
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

type PathTarget = { path: string; type?: "page" | "layout" };

/**
 * `revalidateTag` alone was observed to leave stale HTML behind on Vercel's
 * edge cache for statically-generated (`generateStaticParams`) routes — the
 * Sanity API itself was already fresh, but `/pk/[slug]` kept serving the old
 * value. `revalidatePath` purges the Full Route Cache directly for the given
 * path (or, with `type: "page"`, for *every* param of a dynamic route), so we
 * use it as the primary mechanism and keep tags as a secondary safety net.
 */
function pathsForDocument(doc: WebhookPayload): PathTarget[] {
  const paths: PathTarget[] = [];
  const { _id, _type, slug, pathPrefix } = doc;

  switch (_type) {
    case "item":
      paths.push({ path: "/catalog", type: "page" });
      paths.push({ path: "/catalog/[slug]", type: "page" });
      break;
    case "category":
      paths.push({ path: "/catalog", type: "page" });
      break;
    case "build":
      paths.push({ path: "/", type: "page" });
      paths.push({ path: "/pk", type: "page" });
      paths.push({ path: "/pk/[slug]", type: "page" });
      break;
    case "game":
      paths.push({ path: "/pk", type: "page" });
      paths.push({ path: "/pk/[slug]", type: "page" });
      paths.push({ path: "/pidbir", type: "page" });
      break;
    case "page":
      if (pathPrefix) paths.push({ path: `/${pathPrefix}/[slug]`, type: "page" });
      break;
    case "blogPost":
      paths.push({ path: "/blog", type: "page" });
      paths.push({ path: "/blog/[article]", type: "page" });
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

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("[api/revalidate] SANITY_REVALIDATE_SECRET is not set");
    return NextResponse.json(
      { revalidated: false, message: "Missing SANITY_REVALIDATE_SECRET" },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get(SIGNATURE_HEADER_NAME);

  if (!signature || !(await isValidSignature(rawBody, signature, secret))) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid signature" },
      { status: 401 },
    );
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json(
      { revalidated: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const tags = tagsForDocument(payload);
  const paths = pathsForDocument(payload);

  if (tags.length === 0 && paths.length === 0) {
    return NextResponse.json({
      revalidated: false,
      message: `No known cache tags/paths for _type "${payload._type ?? "unknown"}"`,
    });
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }
  for (const { path, type } of paths) {
    revalidatePath(path, type);
  }

  return NextResponse.json({
    revalidated: true,
    now: Date.now(),
    tags,
    paths,
    documentId: payload._id,
  });
}
