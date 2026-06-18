import { NextRequest, NextResponse } from "next/server";

import { getMonopayToken, getSiteUrl } from "@/lib/monopay/server";
import type { MonopayInvoiceRequest } from "@/lib/monopay/types";

const MONOBANK_INVOICE_URL =
  "https://api.monobank.ua/api/merchant/invoice/create";

export async function POST(req: NextRequest) {
  try {
    const token = getMonopayToken();
    const { amount, orderNumber, basketOrder } =
      (await req.json()) as MonopayInvoiceRequest;

    if (!amount || amount < 1 || !orderNumber?.trim()) {
      return NextResponse.json(
        { error: "Невалідні параметри рахунку" },
        { status: 400 },
      );
    }

    const siteUrl = getSiteUrl();
    const invoicePayload = {
      amount,
      ccy: 980,
      merchantPaymInfo: {
        reference: orderNumber,
        basketOrder,
        destination: "Покупка в Kondor PC",
        comment: `Замовлення ${orderNumber}`,
      },
      redirectUrl: `${siteUrl}/oformlennya/uspikh?order=${encodeURIComponent(orderNumber)}&payment=monopay`,
      webHookUrl: `${siteUrl}/api/monopay/webhook`,
      validity: 3600,
      paymentType: "debit",
    };

    const response = await fetch(MONOBANK_INVOICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": token,
      },
      body: JSON.stringify(invoicePayload),
    });

    const data = await response.json();

    if (!response.ok || !data.pageUrl) {
      console.error("[monopay/invoice]", data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json({ pageUrl: data.pageUrl, invoiceId: data.invoiceId });
  } catch (error) {
    console.error("[monopay/invoice]", error);
    return NextResponse.json(
      { error: "Помилка при створенні рахунку" },
      { status: 500 },
    );
  }
}
