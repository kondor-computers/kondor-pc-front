import { NextResponse } from "next/server";

import { searchSettlements } from "@/lib/nova-poshta/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limitRaw = Number.parseInt(searchParams.get("limit") ?? "10", 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(20, Math.max(1, limitRaw))
    : 10;

  if (q.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const cities = await searchSettlements(q, limit);
    return NextResponse.json(cities);
  } catch (error) {
    console.error("[nova-poshta/settlements]", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити міста" },
      { status: 502 },
    );
  }
}
