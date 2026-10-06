import { readTrackingContext } from "@/lib/analytics/clickIds";
import type { AnalyticsItem } from "@/lib/analytics/ecommerce";

type ServerPurchaseParams = {
  orderNumber: string;
  value: number;
  items: AnalyticsItem[];
  phone?: string;
};

/**
 * Дублює покупку на сервер (Meta Conversions API, TikTok Events API).
 * `keepalive` — щоб запит не обірвався при редіректі на оплату.
 * Помилки тут ніколи не повинні ламати оформлення замовлення.
 */
export function sendServerPurchase(params: ServerPurchaseParams): void {
  if (typeof window === "undefined") return;

  try {
    void fetch("/api/analytics/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, tracking: readTrackingContext() }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}
