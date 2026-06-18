import { fetchSchemaJsonLd } from "@/lib/sanity/schemaJson";
import { JsonLd } from "@/lib/seo";
import type { PageSeo } from "@/types/blogPost";

function readSchemaTypes(entry: unknown): string[] {
  if (!entry || typeof entry !== "object") return [];
  const schemaType = (entry as { "@type"?: unknown })["@type"];
  if (typeof schemaType === "string") return [schemaType];
  if (Array.isArray(schemaType)) {
    return schemaType.filter((value): value is string => typeof value === "string");
  }
  return [];
}

function filterSchemaJsonByType(
  data: object | object[],
  excludedTypes: string[],
): object | object[] | null {
  if (excludedTypes.length === 0) return data;

  const excluded = new Set(excludedTypes.map((type) => type.trim()).filter(Boolean));
  if (excluded.size === 0) return data;

  const entries = Array.isArray(data) ? data : [data];
  const filtered = entries.filter((entry) => {
    const types = readSchemaTypes(entry);
    if (types.length === 0) return true;
    return !types.some((type) => excluded.has(type));
  });

  if (filtered.length === 0) return null;
  return Array.isArray(data) ? filtered : filtered[0];
}

export async function SchemaJsonFromUrl({
  url,
  excludeTypes = [],
}: {
  url?: string | null;
  excludeTypes?: string[];
}) {
  const data = await fetchSchemaJsonLd(url);
  if (!data) return null;
  const filtered = filterSchemaJsonByType(data, excludeTypes);
  if (!filtered) return null;
  return <JsonLd data={filtered} />;
}

export async function SchemaJsonFromSeo({
  seo,
  excludeTypes = [],
}: {
  seo?: PageSeo | null;
  excludeTypes?: string[];
}) {
  return <SchemaJsonFromUrl url={seo?.schemaJsonUrl} excludeTypes={excludeTypes} />;
}
