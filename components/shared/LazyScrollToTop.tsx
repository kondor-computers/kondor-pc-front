"use client";

import dynamic from "next/dynamic";

export const LazyScrollToTop = dynamic(
  () =>
    import("@/components/shared/ScrollToTopButton").then(
      (m) => m.ScrollToTopButton,
    ),
  { ssr: false },
);
