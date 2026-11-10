import { describe, expect, it } from "vitest";
import { universityFamilies, makeUniversityTask, localizeUniversity, universityPool } from "./catalog";
import { resolveCatalogCompetency, searchCatalog } from "../catalogSearch";
import { asymptoticJumpFields } from "./graphAsymptoticJump";

describe("F05/f six-field asymptotic-jump student route",()=>{
  it("registers a bilingual F05 family and preserves all six graded fields",()=>{
    const families=universityFamilies.filter(f=>f.id==="function-asymptotic-jump-injective");
    expect(families).toHaveLength(1);
    expect(families[0].category).toBe("functions");
    expect(families[0].supportedDifficulties).toEqual(["hard","advanced","expert"]);
    expect(resolveCatalogCompetency("F05")?.familyIds)
      .toContain("function-asymptotic-jump-injective");
    expect(searchCatalog("F05").some(f=>f.id==="function-asymptotic-jump-injective")).toBe(true);
    expect(searchCatalog("asymptotes").some(f=>f.id==="function-asymptotic-jump-injective")).toBe(true);
    expect(searchCatalog("asymptoty").some(f=>f.id==="function-asymptotic-jump-injective")).toBe(true);
    expect(universityPool("functions","hard")
      .filter(t=>t.templateId==="function-asymptotic-jump-injective")).toHaveLength(24);
    const task=makeUniversityTask("function-asymptotic-jump-injective",2,"hard");
    expect(task.university).toEqual({
      kind:"function-asymptotic-jump-injective",A:-5,k:3,B:0,h:2,
    });
    expect(task.contentKey).toContain('"kind":"function-asymptotic-jump-injective"');
    for(const locale of ["pl","en"] as const){
      const local=localizeUniversity(task,locale);
      expect(local.answer.kind).toBe("multi-choice");
      if(local.answer.kind!=="multi-choice")throw Error("Six-field expected");
      expect(local.answer.fields.map(f=>f.id)).toEqual(asymptoticJumpFields);
      expect(local.solution?.length??0).toBeGreaterThanOrEqual(7);
    }
  });
  it("supplies 72 new stable IDs without modifying previous jump families",()=>{
    const ids=new Set<string>(),keys=new Set<string>(),models=new Set<string>();
    for(const level of ["hard","advanced","expert"] as const)
      for(let v=0;v<24;v++){
        const task=makeUniversityTask("function-asymptotic-jump-injective",v,level);
        ids.add(task.id);keys.add(task.contentKey);
        models.add(JSON.stringify(task.university));
        expect(task.parameters.variant).toBe(v);
      }
    expect(ids.size).toBe(72);expect(keys.size).toBe(72);expect(models.size).toBe(72);
    expect(universityFamilies.filter(f=>f.id==="function-integrated-jump")).toHaveLength(1);
    expect(universityFamilies.filter(f=>f.id==="function-jump-gap-unbounded")).toHaveLength(1);
  });
});
