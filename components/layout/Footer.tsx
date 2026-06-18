import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import ArrowIcon from "@/components/icons/ArrowIcon";
import Image from "next/image";
import TagIcon from "../icons/TagIcon";
import { buildNavColumns, type NavEntry } from "@/components/layout/nav";
import {
  ensureHttps,
  formatPhoneDisplay,
  getSiteContacts,
  phoneHref,
} from "@/lib/sanity/siteContacts";

const CODE_SITE_URL = "https://www.code-site.art";

type FooterLink = { href: string; label: string; external?: boolean };
type Column = { title: string; links: FooterLink[] };

const LEGAL_COLUMN: Column = {
  title: "Юридична",
  links: [
    { href: "/legal/publichna-oferta", label: "Публічна оферта" },
    {
      href: "/legal/politika-konfidentsiynosti",
      label: "Політика конфіденційності",
    },
    { href: "/legal/pravova-informatsiya", label: "Реквізити" },
  ],
};

function buildSocialColumn(contacts: {
  telegramChatUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}): Column | null {
  const links: FooterLink[] = [];

  if (contacts.telegramChatUrl) {
    links.push({
      href: ensureHttps(contacts.telegramChatUrl),
      label: "Telegram",
      external: true,
    });
  }
  if (contacts.instagramUrl) {
    links.push({
      href: ensureHttps(contacts.instagramUrl),
      label: "Instagram",
      external: true,
    });
  }
  if (contacts.youtubeUrl) {
    links.push({
      href: ensureHttps(contacts.youtubeUrl),
      label: "YouTube",
      external: true,
    });
  }

  if (links.length === 0) return null;
  return { title: "Соцмережі", links };
}

const FOOTER_EXCLUDED_COLUMNS = new Set(["Промо"]);

export async function Footer({ navItems }: { navItems: NavEntry[] }) {
  const contacts = await getSiteContacts();
  const socialColumn = contacts ? buildSocialColumn(contacts) : null;
  const columns = [
    ...buildNavColumns(navItems).filter(
      (col) => !FOOTER_EXCLUDED_COLUMNS.has(col.title),
    ),
    LEGAL_COLUMN,
    ...(socialColumn ? [socialColumn] : []),
  ];

  return (
    <footer className="relative bg-background pt-[92px] pb-10 md:pb-5">
      <div className="container-site grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
        <div className="space-y-4 sm:col-span-2 md:col-span-3 lg:col-span-1">
          <Wordmark size="md" />
          <p className="max-w-sm text-[12px] leading-[120%] text-muted-foreground">
            Ігрові ПК під замовлення. Зібрано з гарантією 12 місяців від Kondor
            PC та оригінальною гарантією виробника.
          </p>
          {contacts && (
            <div className="text-xs text-muted-foreground">
              <div>
                <p className="mb-3 text-[14px] font-light leading-[120%] text-white">
                  Номер телефону
                </p>
                <a
                  href={phoneHref(contacts.phone)}
                  className="inline-block mb-5.5 transition hover:text-foreground text-[16px] leading-[120%]"
                >
                  {formatPhoneDisplay(contacts.phone)}
                </a>
              </div>
              <p className="mb-3 text-[14px] font-light leading-[120%] text-white">
                Email
              </p>
              <a
                href={`mailto:${contacts.email}`}
                className="inline-block mb-3.5 transition hover:text-foreground text-[16px] leading-[120%]"
              >
                {contacts.email}
              </a>
            </div>
          )}
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {col.title}
            </div>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  {"external" in l && l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
                    >
                      {l.label}{" "}
                      <ArrowIcon className="-rotate-45 text-muted-foreground size-4" />
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-muted-foreground transition hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative container-site lg:mt-5 md:flex md:items-center md:justify-between">
        <div className="py-5 md:pb-0 text-[14px] text-white uppercase font-heading">
          © 2020 - {new Date().getFullYear()} Kondor PC
        </div>
        <div className="mt-5 md:mr-[120px] lg:mr-[260px]">
          {" "}
          <p className="text-[8px] leading-[120%] font-medium uppercase">
            Created by:
          </p>
          <a
            href={CODE_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[13px] leading-[120%] font-heading"
          >
            CODE-SITE.ART <TagIcon className="mb-1" />
          </a>
        </div>
        <Image
          src="/images/footer/decor-desk.svg"
          alt="Footer background"
          width="416"
          height="184"
          className="hidden md:block md:right-[10px] lg:right-[160px] absolute bottom-[-20px] pointer-events-none"
        />
      </div>
      <Image
        src="/images/footer/decor-mob.svg"
        alt="Footer background"
        width="226"
        height="92"
        className="md:hidden left-0 absolute bottom-0 pointer-events-none"
      />
    </footer>
  );
}
