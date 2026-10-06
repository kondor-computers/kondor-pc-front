import type {
  ServerEventInput,
  ServerEventName,
} from "@/lib/validations/analyticsEvent";

import { hashPhoneForMeta, sha256 } from "./hash";
import {
  REQUEST_TIMEOUT_MS,
  type RequestContext,
  type SendResult,
  type UserDataMode,
} from "./types";

const DEFAULT_GRAPH_VERSION = "v25.0";

const META_EVENT_NAMES: Record<ServerEventName, string> = {
  purchase: "Purchase",
  start_checkout: "InitiateCheckout",
};

export function buildMetaEvent(
  input: ServerEventInput,
  ctx: RequestContext,
  mode: UserDataMode,
  nowMs: number = Date.now(),
) {
  const { tracking } = input;
  const phoneHash =
    input.event === "purchase" && mode === "phone" && input.phone
      ? hashPhoneForMeta(input.phone)
      : undefined;

  const userData: Record<string, unknown> = {
    country: [sha256("ua")],
  };
  if (ctx.ip) userData.client_ip_address = ctx.ip;
  if (ctx.userAgent) userData.client_user_agent = ctx.userAgent;
  if (tracking.fbp) userData.fbp = tracking.fbp;
  if (tracking.fbc) userData.fbc = tracking.fbc;
  if (phoneHash) userData.ph = [phoneHash];

  return {
    event_name: META_EVENT_NAMES[input.event],
    event_time: Math.floor(nowMs / 1000),
    event_id: input.eventId,
    action_source: "website",
    ...(tracking.eventSourceUrl
      ? { event_source_url: tracking.eventSourceUrl }
      : {}),
    user_data: userData,
    custom_data: {
      currency: "UAH",
      value: input.value,
      content_type: "product",
      content_ids: input.items.map((i) => i.item_id),
      contents: input.items.map((i) => ({
        id: i.item_id,
        quantity: i.quantity,
        item_price: i.price,
      })),
      num_items: input.items.reduce((sum, i) => sum + i.quantity, 0),
      ...(input.event === "purchase" ? { order_id: input.eventId } : {}),
    },
  };
}

export async function sendMetaEvent(
  input: ServerEventInput,
  ctx: RequestContext,
  mode: UserDataMode,
): Promise<SendResult> {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) {
    return { platform: "meta", status: "skipped", reason: "no credentials" };
  }

  const version = process.env.META_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: token,
          data: [buildMetaEvent(input, ctx, mode)],
          ...(testEventCode ? { test_event_code: testEventCode } : {}),
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        platform: "meta",
        status: "failed",
        error: `${res.status} ${body.slice(0, 500)}`,
      };
    }
    return { platform: "meta", status: "sent" };
  } catch (error) {
    return {
      platform: "meta",
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
