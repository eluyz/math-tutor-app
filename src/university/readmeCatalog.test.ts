import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { allTemplates } from "../generators";

it("README catalog summary matches the actual Mathematics exercise families", () => {
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  const heading = readme.match(/Mathematics catalog contains \*\*(\d+) exercise families\*\*/);
  expect(heading, "README must state the current Mathematics family count in English").not.toBeNull();
  expect(Number(heading![1])).toBe(allTemplates.length);

  // The overview must describe browsing all families without claiming that
  // every generated exercise has received independent external review.
  expect(readme).toContain("The Mathematics catalog contains");
  expect(readme).toContain("generator outputs");
  expect(readme).toContain("not");
  expect(readme).toContain("independently reviewed");
  expect(readme).toContain("choose an available topic".replace("choose","Choose"));
});
