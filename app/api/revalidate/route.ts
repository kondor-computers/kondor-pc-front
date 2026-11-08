import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import {
  pathsForDocument,
  tagsForDocument,
  type WebhookPayload,
} from "@/lib/sanity/revalidateTargets";

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
 * Filter: не обмежуйте його за `_type` (достатньо відсікти чернетки й версії,
 * як у docs/product-feeds.md: `!(_id in path("drafts.**")) && !(_id in path("versions.**"))`).
 * Якщо все ж обмежуєте — він мусить включати ВСІ типи, що мапляться в
 * `lib/sanity/revalidateTargets.ts`, інакше сторінки з цих документів
 * оновлюватимуться лише по TTL (24 год): `build`, `cpu`, `gpu`, `ram`,
 * `buildAddon`, `buildBenefit`, `game`, `page`, `tag`, `blogPost`, `blogPage`,
 * `blogAuthor`, `siteContacts`, `paymentRequisites`, `promoCode`,
 * `homePcTasksSection`, `seo*` (проєкт `if6dzz62`) та `item`, `category`,
 * `badge` (проєкт `qmszlzqu`).
 *
 * `cpu`/`gpu`/`ram`/`buildAddon` пише скрипт синхронізації цін (workflow
 * `sync-price-sync` у kondor-pc-adm): вони не мають власних сторінок, але
 * розгортаються всередині запиту збірок, тож їхня зміна скидає сторінки збірок.
 *
 * This replaces short (60s) `revalidate` polling as the primary cache-busting
 * mechanism, so page-level `revalidate` (24h, see `lib/sanity/revalidate.ts`)
 * is only a safety net.
 */

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

  // Studio autosaves a draft on nearly every keystroke. If the Sanity
  // webhook filter isn't restricted to published documents, each of those
  // autosaves fires this endpoint and burns ISR Write Units for no reason —
  // guard against it here regardless of the dashboard filter configuration.
  if (payload._id?.startsWith("drafts.")) {
    return NextResponse.json({
      revalidated: false,
      message: "Skipped draft document",
    });
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
