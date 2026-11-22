import { describe, expect, it } from "vitest";
import { subjectCopy, subjectOrder, subjectStatus } from "./subjectRoadmap";

describe("subject expansion roadmap", () => {
  it.each(["pl","en"] as const)("includes playable frequency tables, bar charts, Mode and interpretation lessons in the %s Statistics scope",locale=>{
    const statistics=subjectCopy[locale].subjects.statistics;
    const interpretation=locale==="pl"?/interpretacj\S* statystyczn\S*/i:/statistical interpretation/i;
    const mode=locale==="pl"?/\bdominant\S*/i:/\bmode\b/i;
    const frequencies=locale==="pl"?/tabel\S* liczebności/i:/frequency tables/i;
    const charts=locale==="pl"?/wykres\S* słupkow\S*/i:/bar charts/i;
    expect(statistics.description).toMatch(charts);
    expect(statistics.description).toContain(locale==="pl"?"czytać tabele liczebności i obliczać udziały":"read frequency tables and calculate shares");
    expect(statistics.nextStep).toMatch(charts);
    expect(statistics.description).toMatch(frequencies);
    expect(statistics.nextStep).toMatch(frequencies);
    expect(statistics.description).toMatch(mode);
    expect(statistics.nextStep).toMatch(mode);
    expect(statistics.description).toMatch(interpretation);
    expect(statistics.nextStep).toMatch(interpretation);
    expect(statistics.description).toMatch(locale==="pl"?/nie jest pełny kurs/:/not a complete statistics course/);
  });
  it("keeps mathematics available and future subjects visibly non-released", () => {
    expect(subjectStatus.mathematics).toBe("available");
    for (const id of subjectOrder.filter((subject) => subject !== "mathematics")) {
      expect(subjectStatus[id]).not.toBe("available");
    }
  });

  it("provides complete Polish and English subject navigation", () => {
    for (const locale of ["pl", "en"] as const) {
      const copy = subjectCopy[locale];
      expect(copy.status["in-progress"]).toBe(locale === "pl" ? "W rozwoju" : "Work in progress");
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
