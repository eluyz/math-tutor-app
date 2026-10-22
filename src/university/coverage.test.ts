import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { allTemplates } from "../generators";

it("the 64-topic coverage map has one valid, evidenced row per Issue #20 code", () => {
  const doc = readFileSync(new URL("../../CURRICULUM_COVERAGE.md", import.meta.url), "utf8");
  const rows = doc.split("\n").filter((line) => /^\| [MUCFGD IW]\d{2} \|/.test(line));
  const expected = [
    ["M",14],["U",8],["C",6],["F",7],["G",8],["D",10],["I",8],["W",3],
  ].flatMap(([prefix,count]) => Array.from({length:Number(count)},(_,i) => `${prefix}${String(i+1).padStart(2,"0")}`));
  expect(rows).toHaveLength(64);
  expect(new Set(rows.map(row => row.split("|")[1].trim()))).toEqual(new Set(expected));
  const ids = new Set(allTemplates.map(template => template.id));
  for (const row of rows) {
    const fields = row.split("|").map(field => field.trim());
    expect(["pokryte","częściowo","brak","teoria","do weryfikacji"]).toContain(fields[3]);
    for (const match of fields[4].matchAll(/`([a-z][a-z0-9-]+)`/g))
      expect(ids.has(match[1]),`${fields[1]} refers to unknown ${match[1]}`).toBe(true);
  }
  expect(doc).toContain("Pełne pokrycie wymaga weryfikacji każdego typu zadania, rozwiązania i testu.");
});
