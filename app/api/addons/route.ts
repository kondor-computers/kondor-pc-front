import { NextResponse } from "next/server";
import { getAddonItems } from "@/lib/sanity/fetchers";

/**
 * Same-origin JSON endpoint that returns the accessory cross-sell pool.
 * Uses the server-side Sanity client (which is not affected by browser CORS)
 * and is cached by the Next fetch layer via tags — see fetchers.ts.
 *
 * Consumers (CartCrossSell) call `/api/addons` instead of Sanity directly
 * to avoid CORS / CSP issues and to benefit from Next's cache.
 */
export const revalidate = 60;

export async function GET() {
  const items = await getAddonItems();
  return NextResponse.json(items);
}
