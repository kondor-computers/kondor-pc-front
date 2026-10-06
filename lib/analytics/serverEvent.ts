import { readTrackingContext } from "@/lib/analytics/clickIds";
import type { AnalyticsItem } from "@/lib/analytics/ecommerce";

type ServerEventParams = {
  event: "purchase" | "start_checkout";
  eventId: string;
  value: number;
  items: AnalyticsItem[];
  phone?: string;
};

/**
 * Дублює подію на сервер (Meta Conversions API, TikTok Events API).
 * `keepalive` — щоб запит не обірвався при переході на іншу сторінку.
 * Помилки тут ніколи не повинні ламати оформлення замовлення.
 */
export function sendServerEvent(params: ServerEventParams): void {
  if (typeof window === "undefined") return;

  try {
    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, tracking: readTrackingContext() }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}
