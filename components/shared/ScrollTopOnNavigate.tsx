"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Next.js 15's App Router scroll-to-top on <Link> navigation is unreliable
 * once a page has any Suspense/`dynamic(..., { ssr:false })` boundaries: the
 * router's "is the new page already visible in the viewport?" check can run
 * before those boundaries have mounted/measured, so it wrongly concludes the
 * old scroll position is still valid and never resets it. In production this
 * means clicking a product card near the bottom of a long catalog page can
 * land you at the *bottom* of the (usually shorter) product page instead of
 * the top. See e.g. https://github.com/vercel/next.js/issues/74485.
 *
 * This component force-resets scroll on every real forward navigation, while
 * leaving the browser's own back/forward scroll restoration untouched (we
 * skip the reset right after a `popstate` event).
 */
export function ScrollTopOnNavigate() {
  const pathname = usePathname();
  const isPopNavigation = useRef(false);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const onPopState = () => {
      isPopNavigation.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;

    if (isPopNavigation.current) {
      // Back/forward — let the browser's native scroll restoration handle it.
      isPopNavigation.current = false;
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
