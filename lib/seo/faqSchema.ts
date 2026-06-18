import type { Section } from "@/lib/data/types";
import type { BlogFaqItem } from "@/types/blogPost";

export type FaqSchemaItem = { question: string; answer: string };

/** FAQ items from landing `faqAccordion` sections (game-pc / promo). */
export function extractLandingFaqSchemaItems(
  sections: Section[],
): FaqSchemaItem[] {
  const out: FaqSchemaItem[] = [];

  for (const section of sections) {
    if (section._type !== "faqAccordion") continue;
    const items = section.items;
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      const row = item as { question?: string; answer?: string };
      const question = row.question?.trim();
      const answer = row.answer?.trim();
      if (question && answer) {
        out.push({ question, answer });
      }
    }
  }

  return out;
}

export function blogFaqToSchemaItems(
  items: BlogFaqItem[] | undefined,
): FaqSchemaItem[] {
  if (!items?.length) return [];
  return items
    .filter((item) => item.question?.trim() && item.answer?.trim())
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }));
}
