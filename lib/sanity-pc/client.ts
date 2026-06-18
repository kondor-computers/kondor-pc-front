import { createClient } from "@sanity/client";

/**
 * Sanity client for PC content managed in kondor-pc-admin.
 * Kept separate from catalog Sanity project to avoid cross-project regressions.
 */
export const sanityPcClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PC_PROJECT_ID || "if6dzz62",
  dataset: process.env.NEXT_PUBLIC_SANITY_PC_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_PC_API_VERSION || "2026-05-01",
  useCdn: true,
  perspective: "published",
});

