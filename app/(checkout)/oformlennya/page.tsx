import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "./CheckoutView";

export const metadata: Metadata = {
  title: { absolute: "Оформлення замовлення" },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function OformlennyaPage() {
  return (
    <div className="container-site py-10 md:py-14">
      <h1 className="font-display mb-8 text-3xl font-bold md:text-4xl">
        Оформлення замовлення
      </h1>
      <Suspense
        fallback={
          <div
            className="grid gap-8 md:grid-cols-[1fr_340px]"
            aria-busy="true"
            aria-label="Завантаження оформлення"
          >
            <div className="space-y-10">
              <div className="h-48 animate-pulse rounded-lg bg-muted/20" />
              <div className="h-64 animate-pulse rounded-lg bg-muted/20" />
            </div>
            <div className="h-80 animate-pulse rounded-lg bg-muted/20" />
          </div>
        }
      >
        <CheckoutView />
      </Suspense>
    </div>
  );
}
