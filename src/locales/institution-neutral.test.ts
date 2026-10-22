import { describe, expect, it } from "vitest";
import { uiCopy } from "./ui";

describe("neutral educational presentation", () => {
  it("does not expose obsolete institutional disclaimers in either locale", () => {
    for (const locale of [uiCopy.pl, uiCopy.en]) {
      expect(locale.app).not.toHaveProperty("disclaimer");
      expect(JSON.stringify(locale)).not.toMatch(/\\bUWM\\b/i);
    }
  });
});
