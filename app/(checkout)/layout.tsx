import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RouteBreadcrumbs } from "@/components/shared/RouteBreadcrumbs";
import { buildNav } from "@/components/layout/nav";
import { fetchLandingNavItems } from "@/lib/sanity/landingAdapter";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const promoLinks = await fetchLandingNavItems("promo").catch(() => []);
  const nav = buildNav([], promoLinks);

  return (
    <>
      <Header navItems={nav} />
      <main className="overflow-hidden">
        <RouteBreadcrumbs />
        {children}
      </main>
      <Footer navItems={nav} />
    </>
  );
}
