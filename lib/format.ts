// Non-breaking space as the thousands separator. We format manually instead of
// relying on Intl.NumberFormat("uk-UA"), whose grouping separator (U+202F vs
// U+00A0) differs between the server ICU and the browser ICU and triggers React
// hydration mismatches (error #418).
const GROUP_SEPARATOR = "\u00A0";

export function formatUah(amount: number): string {
  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
  return isNegative ? `-${grouped}` : grouped;
}

export function formatPrice(amount: number): string {
  return `${formatUah(amount)} ₴`;
}

export function formatInstallment(total: number, parts: number): string {
  const per = Math.round(total / parts);
  return `${parts} × ${formatUah(per)} ₴`;
}
