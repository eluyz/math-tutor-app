import { describe, expect, it } from "vitest";
import { universityFamilies, makeUniversityTask, localizeUniversity, universityPool } from "./catalog";
import { searchCatalog, resolveCatalogCompetency } from "../catalogSearch";
import { jumpGapFields } from "./graphJumpGapUnbounded";

describe("F05/c six-property graph integrated student route",()=>{
  it("is discoverable by F05 and its bilingual title and is graded as one graph",()=>{
    const families=universityFamilies.filter(f=>f.id==="function-jump-gap-unbounded");
    expect(families).toHaveLength(1);
    expect(families[0].category).toBe("functions");
    expect(families[0].supportedDifficulties).toEqual(["hard","advanced","expert"]);
    expect(resolveCatalogCompetency("F05")?.familyIds).toContain("function-jump-gap-unbounded");
    expect(searchCatalog("F05").some(f=>f.id==="function-jump-gap-unbounded")).toBe(true);
    expect(searchCatalog("skok").some(f=>f.id==="function-jump-gap-unbounded")).toBe(true);
    expect(searchCatalog("unbounded").some(f=>f.id==="function-jump-gap-unbounded")).toBe(true);
    expect(universityPool("functions","hard").filter(t=>t.templateId==="function-jump-gap-unbounded"))
      .toHaveLength(24);
    const task=makeUniversityTask("function-jump-gap-unbounded",2,"hard");
    expect(task.university.kind).toBe("function-jump-gap-unbounded");
    expect(task.contentKey).toContain('"kind":"function-jump-gap-unbounded"');
    for(const locale of ["pl","en"] as const){
      const local=localizeUniversity(task,locale);
      expect(local.title).toBe(families[0].titles[locale]);
      expect(local.answer.kind).toBe("multi-choice");
      if(local.answer.kind!=="multi-choice")throw Error("Expected six fields");
      expect(local.answer.fields.map(f=>f.id)).toEqual(jumpGapFields);
      expect(local.solution?.length??0).toBeGreaterThanOrEqual(7);
    }
  });
  it("keeps 72 stable generated profiles and no old family modifications",()=>{
    const ids=new Set<string>(),keys=new Set<string>(),geometries=new Set<string>();
    for(const level of ["hard","advanced","expert"] as const)
      for(let v=0;v<24;v++){
        const task=makeUniversityTask("function-jump-gap-unbounded",v,level);
        ids.add(task.id);
        keys.add(task.contentKey);
        geometries.add(JSON.stringify(task.university));
        expect(task.parameters.variant).toBe(v);
      }
    expect(ids.size).toBe(72);
    expect(keys.size).toBe(72);
    expect(geometries.size).toBe(72);
    expect(universityFamilies.filter(f=>f.id==="function-integrated-jump")).toHaveLength(1);
    expect(universityFamilies.filter(f=>f.id==="function-single-hole-recovery")).toHaveLength(1);
  });
});
