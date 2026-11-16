import { describe, expect, it } from "vitest";
import { subjectCopy, subjectOrder, subjectStatus } from "./subjectRoadmap";

describe("subject expansion roadmap", () => {
  it("keeps mathematics available and future subjects visibly non-released", () => {
    expect(subjectStatus.mathematics).toBe("available");
    for (const id of subjectOrder.filter((subject) => subject !== "mathematics")) {
      expect(subjectStatus[id]).not.toBe("available");
    }
  });

  it("provides complete Polish and English subject navigation", () => {
    for (const locale of ["pl", "en"] as const) {
      const copy = subjectCopy[locale];
      expect(copy.status["in-progress"]).toBe("Work in progress");
      for (const id of subjectOrder) {
        expect(copy.subjects[id].label.length).toBeGreaterThan(0);
        if (id !== "mathematics") {
          expect(copy.subjects[id].topics.length).toBeGreaterThan(0);
          expect(copy.subjects[id].nextStep.length).toBeGreaterThan(0);
        }
      }
      expect(copy.disclaimer).toMatch(locale === "pl" ? /nie ma jeszcze/ : /No exercises/);
    }
  });
});
