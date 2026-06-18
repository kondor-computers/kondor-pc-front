import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/revalidate";

function isJsonLdObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Fetch and validate schema.org JSON uploaded via Sanity `seoSettings.schemaJson`. */
export async function fetchSchemaJsonLd(
  url?: string | null,
): Promise<object | object[] | null> {
  if (!url?.trim()) return null;

  try {
    const res = await fetch(url, {
      next: { revalidate: SANITY_REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;

    const parsed: unknown = await res.json();
    if (Array.isArray(parsed)) {
      const objects = parsed.filter(isJsonLdObject);
      return objects.length > 0 ? objects : null;
    }
    return isJsonLdObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
