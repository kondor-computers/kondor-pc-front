import { createClient } from "@sanity/client";

/**
 * Sanity client for Kondor Devices (аксесуари: клавіатури, миші, поверхні).
 * Source of truth: kondor-devices-admin, projectId `qmszlzqu`, dataset `production`.
 */
export const sanityClient = createClient({
  projectId: "qmszlzqu",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  perspective: "published",
});
