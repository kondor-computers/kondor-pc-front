export type TestimonialSource = "google_maps" | "telegram" | "instagram";

export type Testimonial = {
  id: string;
  author: string;
  source: TestimonialSource;
  verified: boolean;
  body: string;
  buildSlug?: string;
  gameTags: string[];
};
