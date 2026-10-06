import type { PurchaseEventInput } from "@/lib/validations/analyticsPurchase";

import { sendMetaPurchase } from "./meta";
import { sendTikTokPurchase } from "./tiktok";
import { getUserDataMode, type RequestContext, type SendResult } from "./types";

/** Відправляє покупку в Meta CAPI і TikTok Events API. Не кидає помилок. */
export async function sendServerPurchase(
  input: PurchaseEventInput,
  ctx: RequestContext,
): Promise<SendResult[]> {
  const mode = getUserDataMode();
  const results = await Promise.all([
    sendMetaPurchase(input, ctx, mode),
    sendTikTokPurchase(input, ctx, mode),
  ]);

  for (const result of results) {
    if (result.status === "failed") {
      console.error(
        `[analytics/${result.platform}] ${input.orderNumber}: ${result.error}`,
      );
    }
  }
  return results;
}
