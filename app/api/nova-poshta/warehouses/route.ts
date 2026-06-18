import { NextResponse } from "next/server";

import { getWarehouses } from "@/lib/nova-poshta/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityRef = searchParams.get("cityRef")?.trim() ?? "";

  if (!cityRef) {
    return NextResponse.json(
      { error: "cityRef is required" },
      { status: 400 },
    );
  }

  try {
    const warehouses = await getWarehouses(cityRef);
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("[nova-poshta/warehouses]", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити відділення" },
      { status: 502 },
    );
  }
}
