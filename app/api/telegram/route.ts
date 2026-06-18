import { NextRequest, NextResponse } from "next/server";

const BOT_ID = process.env.TELEGRAM_BOT_ID ?? "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (typeof data !== "string" || !data.trim()) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    if (!BOT_ID || !CHAT_ID) {
      return NextResponse.json(
        { error: "Telegram not configured" },
        { status: 500 },
      );
    }

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_ID}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          parse_mode: "html",
          text: data,
        }),
      },
    );

    if (!res.ok) {
      const fallback = await fetch(
        `https://api.telegram.org/bot${BOT_ID}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: stripHtml(data),
          }),
        },
      );

      if (!fallback.ok) {
        return NextResponse.json(
          { error: "Failed to send message" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ message: "Data sent successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
