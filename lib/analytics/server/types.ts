export type RequestContext = {
  ip?: string;
  userAgent?: string;
};

/**
 * none  — без персональних даних (лише cookie-ідентифікатори, IP, User-Agent)
 * phone — додатково хешований телефон
 */
export type UserDataMode = "none" | "phone";

export type SendResult =
  | { platform: "meta" | "tiktok"; status: "skipped"; reason: string }
  | { platform: "meta" | "tiktok"; status: "sent" }
  | { platform: "meta" | "tiktok"; status: "failed"; error: string };

export function getUserDataMode(): UserDataMode {
  return process.env.ANALYTICS_USER_DATA === "phone" ? "phone" : "none";
}

export const REQUEST_TIMEOUT_MS = 5000;
