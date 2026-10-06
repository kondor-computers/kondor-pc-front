import type { ServerEventName } from "@/lib/validations/analyticsEvent";

export type RequestContext = {
  ip?: string;
  userAgent?: string;
};

/**
 * none  — без персональних даних (лише cookie-ідентифікатори, IP, User-Agent)
 * phone — додатково хешований телефон (лише для покупки)
 */
export type UserDataMode = "none" | "phone";

export type SendResult =
  | { platform: "meta" | "tiktok"; status: "skipped"; reason: string }
  | { platform: "meta" | "tiktok"; status: "sent" }
  | { platform: "meta" | "tiktok"; status: "failed"; error: string };

export function getUserDataMode(): UserDataMode {
  return process.env.ANALYTICS_USER_DATA === "phone" ? "phone" : "none";
}

export const REQUEST_TIMEOUT_MS = 3000;

/**
 * Які події відправляються з сервера: `ANALYTICS_SERVER_EVENTS=purchase,start_checkout`.
 * За замовчуванням лише покупка — так нові події вмикаються на Vercel без деплою.
 */
export function getEnabledServerEvents(): Set<ServerEventName> {
  const raw = process.env.ANALYTICS_SERVER_EVENTS ?? "purchase";
  return new Set(
    raw
      .split(",")
      .map((name) => name.trim())
      .filter((name): name is ServerEventName =>
        name === "purchase" || name === "start_checkout",
      ),
  );
}

const BOT_PATTERN =
  /bot|crawl|spider|slurp|headless|lighthouse|facebookexternalhit|preview|monitor/i;

export function isBot(userAgent: string | undefined): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}
