import type { TrustSignal } from "@/types/build";

export const TRUST_SIGNALS: TrustSignal[] = [
  { key: "total_builds", value: "5000+", label: "зібраних ПК" },
  { key: "years_active", value: "6", label: "років на ринку" },
  {
    key: "instagram_followers",
    value: "64 тис.",
    label: "підписників в Instagram",
  },
  { key: "reviews_count", value: "500+", label: "Відгуків instagram" },
  { key: "warranty_max_years", value: "до 3", label: "років гарантії" },
];
