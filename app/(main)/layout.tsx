import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RouteBreadcrumbs } from "@/components/shared/RouteBreadcrumbs";
import { NAV } from "@/components/layout/nav";
import { FooterWithNav, HeaderWithNav } from "./MainLayoutNav";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <OrganizationJsonLd />
      </Suspense>
      <Suspense fallback={<Header navItems={NAV} />}>
        <HeaderWithNav />
      </Suspense>
      <main className="overflow-hidden">
        <RouteBreadcrumbs />
        {children}
      </main>
      <Suspense fallback={<Footer navItems={NAV} />}>
        <FooterWithNav />
      </Suspense>
    </>
  );
}
