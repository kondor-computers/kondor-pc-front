/**
 * TZ §6.2.3 Block 2: FPS bucketing for the UX color markers.
 * Newbies don't know if 60 FPS is good; thresholds + labels make it readable.
 */
export type FpsTier = "green" | "yellow" | "orange" | "red";

export function fpsTier(fps: number): FpsTier {
  if (fps >= 144) return "green";
  if (fps >= 60) return "yellow";
  if (fps >= 30) return "orange";
  return "red";
}

export const FPS_TIER_META: Record<
  FpsTier,
  { label: string; note: string; colorVar: string }
> = {
  green: {
    label: "комфортно",
    note: "підходить для кіберспорту",
    colorVar: "var(--fps-green)",
  },
  yellow: {
    label: "стабільно",
    note: "грається без проблем",
    colorVar: "var(--fps-yellow)",
  },
  orange: {
    label: "з обмеженнями",
    note: "на знижених налаштуваннях",
    colorVar: "var(--fps-orange)",
  },
  red: {
    label: "не рекомендуємо",
    note: "надто низький FPS",
    colorVar: "var(--fps-red)",
  },
};
