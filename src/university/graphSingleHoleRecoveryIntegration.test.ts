import { describe, expect, it } from "vitest";
import { universityFamilies, makeUniversityTask, localizeUniversity, universityPool } from "./catalog";
import { searchCatalog, resolveCatalogCompetency } from "../catalogSearch";
import { singleHoleRecoveryFields } from "./graphSingleHoleRecovery";

/** This tests the *connected student route*, not only the isolated generator. */
describe("F05/e single-hole six-field catalog integration", () => {
  it("registers exactly one bilingual family, searchable by F05 and both language titles", () => {
    const families = universityFamilies.filter(f => f.id === "function-single-hole-recovery");
    expect(families).toHaveLength(1);
    expect(families[0].category).toBe("functions");
    expect(families[0].supportedDifficulties).toEqual(["hard", "advanced", "expert"]);
    expect(families[0].titles.pl).toContain("pustymi");
    expect(families[0].titles.en).toContain("hollow");
    expect(resolveCatalogCompetency("F05")?.familyIds).toContain("function-single-hole-recovery");
    expect(searchCatalog("F05").some(f => f.id === "function-single-hole-recovery")).toBe(true);
    expect(searchCatalog("hollow points").some(f => f.id === "function-single-hole-recovery")).toBe(true);
    expect(searchCatalog("pustymi kropkami").some(f => f.id === "function-single-hole-recovery")).toBe(true);
    expect(universityPool("functions", "hard").filter(t=>t.templateId === "function-single-hole-recovery")).toHaveLength(24);
    const task=makeUniversityTask("function-single-hole-recovery", 2, "hard");
    expect(task.university).toEqual({
      kind:"function-single-hole-recovery",
      hole:-3, base:-7, separation:2, rise:3,
      leftSlope:3, upSpan:4, downSpan:2, drop:1,
    });
    expect(task.contentKey).toContain('"kind":"function-single-hole-recovery"');
    for(const locale of ["pl","en"] as const) {
      const view=localizeUniversity(task,locale);
      expect(view.title).toBe(families[0].titles[locale]);
      expect(view.answer.kind).toBe("multi-choice");
      if(view.answer.kind === "multi-choice")
        expect(view.answer.fields.map(f=>f.id)).toEqual(singleHoleRecoveryFields);
      expect(view.solution?.length ?? 0).toBeGreaterThanOrEqual(7);
    }
  });
  it("keeps 72 distinct, index-stable profiles after catalog registration",()=>{
    const ids=new Set<string>(),keys=new Set<string>(),model=new Set<string>();
    for(const difficulty of ["hard","advanced","expert"] as const)
      for(let v=0;v<24;v++){
        const task=makeUniversityTask("function-single-hole-recovery",v,difficulty);
        ids.add(task.id);
        keys.add(task.contentKey);
        model.add(JSON.stringify(task.university));
        expect(task.parameters.variant).toBe(v);
      }
    expect(ids.size).toBe(72);
    expect(keys.size).toBe(72);
    expect(model.size).toBe(72);
  });
});
