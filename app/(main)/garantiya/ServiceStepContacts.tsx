import { WarrantyContactInline } from "@/components/garantiya/WarrantyContactLinks";
import { getSiteContacts } from "@/lib/sanity/siteContacts";

export async function ServiceStepContacts() {
  const contacts = await getSiteContacts();
  return <WarrantyContactInline contacts={contacts} />;
}
