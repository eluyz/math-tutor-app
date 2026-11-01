import { describe, expect, it } from "vitest";
import { allTemplates, difficulties, taskPool } from "./generators";
import { categoryTitle, normalizeCatalogQuery, resolveCatalogCompetency, searchCatalog, selectCatalogFamily } from "./catalogSearch";

describe("catalog search and selection", () => {
  it("resolves all 64 curated codes without claiming full syllabus acceptance", async () => {
    const { competencyIndex } = await import("./competencyIndex");
    expect(Object.keys(competencyIndex)).toHaveLength(64);
    for (const [code, entry] of Object.entries(competencyIndex)) {
      expect(["bounded", "partial"]).toContain(entry.coverage);
      expect(entry.familyIds.length).toBeGreaterThan(0);
      expect(new Set(entry.familyIds).size).toBe(entry.familyIds.length);
      const realFamilyIds = new Set(allTemplates.map((family) => family.id));
      for (const familyId of entry.familyIds) {
        expect(realFamilyIds.has(familyId), `${code}: unknown family ${familyId}`).toBe(true);
      }
      const found = searchCatalog(code);
      expect(found.length).toBeGreaterThan(0);
      expect(found.every((family) => entry.familyIds.includes(family.id))).toBe(true);
    }
  });

  it("searches competency codes, space-tolerant codes and curated PL/EN aliases", () => {
    for (const query of ["M03", "m3", "M 03", "mnozenie macierzy", "matrix multiplication"]) {
      expect(searchCatalog(query).map((family) => family.id)).toContain("matrix-product");
    }
    expect(searchCatalog("D09").map((family) => family.id)).toContain("derivative-sign-sketch");
    expect(searchCatalog("W03").map((family) => family.id)).toContain("multivar-path-limit");
    expect(searchCatalog("partial derivatives").map((family) => family.id)).toContain("multivar-partial-point");
    expect(resolveCatalogCompetency("F05")?.coverage).toBe("partial");
    expect(resolveCatalogCompetency("M07")?.coverage).toBe("bounded");
    expect(resolveCatalogCompetency("M99")).toBeNull();
    expect(resolveCatalogCompetency("M03 rubbish")).toBeNull();
    expect(searchCatalog("M99")).toEqual([]);
    const limited = allTemplates.filter((family) => family.id === "matrix-product");
    expect(searchCatalog("M03", limited).map((family) => family.id)).toEqual(["matrix-product"]);
  });

  it("normalizes Polish accents, Ł, case and whitespace", () => {
    expect(normalizeCatalogQuery("  RÓŻNE   ŹRÓDŁA  ")).toBe("rozne zrodla");
    expect(normalizeCatalogQuery("  ZaŻÓŁĆ  ")).toBe("zazolc");
  });

  it("finds families globally in Polish and English, regardless of category", () => {
    const polish = searchCatalog("MNOZENIE PRZEZ NAWIAS");
    expect(polish.map((family) => family.id)).toContain("algebra-distribute");
    expect(searchCatalog("algebra basics").some((family) => family.id === "algebra-distribute")).toBe(true);
    expect(searchCatalog("uklady rownan").every((family) => family.category === "systems")).toBe(true);
    expect(searchCatalog("systems of equations").every((family) => family.category === "systems")).toBe(true);
    expect(categoryTitle("systems", "pl")).toBe("Układy równań");
    expect(categoryTitle("systems", "en")).toBe("Systems of equations");
    expect(searchCatalog(" ")).toEqual([]);
    expect(searchCatalog("zzzz-no-such-family")).toEqual([]);
    expect(new Set(searchCatalog("rownan").map((family) => family.id)).size).toBe(searchCatalog("rownan").length);
    expect(allTemplates).toHaveLength(223);
    expect(allTemplates.filter((family) => family.category !== "integrals")).toHaveLength(202);
    const categories = new Set(allTemplates.map((family) => family.category));
    expect(categories.size).toBe(14);
    expect([...categories].reduce((total, category) => total +
      difficulties.reduce((count, level) => count + taskPool(category, level).length, 0), 0)).toBe(17877);
    expect([...categories].filter((category) => category !== "integrals").reduce((total, category) => total +
      difficulties.reduce((count, level) => count + taskPool(category, level).length, 0), 0)).toBe(16365);
  });

  it("preserves supported level or chooses nearest available level without changing the family", () => {
    const family = { id: "sample", title: "Test", category: "systems" as const,
      supportedDifficulties: ["hard", "advanced", "expert"] as const };
    expect(selectCatalogFamily(family, "advanced")).toEqual({
      category: "systems", templateId: "sample", difficulty: "advanced", changedDifficulty: false,
    });
    expect(selectCatalogFamily(family, "easy")).toEqual({
      category: "systems", templateId: "sample", difficulty: "hard", changedDifficulty: true,
    });
    expect(selectCatalogFamily({ ...family, supportedDifficulties: ["easy", "hard"] }, "medium").difficulty).toBe("easy");
    expect(() => selectCatalogFamily({ ...family, supportedDifficulties: [] }, "easy")).toThrow();
  });

  it("finds integral families across languages and selects a supported level", () => {
    for (const query of ["CALKOWANIE PRZEZ CZESCI", "integration by parts"]) {
      const matches = searchCatalog(query);
      expect(matches.map((family) => family.id)).toEqual(["integral-parts","integral-parts-definite","integral-parts-trig-linear"]);
      expect(selectCatalogFamily(matches[0], "easy")).toEqual({
        category: "integrals", templateId: "integral-parts", difficulty: "hard", changedDifficulty: true,
      });
    }
  });
});
