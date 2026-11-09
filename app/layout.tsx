import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { ClickIdTracker } from "@/components/analytics/ClickIdTracker";
import { Montserrat, Unbounded } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-KWHVVR26";
import { Suspense } from "react";
import { LazyCartDrawer } from "@/components/cart/LazyCartDrawer";
import { LazyScrollToTop } from "@/components/shared/LazyScrollToTop";
import { ScrollTopOnNavigate } from "@/components/shared/ScrollTopOnNavigate";

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

// Display face behind `.font-display` / `.font-wide` (see globals.css).
// It is never used by the Cyrillic hero H1, so we skip preloading it to free
// 4G bandwidth for the LCP image.
//
// Declared ONCE, here. Do not add a second @font-face for this file in
// globals.css: family names that differ only by case ("zenterSP" vs
// "ZenterSP") are the same family, and the identical bytes were downloaded
// twice (once from /_next/static/media, once from /fonts).
//
// ZenterSP has the Russian Cyrillic letters but not the Ukrainian ones
// (і, ї, є, ґ), so in Ukrainian headings it draws Г, Р, О, В, … and the
// missing letters fall through to Unbounded. That is how the site has always
// rendered and it is unchanged. Restricting Zenter to Latin with
// `declarations: [{ prop: "unicode-range", … }]` has no effect under
// Turbopack (checked on Next 15.5), so it cannot be done from here.
//
// `adjustFontFallback: false` keeps the generated "zenterSP Fallback" (Arial)
// face out of `--font-display`; otherwise і/ї/є/ґ would fall to Arial instead
// of Unbounded.
const zenterSP = localFont({
  src: "../public/fonts/ZenterSPDemo.woff2",
  variable: "--font-display",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
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
        <ClickIdTracker />
        <Suspense fallback={null}>
          <ScrollTopOnNavigate />
        </Suspense>
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
