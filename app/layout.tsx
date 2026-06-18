import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Montserrat, Unbounded } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const GTM_ID = "GTM-KWHVVR26";
import { LazyCartDrawer } from "@/components/cart/LazyCartDrawer";
import { LazyScrollToTop } from "@/components/shared/LazyScrollToTop";

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const unbounded = Unbounded({
  variable: "--font-heading",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

// Latin-only display face (Cyrillic falls through to Unbounded via the
// unicode-range @font-face in globals.css). It is never used by the Cyrillic
// hero H1, so we skip preloading it to free 4G bandwidth for the LCP image.
const zenterSP = localFont({
  src: "../public/fonts/ZenterSPDemo.woff2",
  variable: "--font-display",
  display: "swap",
  preload: false,
});

const metadataBase = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kondor-pc.ua");
  } catch {
    return new URL("https://kondor-pc.ua");
  }
})();

export const metadata: Metadata = {
  title: {
    default: "Kondor PC — Ігрові ПК під замовлення",
    template: "%s · Kondor PC",
  },
  description:
    "Готові ігрові ПК з реальними FPS, гарантією та доставкою Новою Поштою. Підбір під твої ігри та бюджет.",
  metadataBase,
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: "Kondor PC",
  },
  // Pre-launch: hard-block all crawlers. Flip together with robots.ts when
  // we go live. See app/robots.ts for the launch checklist.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${montserrat.variable} ${unbounded.variable} ${zenterSP.variable}`}
    >
      <body>
        <GoogleTagManager gtmId={GTM_ID} />
        {children}
        <LazyCartDrawer />
        <LazyScrollToTop />
        {/* No-JS fallback: scroll-reveal relies on IntersectionObserver, which
            never runs without JS, leaving content at opacity: 0. There is no
            reliable CSS-only way to detect disabled JS (`@media (scripting:
            none)` does not match when JS is turned off via DevTools), so we use
            <noscript> to force the content visible for no-JS clients and
            crawlers that do not execute scripts. */}
        <noscript>
          <style>{`.reveal-init{opacity:1!important;transform:none!important;transition:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
