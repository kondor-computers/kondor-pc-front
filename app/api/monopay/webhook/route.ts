import { createVerify } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { markKeyCrmOrderAsPaid } from "@/lib/keycrm/server";
import { fetchMonopayPubKey } from "@/lib/monopay/server";
import { TG } from "@/lib/telegram/icons";

async function notifyTelegram(text: string) {
  const botId = process.env.TELEGRAM_BOT_ID;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botId || !chatId) return;

  await fetch(`https://api.telegram.org/bot${botId}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: "html",
      text,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-sign");

    if (!signature) {
      return new NextResponse("Missing X-Sign header", { status: 400 });
    }

    const pubkeyBase64 = await fetchMonopayPubKey();
    const verify = createVerify("SHA256");
    verify.write(rawBody);
    verify.end();

    const isValid = verify.verify(
      Buffer.from(pubkeyBase64, "base64"),
      Buffer.from(signature, "base64"),
    );

    if (!isValid) {
      return new NextResponse("Invalid signature", { status: 403 });
    }

    const data = JSON.parse(rawBody) as {
      status: string;
      reference?: string;
      finalAmount?: number;
      invoiceId?: string;
    };

    if (data.status === "success") {
      const orderNumber = data.reference ?? "—";
      const amountUah = (data.finalAmount ?? 0) / 100;

      if (data.reference) {
        try {
          await markKeyCrmOrderAsPaid(data.reference, amountUah);
        } catch (error) {
          console.error("[monopay/webhook][keycrm]", error);
        }
      }

      await notifyTelegram(
        `${TG.payment} <b>Оплата MonoPay успішна</b>\n` +
          `${TG.number} <b>Замовлення:</b> ${orderNumber}\n` +
          `${TG.total} <b>Сума:</b> ${amountUah.toLocaleString("uk-UA")} ₴\n` +
          (data.invoiceId
            ? `${TG.form} <b>Invoice:</b> ${data.invoiceId}\n`
            : ""),
      );
    }

    // Monobank expects 200 OK to stop retries
    return NextResponse.json({ ok: true, status: data.status });
  } catch (error) {
    console.error("[monopay/webhook]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
