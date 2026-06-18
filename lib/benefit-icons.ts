/** Lucide icon names keyed by `buildBenefit.key` (see Sanity schema). */
const BENEFIT_ICON_BY_KEY: Record<string, string> = {
  assembly: "wrench",
  "stress-test": "flame",
  windows: "monitor",
  office: "file-text",
  "video-report": "camera",
  delivery: "truck",
  warranty: "shield",
  support: "message-circle",
  consult: "help-circle",
  return: "rotate-ccw",
};

export function benefitIconName(key: string): string {
  return BENEFIT_ICON_BY_KEY[key] ?? key;
}
