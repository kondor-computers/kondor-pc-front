"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Faq } from "@/types/build";
import type { ContentNode, InlineNode } from "@/lib/data/types/content";
import { TechButtonLink } from "@/components/shared/TechButtonPrimitives";

const URL_SPLIT_RE = /(https?:\/\/[^\s]+)/g;
const URL_TEST_RE = /^https?:\/\/[^\s]+$/;

const FAQ_ANSWER_TEXT_CLASS =
  "text-[12px] lg:text-[14px] leading-[120%] text-black";

function resolveLink(url: string): { href: string; label: string; external: boolean } {
  const tg = url.match(/^https?:\/\/t\.me\/(.+)$/);
  if (tg) return { href: url, label: `@${tg[1]}`, external: true };

  const pidbir = url.match(/^https?:\/\/[^/]+(\/pidbir\/?)$/);
  if (pidbir) return { href: "/pidbir", label: "Підбір ПК", external: false };

  return { href: url, label: url, external: true };
}

const faqLinkClassName =
  "font-medium !text-black !no-underline underline-offset-2 transition-all hover:!underline";

function renderFaqInline(node: InlineNode, i: number) {
  if (node.type === "link") {
    return (
      <a
        key={i}
        href={node.href}
        {...(node.external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className={faqLinkClassName}
      >
        {node.text}
      </a>
    );
  }
  let el: React.ReactNode = node.text;
  if (node.bold) el = <strong>{el}</strong>;
  if (node.italic) el = <em>{el}</em>;
  return <span key={i}>{el}</span>;
}

function FaqAnswerContent({ nodes }: { nodes: ContentNode[] }) {
  if (nodes.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2 ${FAQ_ANSWER_TEXT_CLASS}`}>
      {nodes.map((node, i) => {
        switch (node.type) {
          case "p":
            return (
              <p key={i}>
                {node.children.map(renderFaqInline)}
              </p>
            );
          case "list": {
            const Tag = node.ordered ? "ol" : "ul";
            return (
              <Tag
                key={i}
                className={`ml-4 space-y-1 ${
                  node.ordered ? "list-decimal" : "list-disc"
                }`}
              >
                {node.items.map((children, j) => (
                  <li key={j}>{children.map(renderFaqInline)}</li>
                ))}
              </Tag>
            );
          }
          case "button":
            return (
              <div key={i} className="mt-2">
                <TechButtonLink
                  href={node.href}
                  size="sm"
                  variant="primary"
                  className="h-[36px] px-5 text-[12px] lg:text-[14px] !no-underline hover:!no-underline"
                  target={node.newTab ? "_blank" : undefined}
                  rel={node.newTab ? "noopener noreferrer" : undefined}
                >
                  {node.label}
                </TechButtonLink>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function renderAnswer(text: string) {
  return text.split(URL_SPLIT_RE).map((part, i) => {
    if (!URL_TEST_RE.test(part)) return part;
    const trailing = part.match(/[.,;]+$/)?.[0] ?? "";
    const url = trailing ? part.slice(0, -trailing.length) : part;
    const { href, label, external } = resolveLink(url);
    return (
      <span key={i}>
        <a
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className={faqLinkClassName}
        >
          {label}
        </a>
        {trailing}
      </span>
    );
  });
}

function FaqRow({ f }: { f: Faq }) {
  const hasRichAnswer = Boolean(f.answerContent && f.answerContent.length > 0);

  return (
    <AccordionItem value={f.key} className="border-0">
      <AccordionTrigger className="text-left hover:no-underline [&_svg]:text-muted-foreground bg-white text-black p-5">
        <span className="inline-block mr-3 text-[12px] lg:text-[14px] font-medium leading-[120%]">
          {f.question}
        </span>
      </AccordionTrigger>
      <AccordionContent className={`p-5 mt-0.5 ${FAQ_ANSWER_TEXT_CLASS} bg-white rounded-[8px]`}>
        {hasRichAnswer ? (
          <FaqAnswerContent nodes={f.answerContent!} />
        ) : (
          renderAnswer(f.answer)
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export function FaqBlock({
  items,
  className,
  collapseAfter = 4,
}: {
  items: Faq[];
  className?: string;
  collapseAfter?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const canCollapse =
    typeof collapseAfter === "number" && items.length > collapseAfter;
  const baseItems = canCollapse ? items.slice(0, collapseAfter) : items;
  const extraItems = canCollapse ? items.slice(collapseAfter) : [];

  return (
    <div className="flex flex-col gap-5">
      <Accordion
        hiddenUntilFound
        className={`divide-y divide-border overflow-hidden rounded-lg border border-border gap-2 ${className ?? ""}`}
      >
        {baseItems.map((f) => (
          <FaqRow key={f.key} f={f} />
        ))}

        {canCollapse && (
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-2 divide-y divide-border">
                {extraItems.map((f) => (
                  <FaqRow key={f.key} f={f} />
                ))}
              </div>
            </div>
          </div>
        )}
      </Accordion>

      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mx-auto rounded-lg border border-border bg-white px-6 py-3 text-[12px] lg:text-[14px] font-medium text-black transition-colors hover:bg-black/5"
        >
          {expanded ? "Показати менше" : "Показати більше"}
        </button>
      )}
    </div>
  );
}
