import type { ContentNode, InlineNode } from "@/lib/data/types/content";

function renderInline(node: InlineNode, i: number) {
  if (node.type === "link") {
    return (
      <a
        key={i}
        href={node.href}
        {...(node.external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="text-brand-primary underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {node.text}
      </a>
    );
  }
  let el: React.ReactNode = node.text;
  if (node.bold) el = <strong className="text-foreground">{el}</strong>;
  if (node.italic) el = <em>{el}</em>;
  return <span key={i}>{el}</span>;
}

/**
 * Renders the simplified Portable Text-compatible ContentNode[] format.
 * Shared between TextBlock and ImageTextSplit — do not duplicate this logic.
 */
export function RichContent({ nodes }: { nodes: ContentNode[] }) {
  return (
    <div className="text-[14px] leading-relaxed text-muted-foreground lg:text-[16px]">
      {nodes.map((node, i) => {
        switch (node.type) {
          case "h2":
            return (
              <h2
                key={i}
                id={node.id}
                className="mt-12 mb-4 font-display text-[24px] font-bold uppercase leading-[120%] tracking-tight text-foreground lg:text-[36px]"
              >
                {node.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                id={node.id}
                className="mt-8 mb-3 font-heading text-[18px] font-semibold uppercase tracking-wide text-foreground lg:text-[20px]"
              >
                {node.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="mt-4">
                {node.children.map(renderInline)}
              </p>
            );
          case "list": {
            const Tag = node.ordered ? "ol" : "ul";
            return (
              <Tag
                key={i}
                className={`mt-4 ml-6 space-y-2 ${
                  node.ordered ? "list-decimal" : "list-disc"
                } marker:text-brand-primary`}
              >
                {node.items.map((children, j) => (
                  <li key={j}>{children.map(renderInline)}</li>
                ))}
              </Tag>
            );
          }
          case "quote":
            return (
              <blockquote
                key={i}
                className="mt-6 border-l-2 border-brand-primary pl-4 italic text-foreground/80"
              >
                {node.text}
                {node.cite ? (
                  <cite className="mt-2 block text-sm not-italic text-muted-foreground/80">
                    — {node.cite}
                  </cite>
                ) : null}
              </blockquote>
            );
        }
      })}
    </div>
  );
}
