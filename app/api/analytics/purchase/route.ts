import { NextRequest, NextResponse } from "next/server";

import { POST as postEvent } from "@/app/api/analytics/event/route";

/**
 * Застарілий шлях: сторінки, відкриті в браузері під час деплою, ще можуть
 * викликати його зі старим форматом (`orderNumber`). Перенаправляє на `/event`.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    orderNumber?: string;
  } | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const { orderNumber, ...rest } = body;
  const forwarded = new NextRequest(req.url.replace("/purchase", "/event"), {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({ ...rest, event: "purchase", eventId: orderNumber }),
  });
  return postEvent(forwarded);
}
