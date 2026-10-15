import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RouteBreadcrumbs } from "@/components/shared/RouteBreadcrumbs";
import { buildNav } from "@/components/layout/nav";
import { fetchLandingNavItems } from "@/lib/sanity/landingAdapter";
import {
  getSiteContacts,
  headerContactLinks,
} from "@/lib/sanity/siteContacts";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [promoLinks, contacts] = await Promise.all([
    fetchLandingNavItems("promo").catch(() => []),
    getSiteContacts().catch(() => null),
  ]);
  const nav = buildNav([], promoLinks);

  return (
    <>
      <Header navItems={nav} contacts={headerContactLinks(contacts)} />
      <main className="overflow-hidden">
        <RouteBreadcrumbs />
        {children}
      </main>
      <Footer navItems={nav} />
    </>
  );
}
