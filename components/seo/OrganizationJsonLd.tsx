import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export async function OrganizationJsonLd() {
  const organizationSchema = await organizationJsonLd();
  return <JsonLd data={[organizationSchema, websiteJsonLd()]} />;
}
