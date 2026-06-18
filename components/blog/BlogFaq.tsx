import type { BlogFaqItem } from "@/types/blogPost";
import { FaqBlock } from "@/components/shared/FaqBlock";

interface BlogFaqProps {
  items: BlogFaqItem[];
  uniqueKey: string;
}

export default function BlogFaq({ items, uniqueKey }: BlogFaqProps) {
  if (!items.length) return null;

  const faqItems = items.map((it, i) => ({
    key: `${uniqueKey}-${it._key ?? i}`,
    scope: "seo" as const,
    question: it.question,
    answer: it.answer,
    answerContent: it.answerContent,
  }));

  return (
    <section className="py-12 md:py-16">
      <h2 className="mb-6 font-display text-[22px] font-bold uppercase leading-[120%] text-foreground lg:text-[32px]">
        Часті питання
      </h2>

      <FaqBlock items={faqItems} />
    </section>
  );
}
