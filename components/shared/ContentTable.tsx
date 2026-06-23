import { cn } from "@/lib/utils";

export type ContentTableRow = {
  cells?: string[];
};

function columnCount(rows: ContentTableRow[]): number {
  return Math.max(1, ...rows.map((row) => row.cells?.length ?? 0));
}

function gridTemplateColumns(count: number): string {
  if (count <= 1) return "1fr";
  return `1.2fr repeat(${count - 1}, minmax(0, 1fr))`;
}

/**
 * Generic CMS table — grid layout and surface styling match `FpsTable` on /pk/[slug].
 */
export function ContentTable({
  rows,
  className,
}: {
  rows: ContentTableRow[];
  className?: string;
}) {
  if (!rows.length) return null;

  const headerRow = rows[0];
  const dataRows = rows.slice(1);
  const columns = columnCount(rows);
  const gridCols = gridTemplateColumns(columns);

  const headerCells = headerRow?.cells ?? [];
  const paddedHeader = Array.from({ length: columns }, (_, i) => headerCells[i] ?? "");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border",
        className,
      )}
    >
      <div className="tabular">
        <div
          className="grid gap-px bg-border/50 text-xs uppercase text-muted-foreground"
          style={{ gridTemplateColumns: gridCols }}
        >
          {paddedHeader.map((cell, index) => (
            <div
              key={index}
              className={cn(
                "bg-surface px-2 py-3",
                index === 0 ? "text-left" : "text-center",
              )}
            >
              {cell}
            </div>
          ))}
        </div>

        {dataRows.length > 0 ? (
          <div className="grid gap-px bg-border/50">
            {dataRows.map((row, rowIndex) => {
              const cells = row.cells ?? [];
              const paddedCells = Array.from(
                { length: columns },
                (_, i) => cells[i] ?? "",
              );

              return (
                <div
                  key={rowIndex}
                  className="grid gap-px bg-border/50"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  {paddedCells.map((cell, cellIndex) => (
                    <div
                      key={cellIndex}
                      className={cn(
                        "flex min-h-11 items-center bg-surface px-2 py-2",
                        cellIndex === 0
                          ? "px-4 text-[8px] font-medium lg:text-[14px]"
                          : "justify-center text-[12px] lg:text-[14px] text-muted-foreground",
                      )}
                    >
                      {cellIndex === 0 ? (
                        <span className="line-clamp-2 leading-tight">{cell}</span>
                      ) : (
                        cell || "—"
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
