import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ServerEventInput } from "@/lib/validations/analyticsEvent";
import { serverEventSchema } from "@/lib/validations/analyticsEvent";

import { sendServerEvent } from "./events";
import { hashPhoneForMeta, hashPhoneForTikTok, sha256 } from "./hash";
import { buildMetaEvent, sendMetaEvent } from "./meta";
import { buildTikTokEvent, sendTikTokEvent } from "./tiktok";
import { getEnabledServerEvents, isBot } from "./types";

const purchase: ServerEventInput = {
  event: "purchase",
  eventId: "UA-261005-1234",
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
const checkout: ServerEventInput = {
  ...purchase,
  event: "start_checkout",
  eventId: "5d1f0c7e-checkout",
};
const ctx = { ip: "203.0.113.5", userAgent: "Mozilla/5.0 UA/1.0" };
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
  it("builds Purchase with the order number as event_id", () => {
    const event = buildMetaEvent(purchase, ctx, "none", NOW);
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
      client_user_agent: "Mozilla/5.0 UA/1.0",
      fbp: "fb.1.1.111",
      fbc: "fb.1.1.abc",
    });
  });

  it("builds InitiateCheckout with the shared event_id and no order_id", () => {
    const event = buildMetaEvent(checkout, ctx, "none", NOW);
    expect(event).toMatchObject({
      event_name: "InitiateCheckout",
      event_id: "5d1f0c7e-checkout",
      custom_data: { value: 93800, num_items: 2, content_ids: ["KPC-LUNARA"] },
    });
    expect(event.custom_data).not.toHaveProperty("order_id");
  });

  it("sends no personal data in 'none' mode", () => {
    const event = buildMetaEvent(purchase, ctx, "none", NOW);
    expect(event.user_data).not.toHaveProperty("ph");
    expect(JSON.stringify(event)).not.toContain("380501234567");
  });

  it("adds hashed phone to Purchase only in 'phone' mode", () => {
    expect(buildMetaEvent(purchase, ctx, "phone", NOW).user_data).toMatchObject(
      { ph: [sha256("380501234567")] },
    );
    expect(buildMetaEvent(checkout, ctx, "phone", NOW).user_data).not.toHaveProperty(
      "ph",
    );
  });
});

describe("TikTok payload", () => {
  it("builds CompletePayment with the order number as event_id", () => {
    const event = buildTikTokEvent(purchase, ctx, "none", NOW);
    expect(event).toMatchObject({
      event: "CompletePayment",
      event_id: "UA-261005-1234",
      user: {
        ip: "203.0.113.5",
        user_agent: "Mozilla/5.0 UA/1.0",
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

  it("builds InitiateCheckout with the shared event_id and no order_id", () => {
    const event = buildTikTokEvent(checkout, ctx, "none", NOW);
    expect(event).toMatchObject({
      event: "InitiateCheckout",
      event_id: "5d1f0c7e-checkout",
      properties: { value: 93800 },
    });
    expect(event.properties).not.toHaveProperty("order_id");
  });

  it("adds E.164 hashed phone to CompletePayment only in 'phone' mode", () => {
    expect(buildTikTokEvent(purchase, ctx, "phone", NOW).user).toMatchObject({
      phone: sha256("+380501234567"),
    });
    expect(buildTikTokEvent(checkout, ctx, "phone", NOW).user).not.toHaveProperty(
      "phone",
    );
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
    const results = await sendServerEvent(purchase, ctx);
    expect(results.map((r) => r.status)).toEqual(["skipped", "skipped"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts to Meta with token and test code", async () => {
    vi.stubEnv("META_PIXEL_ID", "123");
    vi.stubEnv("META_CAPI_TOKEN", "meta-token");
    vi.stubEnv("META_TEST_EVENT_CODE", "TEST1");

    const result = await sendMetaEvent(purchase, ctx, "none");
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

    const result = await sendTikTokEvent(purchase, ctx, "none");
    expect(result.status).toBe("sent");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
    );
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

    const result = await sendTikTokEvent(purchase, ctx, "none");
    expect(result.status).toBe("failed");
  });

  it("never throws when the network fails", async () => {
    vi.stubEnv("META_PIXEL_ID", "123");
    vi.stubEnv("META_CAPI_TOKEN", "meta-token");
    fetchMock.mockRejectedValue(new Error("network down"));

    const result = await sendMetaEvent(purchase, ctx, "none");
    expect(result).toMatchObject({ status: "failed", error: "network down" });
  });
});

describe("enabled events and bots", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 0 }), { status: 200 }),
    );
    vi.stubEnv("META_PIXEL_ID", "123");
    vi.stubEnv("META_CAPI_TOKEN", "meta-token");
    vi.stubEnv("TIKTOK_PIXEL_CODE", "PIXEL");
    vi.stubEnv("TIKTOK_EVENTS_TOKEN", "tt-token");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("enables only purchase by default", () => {
    expect([...getEnabledServerEvents()]).toEqual(["purchase"]);
  });

  it("parses ANALYTICS_SERVER_EVENTS and ignores unknown names", () => {
    vi.stubEnv("ANALYTICS_SERVER_EVENTS", "purchase, start_checkout ,view_item");
    expect([...getEnabledServerEvents()].sort()).toEqual([
      "purchase",
      "start_checkout",
    ]);
  });

  it("does not send start_checkout until it is enabled", async () => {
    expect(await sendServerEvent(checkout, ctx)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends start_checkout to both platforms once enabled", async () => {
    vi.stubEnv("ANALYTICS_SERVER_EVENTS", "purchase,start_checkout");
    const results = await sendServerEvent(checkout, ctx);
    expect(results.map((r) => r.status)).toEqual(["sent", "sent"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("skips bots and requests without a User-Agent", async () => {
    expect(
      await sendServerEvent(purchase, { ip: "1.1.1.1", userAgent: "Googlebot/2.1" }),
    ).toEqual([]);
    expect(await sendServerEvent(purchase, { ip: "1.1.1.1" })).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(isBot("Mozilla/5.0 (iPhone) Safari")).toBe(false);
  });
});

describe("payload validation", () => {
  it("rejects an empty items list, a negative value and an unknown event", () => {
    expect(
      serverEventSchema.safeParse({ ...purchase, items: [] }).success,
    ).toBe(false);
    expect(
      serverEventSchema.safeParse({ ...purchase, value: -1 }).success,
    ).toBe(false);
    expect(
      serverEventSchema.safeParse({ ...purchase, event: "view_item" }).success,
    ).toBe(false);
  });

  it("accepts a payload without tracking cookies", () => {
    const result = serverEventSchema.safeParse({
      ...purchase,
      tracking: undefined,
    });
    expect(result.success).toBe(true);
  });
});
