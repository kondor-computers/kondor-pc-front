"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const MarqueeLine = dynamic(() => import("@/components/shared/MarqueeLine"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="h-9 lg:h-[72px] bg-brand-primary"
    />
  ),
});

export function LazyMarqueeLine(props: ComponentProps<typeof MarqueeLine>) {
  return <MarqueeLine {...props} />;
}
