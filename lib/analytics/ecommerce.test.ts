import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  toAnalyticsItem,
  trackAddToCart,
  trackStartCheckout,
  trackSubmitOrder,
  trackViewItem,
} from "@/lib/analytics/ecommerce";

const build = {
  slug: "lunara",
  sku: "LUN-001",
  name: "LUNARA",
  unitPriceUah: 50550,
  quantity: 1,
  options: [{ optionLabel: "32 GB RAM" }, { optionLabel: "1 TB SSD" }],
};

describe("ecommerce analytics", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { dataLayer: [] as Record<string, unknown>[] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps a cart line to an analytics item with sku as item_id", () => {
    expect(toAnalyticsItem(build)).toEqual({
      item_id: "LUN-001",
      item_name: "LUNARA",
      item_variant: "32 GB RAM, 1 TB SSD",
      price: 50550,
      quantity: 1,
    });
  });

  it("falls back to color code, then slug, when sku is missing", () => {
    expect(
      toAnalyticsItem({ slug: "mouse", name: "Mouse", colorCode: "MS-BLK" })
        .item_id,
    ).toBe("MS-BLK");
    expect(toAnalyticsItem({ slug: "mouse", name: "Mouse" }).item_id).toBe(
      "mouse",
    );
  });

  it("uses color name as variant and omits variant when there is none", () => {
    expect(
      toAnalyticsItem({ slug: "mouse", name: "Mouse", colorName: "Чорний" })
        .item_variant,
    ).toBe("Чорний");
    expect(toAnalyticsItem({ slug: "mouse", name: "Mouse" })).not.toHaveProperty(
      "item_variant",
    );
  });

  it("pushes view_item", () => {
    trackViewItem(build);

    expect(window.dataLayer).toEqual([
      {
        event: "view_item",
        value: 50550,
        currency: "UAH",
        items: [toAnalyticsItem(build)],
      },
    ]);
  });

  it("pushes add_to_cart with value = price × quantity", () => {
    trackAddToCart({ ...build, quantity: 2 });

    expect(window.dataLayer![0]).toMatchObject({
      event: "add_to_cart",
      value: 101100,
      currency: "UAH",
    });
  });

  it("pushes start_checkout with the cart total", () => {
    trackStartCheckout([
      build,
      { slug: "mouse", name: "Mouse", unitPriceUah: 1000, quantity: 3 },
    ]);

    const event = window.dataLayer![0];
    expect(event).toMatchObject({
      event: "start_checkout",
      value: 53550,
      currency: "UAH",
    });
    expect(event.items).toHaveLength(2);
  });

  it("pushes submit_order with items and user_data", () => {
    const user_data = {
      phone: "+380501234567",
      first_name: "Іван",
      last_name: "Петренко",
      city: "Київ",
    };

    trackSubmitOrder({
      order_number: "UA-250819-1001",
      value: 50550,
      items: [toAnalyticsItem(build)],
      user_data,
    });

    expect(window.dataLayer![0]).toEqual({
      event: "submit_order",
      order_number: "UA-250819-1001",
      value: 50550,
      currency: "UAH",
      items: [toAnalyticsItem(build)],
      user_data,
    });
  });

  it("does nothing on the server (no window)", () => {
    vi.unstubAllGlobals();
    expect(() => trackViewItem(build)).not.toThrow();
  });
});
