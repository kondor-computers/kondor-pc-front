import { NextRequest, NextResponse } from "next/server";

import { sendServerEvent } from "@/lib/analytics/server/events";
import { serverEventSchema } from "@/lib/validations/analyticsEvent";

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

  const parsed = serverEventSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const results = await sendServerEvent(parsed.data, {
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  // Результати відправки показуємо лише в dev, щоб було видно відповідь платформ
  return NextResponse.json(
    process.env.NODE_ENV === "production" ? { ok: true } : { ok: true, results },
  );
}
