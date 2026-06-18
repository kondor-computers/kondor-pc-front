import { NextRequest, NextResponse } from "next/server";

import { createKeyCrmOrder } from "@/lib/keycrm/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await createKeyCrmOrder(body);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[api/keycrm]", error);
    return NextResponse.json(
      { error: "Не вдалося створити замовлення в KeyCRM" },
      { status: 500 },
    );
  }
}
