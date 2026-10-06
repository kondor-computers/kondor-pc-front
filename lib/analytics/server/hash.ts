import { createHash } from "node:crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Цифри з кодом країни, без `+` і провідних нулів (формат Meta). */
export function normalizePhoneDigits(raw: string): string | undefined {
  let digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  // 0501234567 -> 501234567 -> 380501234567
  if (digits.length === 9) digits = `380${digits}`;
  return digits.length >= 11 ? digits : undefined;
}

export function hashPhoneForMeta(raw: string): string | undefined {
  const digits = normalizePhoneDigits(raw);
  return digits ? sha256(digits) : undefined;
}

/** E.164 (`+380…`) перед хешуванням — формат TikTok. */
export function hashPhoneForTikTok(raw: string): string | undefined {
  const digits = normalizePhoneDigits(raw);
  return digits ? sha256(`+${digits}`) : undefined;
}
