import { ContentTable, type ContentTableRow } from "@/components/shared/ContentTable";

export function TableSection({
  heading,
  rows,
}: {
  heading?: string;
  rows: ContentTableRow[];
}) {
  if (!rows.length) return null;

  return (
    <div className="container-site py-16 md:py-20">
      {heading ? (
        <h2 className="mb-6 font-display text-[28px] font-bold uppercase leading-[120%] tracking-tight text-foreground lg:mb-8 lg:text-[40px]">
          {heading}
        </h2>
      ) : null}
      <ContentTable rows={rows} />
    </div>
  );
}
