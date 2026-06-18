import {
  Phone,
  MessageSquare,
  Mail,
  AtSign,
  Send,
} from "lucide-react";
import ArrowIcon from "@/components/icons/ArrowIcon";
import {
  ensureHttps,
  formatPhoneDisplay,
  getSiteContacts,
  phoneHref,
  telegramHref,
  telegramLabel,
} from "@/lib/sanity/siteContacts";

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external,
  note,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  note?: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background ring-1 ring-inset ring-white/5">
        <Icon className="size-4.5" strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="font-medium transition hover:opacity-80"
        >
          {value}
          {external && " ↗"}
        </a>
        {note && <div className="text-xs text-muted-foreground">{note}</div>}
      </div>
    </li>
  );
}

function ExternalLink({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-size="sm"
      data-variant="white"
      className="tech-btn font-heading uppercase text-center h-10 w-full px-3 text-[14px] md:text-[9px] lg:text-[14px] leading-[120%] font-normal tracking-normal"
    >
      <span aria-hidden className="tech-btn__edge" />
      <span aria-hidden className="tech-btn__fill" />
      <span className="relative inline-flex items-center">
        <span>{label}</span>
        <ArrowIcon className="size-5 -rotate-45" />
      </span>
    </a>
  );
}

export async function ContactsPanel() {
  const siteContacts = await getSiteContacts();

  return (
    <div className="space-y-4">
      <div className="space-y-4 h-auto">
        <div className="rounded-lg border border-border bg-surface pt-6 px-6 pb-[41px] h-auto">
          <div className="mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            Контакти
          </div>
          <ul className="space-y-4">
            {siteContacts ? (
              <>
                <ContactRow
                  icon={Phone}
                  label="Телефон"
                  value={formatPhoneDisplay(siteContacts.phone)}
                  href={phoneHref(siteContacts.phone)}
                  note="щодня 9:00–21:00"
                />
                <ContactRow
                  icon={MessageSquare}
                  label="Telegram"
                  value={telegramLabel(siteContacts.telegram)}
                  href={telegramHref(siteContacts.telegram)}
                  external
                />
                <ContactRow
                  icon={Mail}
                  label="Email"
                  value={siteContacts.email}
                  href={`mailto:${siteContacts.email}`}
                />
              </>
            ) : (
              <li className="text-sm text-muted-foreground">
                Контакти тимчасово недоступні.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-surface p-6 md:py-8.25 lg:py-6.25">
          <div className="mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
            Соцмережі
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {siteContacts?.telegramChatUrl && (
              <ExternalLink
                icon={MessageSquare}
                label="Telegram"
                href={ensureHttps(siteContacts.telegramChatUrl)}
              />
            )}
            {siteContacts?.instagramUrl && (
              <ExternalLink
                icon={AtSign}
                label="Instagram"
                href={ensureHttps(siteContacts.instagramUrl)}
              />
            )}
            {siteContacts?.youtubeUrl && (
              <ExternalLink
                icon={Send}
                label="YouTube"
                href={ensureHttps(siteContacts.youtubeUrl)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
