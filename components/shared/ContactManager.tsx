"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUah } from "@/lib/format";

/**
 * Inline "ask the manager" affordance used next to primary CTAs on product pages.
 * Removes the silent-objection wall on high-ticket custom-PC purchases: a buyer
 * with one question can reach the sales chat without leaving the page.
 *
 * Layout (all one row on mobile):
 *   [ +380 XX XX — flex-1 ]  [Telegram]  [WhatsApp]  [Viber]
 *
 * Handles are read from env vars so the client can swap them without a code
 * change; defaults come from the existing /kontakty page.
 */

const TELEGRAM_HANDLE =
  process.env.NEXT_PUBLIC_TELEGRAM_HANDLE || "kondor_pc";
const PHONE_DISPLAY =
  process.env.NEXT_PUBLIC_PHONE_DISPLAY || "+380 XX XXX XX XX";
const PHONE_HREF =
  process.env.NEXT_PUBLIC_PHONE_HREF || "tel:+380000000000";
// WhatsApp / Viber use the raw phone digits; both deep-links accept the number.
const PHONE_DIGITS = (
  process.env.NEXT_PUBLIC_PHONE_DIGITS || "380000000000"
).replace(/[^\d]/g, "");

function telegramUrl(prefill?: string) {
  const tg = `https://t.me/${TELEGRAM_HANDLE}`;
  return prefill ? `${tg}?text=${encodeURIComponent(prefill)}` : tg;
}

// Brand-coloured inline SVGs — no additional icon dependency.
function TelegramGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
      <path d="M9.78 18.65 3.7 16.77c-.87-.27-.88-1.34.19-1.75l14.74-5.68c.96-.39 1.97.37 1.6 1.42l-3.13 8.95c-.35.99-1.39 1.33-2.26.73l-3.37-2.48-1.59 1.54c-.47.45-1.26.32-1.47-.25l-.63-1.6Z" />
    </svg>
  );
}
function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
      <path d="M12.04 2.5c-5.24 0-9.5 4.26-9.5 9.5 0 1.67.44 3.3 1.27 4.74L2.5 21.5l4.88-1.28a9.46 9.46 0 0 0 4.66 1.22c5.24 0 9.5-4.26 9.5-9.5s-4.26-9.44-9.5-9.44Zm5.58 13.43c-.24.67-1.17 1.24-1.76 1.34-.45.08-1.04.14-3.03-.66-2.55-1.04-4.18-3.6-4.31-3.76-.12-.17-1.02-1.36-1.02-2.58 0-1.22.64-1.83.87-2.07.2-.21.53-.31.85-.31.1 0 .2 0 .28.01.28.01.43.02.62.48.24.57.8 1.97.87 2.11.07.14.11.3.02.48-.09.17-.15.27-.3.45-.14.17-.28.3-.42.47-.13.17-.26.35-.12.62.14.27.65 1.07 1.39 1.72.96.85 1.76 1.12 2.04 1.26.2.08.44.06.6-.13.2-.22.45-.6.72-.97.18-.27.44-.3.71-.19.27.1 1.71.81 2 .96.3.14.49.22.56.33.07.1.07.66-.17 1.34Z" />
    </svg>
  );
}
function ViberGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
      <path d="M13.36 1.69c-3.82-.51-7.8.35-10.5 3.21-2.13 2.2-2.7 5.42-2.8 8.41-.08 2.3.23 4.6 1.55 6.54.86 1.26 2.2 1.9 3.65 2.27v1.7c0 .65.67 1.04 1.21.68l2.24-1.52c.66.04 1.32.05 1.99 0 2.65-.2 5.17-1.25 6.93-3.27 1.98-2.27 2.54-5.36 2.51-8.29-.03-3.02-.74-6.15-3.03-8.22-1.04-.91-2.34-1.3-3.75-1.51Zm-1.32 11.4c-.15-.02-.27-.07-.39-.14-.72-.42-1.3-.97-1.74-1.66-.13-.2-.15-.4-.06-.63.1-.26.32-.44.56-.6.14-.09.18-.22.11-.4-.19-.47-.38-.93-.58-1.4-.11-.27-.44-.4-.71-.27-.63.3-1.09.86-1.1 1.58 0 1.43.68 2.7 1.67 3.7.7.71 1.52 1.2 2.48 1.46.51.14.95.01 1.3-.39.25-.3.31-.63.13-.97-.24-.44-.86-.7-1.67-.28Zm.95-5.4c1.35.19 2.12.98 2.25 2.36.01.18.1.33.29.37.2.04.35-.06.42-.26.02-.05.02-.11.02-.16-.03-1.78-1.13-2.95-2.93-3.09-.15-.01-.29.05-.36.2-.1.18-.02.37.16.46.05.03.1.04.15.05v.07Zm.83-1.86c1.82.33 2.82 1.46 2.96 3.33.02.21.1.38.33.4.21.03.38-.11.4-.35 0-.07.01-.15 0-.22-.2-2.26-1.58-3.67-3.82-3.92a.41.41 0 0 0-.44.3.38.38 0 0 0 .3.4c.09.03.18.05.27.06Zm.29 3.9c.02.22.11.39.35.39.22 0 .35-.15.35-.38-.01-.92-.72-1.62-1.63-1.62-.22 0-.37.16-.36.38 0 .22.15.35.38.35.57 0 .89.33.91.88Z" />
    </svg>
  );
}

const tgUrl = (prefill?: string) => telegramUrl(prefill);
const waUrl = (prefill?: string) =>
  `https://wa.me/${PHONE_DIGITS}${prefill ? `?text=${encodeURIComponent(prefill)}` : ""}`;
const viberUrl = () => `viber://chat?number=${encodeURIComponent("+" + PHONE_DIGITS)}`;

interface Props {
  /** Optional build context — used to prefill Telegram / WhatsApp messages. */
  buildName?: string;
  priceUah?: number;
  variant?: "inline" | "compact";
  className?: string;
}

export function ContactManager({
  buildName,
  priceUah,
  variant = "inline",
  className,
}: Props) {
  const prefill = buildName
    ? `Привіт! Маю питання по ${buildName}${
        typeof priceUah === "number" ? ` (${formatUah(priceUah)} ₴)` : ""
      }.`
    : undefined;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-wider text-muted-foreground",
          className,
        )}
      >
        <span>Є питання?</span>
        <a href={PHONE_HREF} className="tabular text-foreground hover:text-[color:var(--sku,currentColor)]">
          {PHONE_DISPLAY}
        </a>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface/60 p-3",
        className,
      )}
    >
      <div className="mb-2.5 flex items-start gap-2">
        <MessageCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Є питання по збірці?
          </div>
          <div className="text-sm text-foreground">
            Менеджер відповість за 15 хв
          </div>
        </div>
      </div>

      {/* Single row: phone (flex-1) · Telegram · WhatsApp · Viber */}
      <div className="flex items-center gap-2">
        <a
          href={PHONE_HREF}
          className={cn(
            "tabular flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3",
            "text-xs font-semibold uppercase tracking-wider text-foreground",
            "transition hover:border-white/25 active:scale-[0.98]",
          )}
        >
          <PhoneGlyph />
          <span className="truncate">{PHONE_DISPLAY}</span>
        </a>

        <Link
          href={tgUrl(prefill)}
          target="_blank"
          rel="noreferrer"
          aria-label="Написати в Telegram"
          title="Telegram"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md",
            "bg-[#229ED9] text-white transition hover:brightness-110 active:scale-95",
          )}
        >
          <TelegramGlyph />
        </Link>
        <Link
          href={waUrl(prefill)}
          target="_blank"
          rel="noreferrer"
          aria-label="Написати в WhatsApp"
          title="WhatsApp"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md",
            "bg-[#25D366] text-white transition hover:brightness-110 active:scale-95",
          )}
        >
          <WhatsAppGlyph />
        </Link>
        <Link
          href={viberUrl()}
          aria-label="Написати в Viber"
          title="Viber"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md",
            "bg-[#7360F2] text-white transition hover:brightness-110 active:scale-95",
          )}
        >
          <ViberGlyph />
        </Link>
      </div>
    </div>
  );
}

function PhoneGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5 fill-current">
      <path d="M19.23 15.26 16.69 15c-.61-.07-1.21.14-1.64.57l-1.84 1.84a15.12 15.12 0 0 1-6.62-6.62l1.85-1.85c.43-.43.64-1.03.57-1.64L8.74 4.77c-.12-1.01-.97-1.77-1.99-1.77H5c-1.15 0-2.11.96-2.04 2.11.54 8.69 7.49 15.63 16.17 16.17 1.15.07 2.11-.89 2.11-2.04v-1.75c.01-1.01-.75-1.86-1.76-1.97Z" />
    </svg>
  );
}
