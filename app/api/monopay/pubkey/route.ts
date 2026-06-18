import { NextResponse } from "next/server";

import { fetchMonopayPubKey } from "@/lib/monopay/server";

export async function GET() {
  try {
    const pubkey = await fetchMonopayPubKey();
    return NextResponse.json({ pubkey });
  } catch (error) {
    console.error("[monopay/pubkey]", error);
    return NextResponse.json(
      { error: "Не вдалося отримати публічний ключ" },
      { status: 500 },
    );
  }
}
