import { cache } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { buildNav } from "@/components/layout/nav";
import { fetchLandingNavItems } from "@/lib/sanity/landingAdapter";
import { getSiteContacts, phoneHref } from "@/lib/sanity/siteContacts";

const loadNav = cache(async () => {
  const promoLinks = await fetchLandingNavItems("promo").catch(() => []);
  return buildNav([], promoLinks);
});

export async function HeaderWithNav() {
  const [nav, contacts] = await Promise.all([
    loadNav(),
    getSiteContacts().catch(() => null),
  ]);
  return (
    <Header
      navItems={nav}
      phoneHref={contacts ? phoneHref(contacts.phone) : undefined}
    />
  );
}

export async function FooterWithNav() {
  const nav = await loadNav();
  return <Footer navItems={nav} />;
}
