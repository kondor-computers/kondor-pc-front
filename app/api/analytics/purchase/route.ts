import { NextRequest, NextResponse } from "next/server";

import { sendServerPurchase } from "@/lib/analytics/server/purchase";
import { purchaseEventSchema } from "@/lib/validations/analyticsPurchase";

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

function clientIp(req: NextRequest): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined
  );
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = purchaseEventSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  await sendServerPurchase(parsed.data, {
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
