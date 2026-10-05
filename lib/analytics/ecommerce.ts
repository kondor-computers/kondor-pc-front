export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_variant?: string;
  price: number;
  quantity: number;
};

/** Мінімальна форма позиції — сумісна і з `CartItem`, і з аргументом `cart.add()`. */
export type AnalyticsSource = {
  slug: string;
  sku?: string;
  name: string;
  unitPriceUah?: number;
  priceUah?: number;
  quantity?: number;
  options?: { optionLabel: string }[];
  colorCode?: string;
  colorName?: string;
};

export type SubmitOrderParams = {
  order_number: string;
  value: number;
  items: AnalyticsItem[];
  user_data: {
    phone: string;
    first_name: string;
    last_name: string;
    city: string;
  };
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

function pushEvent(event: string, payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...payload });
}

/** `item_id` збігається з `g:id` у фідах (sku), для аксесуарів — код кольору або slug. */
export function toAnalyticsItem(source: AnalyticsSource): AnalyticsItem {
  const variant =
    source.colorName ||
    source.options?.map((o) => o.optionLabel).join(", ") ||
    undefined;

  return {
    item_id: source.sku || source.colorCode || source.slug,
    item_name: source.name,
    ...(variant ? { item_variant: variant } : {}),
    price: source.unitPriceUah ?? source.priceUah ?? 0,
    quantity: source.quantity ?? 1,
  };
}

function totalOf(items: AnalyticsItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function trackViewItem(source: AnalyticsSource): void {
  const item = toAnalyticsItem(source);
  pushEvent("view_item", {
    value: item.price,
    currency: "UAH",
    items: [item],
  });
}

export function trackAddToCart(source: AnalyticsSource): void {
  const item = toAnalyticsItem(source);
  pushEvent("add_to_cart", {
    value: item.price * item.quantity,
    currency: "UAH",
    items: [item],
  });
}

export function trackStartCheckout(sources: AnalyticsSource[]): void {
  const items = sources.map(toAnalyticsItem);
  pushEvent("start_checkout", {
    value: totalOf(items),
    currency: "UAH",
    items,
  });
}

export function trackSubmitOrder(params: SubmitOrderParams): void {
  pushEvent("submit_order", {
    order_number: params.order_number,
    value: params.value,
    currency: "UAH",
    items: params.items,
    user_data: params.user_data,
  });
}
