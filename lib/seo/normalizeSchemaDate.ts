export function normalizeSchemaDate(value: string): string {
  const trimmed = value.trim();
  if (/([+-]\d{2}:\d{2}|Z)$/i.test(trimmed)) return trimmed;
  if (/T/.test(trimmed)) return `${trimmed}+03:00`;
  return `${trimmed}T00:00:00+03:00`;
}
