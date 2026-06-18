"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BuildSpecShort } from "@/types/build";

export type CartItemType = "build" | "accessory";

export interface CartItemOption {
  groupId: string;
  groupLabel: string;
  optionId: string;
  optionLabel: string;
  priceDelta: number;
}

export interface CartItem {
  itemType: CartItemType;
  slug: string;
  /** Артикул збірки з Sanity (`build.sku`) або SKU аксесуара. */
  sku?: string;
  name: string;
  priceUah: number;
  unitPriceUah: number;
  quantity: number;
  options?: CartItemOption[];
  spec?: BuildSpecShort;
  image?: string;
  colorCode?: string;
  colorName?: string;
}

interface AddInput {
  itemType?: CartItemType;
  slug: string;
  sku?: string;
  name: string;
  priceUah: number;
  unitPriceUah?: number;
  options?: CartItemOption[];
  spec?: BuildSpecShort;
  image?: string;
  colorCode?: string;
  colorName?: string;
  quantity?: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;

  add: (input: AddInput) => void;
  remove: (lineKey: string) => void;
  setQuantity: (lineKey: string, quantity: number) => void;
  clear: () => void;

  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  lineKey: (item: {
    slug: string;
    options?: CartItemOption[];
    colorCode?: string;
  }) => string;
  count: () => number;
  totalUah: () => number;
}

function optionsSignature(options?: CartItemOption[]): string {
  if (!options || options.length === 0) return "base";
  return [...options]
    .map((o) => `${o.groupId}:${o.optionId}`)
    .sort()
    .join("|");
}

function buildLineKey(item: {
  slug: string;
  options?: CartItemOption[];
  colorCode?: string;
}): string {
  return `${item.slug}#${optionsSignature(item.options)}#${item.colorCode ?? "_"}`;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hydrated: false,

      add: (input) => {
        const itemType = input.itemType ?? "build";
        const quantity = input.quantity ?? 1;
        const unit =
          typeof input.unitPriceUah === "number"
            ? input.unitPriceUah
            : input.priceUah +
              (input.options?.reduce((s, o) => s + o.priceDelta, 0) ?? 0);

        const key = buildLineKey({
          slug: input.slug,
          options: input.options,
          colorCode: input.colorCode,
        });

        set((state) => {
          const existing = state.items.find(
            (i) =>
              buildLineKey({
                slug: i.slug,
                options: i.options,
                colorCode: i.colorCode,
              }) === key,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i === existing
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          const next: CartItem = {
            itemType,
            slug: input.slug,
            sku: input.sku,
            name: input.name,
            priceUah: input.priceUah,
            unitPriceUah: unit,
            quantity,
            options: input.options,
            spec: input.spec,
            image: input.image,
            colorCode: input.colorCode,
            colorName: input.colorName,
          };
          return { items: [...state.items, next] };
        });
      },

      remove: (key) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              buildLineKey({
                slug: i.slug,
                options: i.options,
                colorCode: i.colorCode,
              }) !== key,
          ),
        })),

      setQuantity: (key, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) =>
                  buildLineKey({
                    slug: i.slug,
                    options: i.options,
                    colorCode: i.colorCode,
                  }) !== key,
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              buildLineKey({
                slug: i.slug,
                options: i.options,
                colorCode: i.colorCode,
              }) === key
                ? { ...i, quantity }
                : i,
            ),
          };
        }),

      clear: () => set({ items: [] }),

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen })),

      lineKey: buildLineKey,
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalUah: () =>
        get().items.reduce((s, i) => s + i.unitPriceUah * i.quantity, 0),
    }),
    {
      name: "kondor-cart-v3",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export { buildLineKey as lineKey };
