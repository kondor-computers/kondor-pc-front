"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  formatPromoDiscount,
  isPromoActive,
  type PromoCode,
} from "@/lib/promoCode";

type Button = { text?: string; href?: string };

/** Resolved promoCode document from Sanity (via ctaPromoBanner reference). */
export type PromoCodeInfo = Pick<
  PromoCode,
  "code" | "validFrom" | "validUntil" | "discountPc" | "discountAccessories"
>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * CtaPromoBanner — призов до дії з промокодом із довідника Sanity.
 * Строк дії та знижки беруться з документа `promoCode`.
 */
export function CtaPromoBanner({
  title,
  promoText,
  promoCode,
  button,
}: {
  title: string;
  promoText?: string;
  promoCode?: PromoCodeInfo;
  button?: Button;
}) {
  const [copied, setCopied] = useState(false);
  const hasButton = button && button.text && button.href;
  const active = promoCode ? isPromoActive(promoCode) : false;

  const pcDiscount = formatPromoDiscount(promoCode?.discountPc);
  const accDiscount = formatPromoDiscount(promoCode?.discountAccessories);
  const discountParts = [
    pcDiscount && `ПК ${pcDiscount}`,
    accDiscount && `аксесуари ${accDiscount}`,
  ].filter(Boolean);

  const endsLabel = promoCode?.validUntil
    ? formatDate(promoCode.validUntil)
    : null;

  async function copyCode() {
    if (!promoCode?.code) return;
    try {
      await navigator.clipboard.writeText(promoCode.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="container-site py-16 md:py-20">
      <section className="relative overflow-hidden rounded-[40px] bg-brand-primary py-14 md:py-20">
        <div
          aria-hidden
          className="absolute -top-[120px] -left-[120px] size-[420px] rounded-full bg-black/15 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-[160px] -right-[140px] size-[460px] rounded-full bg-black/20 blur-3xl"
        />

        <div className="relative container-prose text-center">
          <div className="text-[11px] uppercase tracking-[0.25em] text-black/70">
            Промо-акція
            <span className="ml-3 inline-block size-2 rounded-full bg-black align-middle" />
          </div>
          <h2 className="mt-3 font-display text-[20px] font-bold uppercase tracking-tight text-black md:text-[40px]">
            {title}
          </h2>
          {promoText ? (
            <p className="mx-auto mt-4 max-w-[480px] text-[14px] leading-[120%] text-black/80 lg:text-[15px]">
              {promoText}
            </p>
          ) : null}

          {discountParts.length > 0 ? (
            <p className="mt-4 text-[12px] uppercase tracking-widest text-black/70">
              {discountParts.join(" · ")}
            </p>
          ) : null}

          {promoCode?.code ? (
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="inline-flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-black/40 bg-black/[0.06] px-5 py-3 sm:flex-row sm:gap-3">
                <span className="text-[10px] uppercase tracking-widest text-black/60">
                  Промокод
                </span>
                <span className="font-display text-[18px] font-bold tracking-wider text-black md:text-[22px]">
                  {promoCode.code}
                </span>
              </div>
              {active ? (
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-2 rounded-lg border border-black/20 bg-black/[0.06] px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-black/80 transition-colors hover:bg-black/10"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5" aria-hidden />
                      Скопійовано
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" aria-hidden />
                      Скопіювати код
                    </>
                  )}
                </button>
              ) : (
                <p className="text-[12px] uppercase tracking-widest text-black/60">
                  Промокод більше не діє
                </p>
              )}
            </div>
          ) : null}

          {endsLabel ? (
            <div className="mt-5 text-[12px] uppercase tracking-widest text-black/70">
              {active ? "Дійсний до" : "Діяв до"} {endsLabel}
            </div>
          ) : null}

          {hasButton ? (
            <div className="mt-8">
              <Link
                href={button!.href!}
                className="inline-flex items-center justify-center rounded-lg bg-black px-8 py-4 text-sm font-bold uppercase tracking-wider text-brand-primary transition-colors hover:bg-black/85"
              >
                {button!.text}
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
