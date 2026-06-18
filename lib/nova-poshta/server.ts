import "server-only";

import type { NpBranch, NpCity } from "./types";

const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

interface NpApiResponse<T> {
  success: boolean;
  data: T;
  errors?: string[];
  errorCodes?: string[];
}

interface NpSettlementRow {
  Present?: string;
  MainDescription?: string;
  Area?: string;
  Region?: string;
  DeliveryCity?: string;
  Ref?: string;
}

interface NpSearchSettlementsPayload {
  Addresses?: NpSettlementRow[];
}

interface NpWarehouseRow {
  Ref?: string;
  Number?: string;
  Description?: string;
}

async function novaPoshtaRequest<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>,
): Promise<T> {
  const apiKey = process.env.NOVA_POSHTA_API_KEY;
  if (!apiKey) {
    throw new Error("NOVA_POSHTA_API_KEY is not configured");
  }

  const res = await fetch(NP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      modelName,
      calledMethod,
      methodProperties,
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Nova Poshta HTTP ${res.status}`);
  }

  const json = (await res.json()) as NpApiResponse<T>;
  if (!json.success) {
    const message =
      json.errors?.join(", ") ||
      json.errorCodes?.join(", ") ||
      "Nova Poshta API error";
    throw new Error(message);
  }

  return json.data;
}

export async function searchSettlements(
  query: string,
  limit = 10,
): Promise<NpCity[]> {
  const q = query.trim();
  if (q.length < 1) return [];

  const data = await novaPoshtaRequest<NpSearchSettlementsPayload[]>(
    "Address",
    "searchSettlements",
    {
      CityName: q,
      Limit: Math.min(20, Math.max(1, limit)),
      Page: 1,
    },
  );

  const rows = data[0]?.Addresses ?? [];
  const seen = new Set<string>();

  return rows
    .map((row): NpCity | null => {
      const ref = row.DeliveryCity?.trim();
      if (!ref) return null;
      const name =
        row.MainDescription?.trim() || row.Present?.trim() || "";
      if (!name) return null;
      return {
        ref,
        name,
        region: row.Area?.trim() || row.Region?.trim() || "",
      };
    })
    .filter((city): city is NpCity => {
      if (!city) return false;
      if (seen.has(city.ref)) return false;
      seen.add(city.ref);
      return true;
    });
}

export async function getWarehouses(cityRef: string): Promise<NpBranch[]> {
  const ref = cityRef.trim();
  if (!ref) return [];

  const data = await novaPoshtaRequest<NpWarehouseRow[]>(
    "Address",
    "getWarehouses",
    { CityRef: ref },
  );

  return data
    .map((row): NpBranch | null => {
      const number = row.Number?.trim();
      const address = row.Description?.trim();
      const warehouseRef = row.Ref?.trim();
      if (!number || !address || !warehouseRef) return null;
      return {
        ref: warehouseRef,
        number,
        address: `№${number} · ${address}`,
      };
    })
    .filter((branch): branch is NpBranch => branch !== null)
    .sort((a, b) => Number(a.number) - Number(b.number));
}
