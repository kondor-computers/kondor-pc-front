import type { SiteContacts } from "@/lib/sanity/siteContacts";
import {
  formatPhoneDisplay,
  phoneHref,
  telegramHref,
  telegramLabel,
} from "@/lib/sanity/siteContacts";

const linkClass =
  "font-medium text-foreground underline-offset-4 hover:underline";

export function WarrantyContactInline({
  contacts,
}: {
  contacts: SiteContacts | null;
}) {
  if (!contacts) {
    return <span>Telegram, телефон або email</span>;
  }

  return (
    <>
      <a
        href={telegramHref(contacts.telegram)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Telegram {telegramLabel(contacts.telegram)}
      </a>
      {" · "}
      <a href={phoneHref(contacts.phone)} className={linkClass}>
        {formatPhoneDisplay(contacts.phone)}
      </a>
      {" · "}
      <a href={`mailto:${contacts.email}`} className={linkClass}>
        {contacts.email}
      </a>
    </>
  );
}
