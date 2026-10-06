import type { ServerEventInput } from "@/lib/validations/analyticsEvent";

import { sendMetaEvent } from "./meta";
import { sendTikTokEvent } from "./tiktok";
import {
  getEnabledServerEvents,
  getUserDataMode,
  isBot,
  type RequestContext,
  type SendResult,
} from "./types";

/**
 * Відправляє подію в Meta CAPI і TikTok Events API. Не кидає помилок.
 * Повертає порожній список, якщо подію вимкнено (`ANALYTICS_SERVER_EVENTS`)
 * або запит схожий на бота.
 */
export async function sendServerEvent(
  input: ServerEventInput,
  ctx: RequestContext,
): Promise<SendResult[]> {
  if (isBot(ctx.userAgent) || !getEnabledServerEvents().has(input.event)) {
    return [];
  }

  const mode = getUserDataMode();
  const results = await Promise.all([
    sendMetaEvent(input, ctx, mode),
    sendTikTokEvent(input, ctx, mode),
  ]);

  for (const result of results) {
    if (result.status === "failed") {
      console.error(
        `[analytics/${result.platform}] ${input.event} ${input.eventId}: ${result.error}`,
      );
    }
  }
  return results;
}
