import type { PurchaseEventInput } from "@/lib/validations/analyticsPurchase";

import { hashPhoneForTikTok } from "./hash";
import {
  REQUEST_TIMEOUT_MS,
  type RequestContext,
  type SendResult,
  type UserDataMode,
} from "./types";

const TIKTOK_EVENTS_URL =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";

export function buildTikTokPurchaseEvent(
  input: PurchaseEventInput,
  ctx: RequestContext,
  mode: UserDataMode,
  nowMs: number = Date.now(),
) {
  const { tracking } = input;
  const phoneHash =
    mode === "phone" && input.phone
      ? hashPhoneForTikTok(input.phone)
      : undefined;

  const user: Record<string, unknown> = {};
  if (ctx.ip) user.ip = ctx.ip;
  if (ctx.userAgent) user.user_agent = ctx.userAgent;
  if (tracking.ttp) user.ttp = tracking.ttp;
  if (tracking.ttclid) user.ttclid = tracking.ttclid;
  if (phoneHash) user.phone = phoneHash;

  return {
    event: "CompletePayment",
    event_time: Math.floor(nowMs / 1000),
    event_id: input.orderNumber,
    user,
    ...(tracking.eventSourceUrl
      ? { page: { url: tracking.eventSourceUrl } }
      : {}),
    properties: {
      currency: "UAH",
      value: input.value,
      content_type: "product",
      contents: input.items.map((i) => ({
        content_id: i.item_id,
        content_name: i.item_name,
        quantity: i.quantity,
        price: i.price,
      })),
      order_id: input.orderNumber,
    },
  };
}

export async function sendTikTokPurchase(
  input: PurchaseEventInput,
  ctx: RequestContext,
  mode: UserDataMode,
): Promise<SendResult> {
  const pixelCode = process.env.TIKTOK_PIXEL_CODE;
  const token = process.env.TIKTOK_EVENTS_TOKEN;
  if (!pixelCode || !token) {
    return { platform: "tiktok", status: "skipped", reason: "no credentials" };
  }

  const testEventCode = process.env.TIKTOK_TEST_EVENT_CODE;

  try {
    const res = await fetch(TIKTOK_EVENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": token,
      },
      body: JSON.stringify({
        event_source: "web",
        event_source_id: pixelCode,
        ...(testEventCode ? { test_event_code: testEventCode } : {}),
        data: [buildTikTokPurchaseEvent(input, ctx, mode)],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const body = (await res.json().catch(() => null)) as {
      code?: number;
      message?: string;
    } | null;

    // TikTok повертає 200 з code != 0 при помилці в тілі запиту
    if (!res.ok || (body && typeof body.code === "number" && body.code !== 0)) {
      return {
        platform: "tiktok",
        status: "failed",
        error: `${res.status} ${JSON.stringify(body)?.slice(0, 500)}`,
      };
    }
    return { platform: "tiktok", status: "sent" };
  } catch (error) {
    return {
      platform: "tiktok",
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
