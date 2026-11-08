import { describe, expect, it } from "vitest";
import { universityFamilies, makeUniversityTask, localizeUniversity, universityPool } from "./catalog";
import { searchCatalog, resolveCatalogCompetency } from "../catalogSearch";
import { evenOpenRangeFields } from "./graphEvenOpenRange";

describe("F05/b integrated catalog and competency discovery", () => {
  it("publishes exactly one family with correct levels, search and a 6-field task", () => {
    const matches = universityFamilies.filter(f => f.id === "function-even-open-range");
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("functions");
    expect(matches[0].supportedDifficulties).toEqual(["hard", "advanced", "expert"]);
    expect(matches[0].titles.pl).toContain("parzystego");
    expect(matches[0].titles.en).toContain("even graph");
    expect(resolveCatalogCompetency("F05")?.familyIds).toContain("function-even-open-range");
    expect(searchCatalog("F05").some(f => f.id === "function-even-open-range")).toBe(true);
    expect(searchCatalog("holes").some(f => f.id === "function-even-open-range")).toBe(true);
    expect(searchCatalog("dziurami").some(f => f.id === "function-even-open-range")).toBe(true);
    expect(universityPool("functions", "hard").filter(t => t.templateId === "function-even-open-range")).toHaveLength(24);
    const task = makeUniversityTask("function-even-open-range", 2, "hard");
    expect(task.university).toEqual({kind:"function-even-open-range",hole:3,floor:-3,lift:3,slope:3});
    expect(task.templateId).toBe("function-even-open-range");
    expect(task.contentKey).toContain('"kind":"function-even-open-range"');
    for (const locale of ["pl", "en"] as const) {
      const view = localizeUniversity(task, locale);
      expect(view.title).toBe(matches[0].titles[locale]);
      expect(view.answer.kind).toBe("multi-choice");
      if (view.answer.kind === "multi-choice")
        expect(view.answer.fields.map(f => f.id)).toEqual(evenOpenRangeFields);
    }
  });
  it("generates 72 mathematically distinct profiles with stable unique content keys", () => {
    const ids = new Set<string>(), keys = new Set<string>(), geometries = new Set<string>();
    for (const difficulty of ["hard", "advanced", "expert"] as const)
      for (let v = 0; v < 24; v++) {
        const task = makeUniversityTask("function-even-open-range", v, difficulty);
        ids.add(task.id);
        keys.add(task.contentKey);
        geometries.add(JSON.stringify(task.university));
        expect(task.parameters.variant).toBe(v);
      }
    expect(ids.size).toBe(72);
    expect(keys.size).toBe(72);
    expect(geometries.size).toBe(72);
  });
});
