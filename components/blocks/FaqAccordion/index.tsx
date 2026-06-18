import { SectionHeader } from "@/components/shared/SectionHeader";
import { FaqBlock } from "@/components/shared/FaqBlock";
import type { ContentNode } from "@/lib/data/types/content";
import Image from "next/image";

type FaqItem = {
  question: string;
  answer: string;
  answerContent?: ContentNode[];
};

export function FaqAccordion({
  heading,
  items,
}: {
  heading?: string;
  items: FaqItem[];
}) {
  if (!items || items.length === 0) return null;
  const faqItems = items.map((it, index) => ({
    key: `faq-accordion-${index}`,
    scope: "build" as const,
    question: it.question,
    answer: it.answer,
    answerContent: it.answerContent,
  }));

  return (
    <div className="relative container-site py-16 md:py-20">
      <div className="hidden xl:block absolute top-[190px] left-[-10px] -z-10 w-[347px] h-auto aspect-[547/568]">
        <Image
          src="/images/blocks/faq-left.webp"
          alt="FAQ"
          width={547}
          height={568}
          className="object-cover"
        />
      </div>
      <div className="hidden xl:block absolute top-[140px] right-[20px] -z-10 w-[347px] h-auto aspect-[669/892]">
        <Image
          src="/images/blocks/faq-right.webp"
          alt="FAQ"
          width={669}
          height={892}
          className="object-cover"
        />
      </div>
      <SectionHeader
        kicker="FAQ"
        title={heading ?? "ЧАСТІ ПИТАННЯ"}
        titleClassName="mt-3"
      />

      <FaqBlock items={faqItems} className="mx-auto max-w-3xl" />
    </div>
  );
}
