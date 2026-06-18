/** Normalize Sanity `datetime` for JSON-LD / ISO consumers. */
export function normalizeSanityDatetime(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (Number.isNaN(Date.parse(trimmed))) return undefined;

  return trimmed;
}
