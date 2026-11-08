import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { SANITY_REVALIDATE_SECONDS } from "./revalidate";

/**
 * Next.js не приймає імпортовану константу в `export const revalidate`, тому
 * літерал у кожному page.tsx / route.ts доводиться дублювати вручну. Якщо один
 * забути, Next візьме МІНІМУМ серед усіх `revalidate` сторінки — і та сторінка
 * тихо лишиться на старому (меншому) TTL та знову перегенеровуватиметься частіше.
 */
function collectSegmentRevalidateLiterals(dir: string): Array<{ file: string; value: number }> {
  const found: Array<{ file: string; value: number }> = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...collectSegmentRevalidateLiterals(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      const src = fs.readFileSync(full, "utf8");
      const m = src.match(/^export const revalidate\s*=\s*(\d+)\b/m);
      if (m) found.push({ file: path.relative(process.cwd(), full), value: Number(m[1]) });
    }
  }
  return found;
}

describe("ISR TTL", () => {
  it("кожен `export const revalidate` в app/ дорівнює SANITY_REVALIDATE_SECONDS", () => {
    const literals = collectSegmentRevalidateLiterals(path.resolve(process.cwd(), "app"));
    expect(literals.length).toBeGreaterThan(0);

    const mismatched = literals.filter((l) => l.value !== SANITY_REVALIDATE_SECONDS);
    expect(
      mismatched,
      `Літерал revalidate має дорівнювати SANITY_REVALIDATE_SECONDS (${SANITY_REVALIDATE_SECONDS}): ` +
        mismatched.map((m) => `${m.file}=${m.value}`).join(", "),
    ).toEqual([]);
  });
});
