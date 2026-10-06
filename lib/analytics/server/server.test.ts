import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PurchaseEventInput } from "@/lib/validations/analyticsPurchase";
import { purchaseEventSchema } from "@/lib/validations/analyticsPurchase";

import { hashPhoneForMeta, hashPhoneForTikTok, sha256 } from "./hash";
import { buildMetaPurchaseEvent, sendMetaPurchase } from "./meta";
import { sendServerPurchase } from "./purchase";
import { buildTikTokPurchaseEvent, sendTikTokPurchase } from "./tiktok";

const input: PurchaseEventInput = {
  orderNumber: "UA-261005-1234",
  value: 93800,
  items: [
    { item_id: "KPC-LUNARA", item_name: "LUNARA", price: 46900, quantity: 2 },
  ],
  phone: "+380501234567",
  tracking: {
    fbp: "fb.1.1.111",
    fbc: "fb.1.1.abc",
    ttp: "ttp-value",
    ttclid: "tt-click",
    eventSourceUrl: "https://www.kondorpc.com.ua/oformlennya",
  },
};
const ctx = { ip: "203.0.113.5", userAgent: "UA/1.0" };
const NOW = 1_791_211_000_000;

describe("hash", () => {
  it("normalizes phone for Meta (digits, country code, no plus)", () => {
    const expected = sha256("380501234567");
    expect(hashPhoneForMeta("+380501234567")).toBe(expected);
    expect(hashPhoneForMeta("+38 (050) 123-45-67")).toBe(expected);
    expect(hashPhoneForMeta("0501234567")).toBe(expected);
  });

  it("normalizes phone for TikTok to E.164 before hashing", () => {
    expect(hashPhoneForTikTok("380501234567")).toBe(sha256("+380501234567"));
  });

  it("returns undefined for a too short phone", () => {
    expect(hashPhoneForMeta("12345")).toBeUndefined();
  });
});

describe("Meta payload", () => {
  it("builds Purchase with the same event_id as the browser event", () => {
    const event = buildMetaPurchaseEvent(input, ctx, "none", NOW);
    expect(event).toMatchObject({
      event_name: "Purchase",
      event_id: "UA-261005-1234",
      event_time: Math.floor(NOW / 1000),
      action_source: "website",
      event_source_url: "https://www.kondorpc.com.ua/oformlennya",
      custom_data: {
        currency: "UAH",
        value: 93800,
        content_ids: ["KPC-LUNARA"],
        num_items: 2,
        order_id: "UA-261005-1234",
      },
    });
    expect(event.user_data).toMatchObject({
      client_ip_address: "203.0.113.5",
      client_user_agent: "UA/1.0",
      fbp: "fb.1.1.111",
      fbc: "fb.1.1.abc",
    });
  });

  it("sends no personal data in 'none' mode", () => {
    const event = buildMetaPurchaseEvent(input, ctx, "none", NOW);
    expect(event.user_data).not.toHaveProperty("ph");
    expect(JSON.stringify(event)).not.toContain("380501234567");
  });

  it("adds hashed phone in 'phone' mode", () => {
    const event = buildMetaPurchaseEvent(input, ctx, "phone", NOW);
    expect(event.user_data).toMatchObject({ ph: [sha256("380501234567")] });
  });
});

describe("TikTok payload", () => {
  it("builds CompletePayment with the same event_id as the browser event", () => {
    const event = buildTikTokPurchaseEvent(input, ctx, "none", NOW);
    expect(event).toMatchObject({
      event: "CompletePayment",
      event_id: "UA-261005-1234",
      user: {
        ip: "203.0.113.5",
        user_agent: "UA/1.0",
        ttp: "ttp-value",
        ttclid: "tt-click",
      },
      page: { url: "https://www.kondorpc.com.ua/oformlennya" },
      properties: {
        currency: "UAH",
        value: 93800,
        order_id: "UA-261005-1234",
        contents: [
          {
            content_id: "KPC-LUNARA",
            content_name: "LUNARA",
            quantity: 2,
            price: 46900,
          },
        ],
      },
    });
    expect(event.user).not.toHaveProperty("phone");
  });

  it("adds E.164 hashed phone in 'phone' mode", () => {
    const event = buildTikTokPurchaseEvent(input, ctx, "phone", NOW);
    expect(event.user).toMatchObject({ phone: sha256("+380501234567") });
  });
});

describe("sending", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 0 }), { status: 200 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("skips both platforms without credentials", async () => {
    const results = await sendServerPurchase(input, ctx);
    expect(results.map((r) => r.status)).toEqual(["skipped", "skipped"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts to Meta with token and test code", async () => {
    vi.stubEnv("META_PIXEL_ID", "123");
    vi.stubEnv("META_CAPI_TOKEN", "meta-token");
    vi.stubEnv("META_TEST_EVENT_CODE", "TEST1");

    const result = await sendMetaPurchase(input, ctx, "none");
    expect(result.status).toBe("sent");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://graph.facebook.com/v25.0/123/events");
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.access_token).toBe("meta-token");
    expect(body.test_event_code).toBe("TEST1");
    expect(body.data).toHaveLength(1);
  });

  it("posts to TikTok with Access-Token header", async () => {
    vi.stubEnv("TIKTOK_PIXEL_CODE", "PIXEL");
    vi.stubEnv("TIKTOK_EVENTS_TOKEN", "tt-token");

    const result = await sendTikTokPurchase(input, ctx, "none");
    expect(result.status).toBe("sent");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://business-api.tiktok.com/open_api/v1.3/event/track/");
    expect((init as RequestInit).headers).toMatchObject({
      "Access-Token": "tt-token",
    });
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toMatchObject({
      event_source: "web",
      event_source_id: "PIXEL",
    });
  });

  it("reports a TikTok error returned in the body", async () => {
    vi.stubEnv("TIKTOK_PIXEL_CODE", "PIXEL");
    vi.stubEnv("TIKTOK_EVENTS_TOKEN", "tt-token");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 40001, message: "bad" }), {
        status: 200,
      }),
    );

    const result = await sendTikTokPurchase(input, ctx, "none");
    expect(result.status).toBe("failed");
  });

  it("never throws when the network fails", async () => {
    vi.stubEnv("META_PIXEL_ID", "123");
    vi.stubEnv("META_CAPI_TOKEN", "meta-token");
    fetchMock.mockRejectedValue(new Error("network down"));

    const result = await sendMetaPurchase(input, ctx, "none");
    expect(result).toMatchObject({ status: "failed", error: "network down" });
  });
});

describe("payload validation", () => {
  it("rejects an empty items list and a negative value", () => {
    expect(
      purchaseEventSchema.safeParse({ ...input, items: [] }).success,
    ).toBe(false);
    expect(
      purchaseEventSchema.safeParse({ ...input, value: -1 }).success,
    ).toBe(false);
  });

  it("accepts a payload without tracking cookies", () => {
    const result = purchaseEventSchema.safeParse({
      ...input,
      tracking: undefined,
    });
    expect(result.success).toBe(true);
  });
});
