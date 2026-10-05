import { NextResponse } from "next/server";

import { buildFeedXml } from "@/lib/feed";
import { getAllBuilds } from "@/lib/sanity-pc/builds";

// GET Route Handler'и в Next.js 15 за замовчуванням не кешуються — кожен
// запит бота Meta бив би напряму в Sanity. "force-static" вмикає ISR:
// відповідь генерується раз і перегенеровується не частіше ніж раз на годину.
// Літерал має збігатися з SANITY_REVALIDATE_SECONDS (lib/sanity/revalidate.ts).
// Достроково кеш скидається вебхуком Sanity — див. app/api/revalidate/route.ts.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  try {
    const builds = await getAllBuilds();

    return new NextResponse(buildFeedXml(builds), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Failed to generate Meta product feed:", error);
    return NextResponse.json(
      { error: "Failed to generate Meta product feed" },
      { status: 500 },
    );
  }
}
