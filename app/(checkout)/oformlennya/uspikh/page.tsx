import type { Metadata } from "next";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";
import {
  PurchaseTracker,
  PurchaseTrackerFallback,
} from "@/components/analytics/PurchaseTracker";
import { getCheckoutPaymentStatus } from "@/lib/analytics/purchase";
import type { PaymentMethod } from "@/lib/validations/order";
import { PAYMENT_METHODS } from "@/lib/validations/order";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "Замовлення оформлено" },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const orderNumber = params.order ?? "UA-XXXXXX-XXXX";
  const paymentRaw = params.payment;
  const paymentMethod = PAYMENT_METHODS.includes(paymentRaw as PaymentMethod)
    ? (paymentRaw as PaymentMethod)
    : undefined;
  const valueUah = params.value ? Number(params.value) : undefined;
  const resolvedValue =
    valueUah != null && Number.isFinite(valueUah) ? valueUah : 0;

  return (
    <div className="container-narrow py-16 md:py-24">
      <PurchaseTracker
        orderNumber={orderNumber}
        paymentMethod={paymentMethod}
        valueUah={resolvedValue > 0 ? resolvedValue : undefined}
      />
      {paymentMethod && paymentMethod !== "monopay" && resolvedValue >= 0 && (
        <PurchaseTrackerFallback
          orderNumber={orderNumber}
          paymentMethod={paymentMethod}
          valueUah={resolvedValue}
          paymentStatus={getCheckoutPaymentStatus(paymentMethod)}
        />
      )}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-brand-primary/15">
          <Check className="size-8 text-brand-primary" strokeWidth={3} />
        </div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          ДЯКУЄМО ЗА ЗАМОВЛЕННЯ!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Ми вже отримали вашу заявку. Номер замовлення:
        </p>
        <div className="tabular mt-1 rounded-md border border-border bg-surface px-3 py-1.5 font-body text-sm">
          {orderNumber}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <TechButtonLink href="/" variant="white" className="h-12">
          На головну
        </TechButtonLink>
        <TechButtonLink href="/pk" variant="primary" className="h-12">
          Переглянути каталог
        </TechButtonLink>
      </div>
    </div>
  );
}
