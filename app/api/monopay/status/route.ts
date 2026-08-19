import { NextRequest, NextResponse } from "next/server";

import { getMonopayToken } from "@/lib/monopay/server";

const MONOBANK_STATUS_URL =
  "https://api.monobank.ua/api/merchant/invoice/status";

export async function GET(req: NextRequest) {
  try {
    const invoiceId = req.nextUrl.searchParams.get("invoiceId")?.trim();
    if (!invoiceId) {
      return NextResponse.json(
        { error: "Потрібен invoiceId" },
        { status: 400 },
      );
    }

    const token = getMonopayToken();
    const response = await fetch(
      `${MONOBANK_STATUS_URL}?invoiceId=${encodeURIComponent(invoiceId)}`,
      {
        headers: { "X-Token": token },
        cache: "no-store",
      },
    );

    const data = (await response.json()) as { status?: string };

    if (!response.ok) {
      console.error("[monopay/status]", data);
      return NextResponse.json(
        { error: "Не вдалося отримати статус рахунку" },
        { status: response.status },
      );
    }

    return NextResponse.json({ status: data.status ?? "unknown" });
  } catch (error) {
    console.error("[monopay/status]", error);
    return NextResponse.json(
      { error: "Помилка при перевірці статусу" },
      { status: 500 },
    );
  }
}
