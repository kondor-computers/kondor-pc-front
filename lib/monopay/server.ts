const MONOBANK_API = "https://api.monobank.ua/api/merchant";

export function getMonopayToken(): string {
  const token =
    process.env.MONOPAY_API_KEY ?? process.env.MONOPAY_TOKEN ?? "";
  if (!token) {
    throw new Error("MONOPAY_API_KEY не визначено в середовищі");
  }
  return token;
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export async function fetchMonopayPubKey(): Promise<string> {
  if (process.env.MONOPAY_PUBKEY) {
    return process.env.MONOPAY_PUBKEY;
  }

  const response = await fetch(`${MONOBANK_API}/pubkey`, {
    headers: { "X-Token": getMonopayToken() },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Не вдалося отримати публічний ключ Monopay");
  }

  const data = (await response.json()) as { key: string };
  return data.key;
}
