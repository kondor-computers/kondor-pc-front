import { NextResponse } from "next/server";

import { buildFeedXml } from "@/lib/feed";
import { getAllBuilds } from "@/lib/sanity-pc/builds";

// Той самий підхід до кешування, що й у /api/feed/meta: статична відповідь,
// що перегенеровується не частіше ніж раз на годину. Літерал має збігатися з
// SANITY_REVALIDATE_SECONDS (lib/sanity/revalidate.ts).
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  try {
    const builds = await getAllBuilds();
    const xml = buildFeedXml(builds, undefined, "google");

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Failed to generate Google Merchant product feed:", error);
    return NextResponse.json(
      { error: "Failed to generate Google Merchant product feed" },
      { status: 500 },
    );
  }
}
