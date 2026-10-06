"use client";

import { useEffect } from "react";

import { captureClickIds } from "@/lib/analytics/clickIds";

export function ClickIdTracker() {
  useEffect(() => {
    captureClickIds();
  }, []);

  return null;
}
