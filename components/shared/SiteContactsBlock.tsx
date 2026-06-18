import type { SiteContacts } from "@/lib/sanity/siteContacts";
import {
  formatPhoneDisplay,
  phoneHref,
  telegramHref,
  telegramLabel,
} from "@/lib/sanity/siteContacts";

export function SiteContactsBlock({
  contacts,
  heading = "КОНТАКТИ",
}: {
  contacts: SiteContacts;
  heading?: string;
}) {
  return (
    <section>
      <h2 className="font-display mb-3 text-lg font-semibold md:text-xl">
        {heading}
      </h2>
      <ul className="space-y-2 text-muted-foreground">
        <li>
          <span>Email: </span>
          <a
            href={`mailto:${contacts.email}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {contacts.email}
          </a>
        </li>
        <li>
          <span>Telegram: </span>
          <a
            href={telegramHref(contacts.telegram)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {telegramLabel(contacts.telegram)}
          </a>
        </li>
        <li>
          <span>Телефон: </span>
          <a
            href={phoneHref(contacts.phone)}
            className="tabular font-medium text-foreground underline-offset-4 hover:underline"
          >
            {formatPhoneDisplay(contacts.phone)}
          </a>
        </li>
      </ul>
    </section>
  );
}
