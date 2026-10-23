import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { allTemplates } from "../generators";

it("README current catalog size matches the actual list of exercise families", () => {
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  const heading = readme.match(/Zawiera \*\*(\d+) rodzin(?:y)?\*\*/);
  expect(heading, "README must state current catalog size").not.toBeNull();
  expect(Number(heading![1])).toBe(allTemplates.length);
  const searchParagraph = readme.split("\n").find(line => line.startsWith("**Szukaj rodziny zadań"));
  expect(searchParagraph).toBeDefined();
  expect(searchParagraph).toContain("wszystkie dostępne rodziny");
  expect(searchParagraph).not.toMatch(/wszystkie \d+ rodzin/);
});
