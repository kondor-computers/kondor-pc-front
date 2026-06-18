/**
 * Simplified Portable Text-compatible content model.
 * When Sanity is wired in, the adapter normalises real Portable Text into this
 * same shape — content blocks never change.
 */

export type InlineNode =
  | { type: "text"; text: string; bold?: boolean; italic?: boolean }
  | { type: "link"; text: string; href: string; external?: boolean };

export type ContentNode =
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "p"; children: InlineNode[] }
  | { type: "list"; ordered?: boolean; items: InlineNode[][] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "button"; label: string; href: string; newTab?: boolean };

export type ImageAsset = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
};

export type FeatureIcon =
  | "shield"
  | "truck"
  | "zap"
  | "tools"
  | "chart"
  | "cpu"
  | "headset"
  | "box";

export type FeatureItem = {
  /** Either a known icon name from FeatureIcon, an emoji, or "lucide:Name" (fallback for now). */
  icon: string;
  title: string;
  text: string;
};
