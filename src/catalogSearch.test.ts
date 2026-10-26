import { describe, expect, it } from "vitest";
import { allTemplates, difficulties, taskPool } from "./generators";
import { categoryTitle, normalizeCatalogQuery, searchCatalog, selectCatalogFamily } from "./catalogSearch";

describe("catalog search and selection", () => {
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
    expect(allTemplates).toHaveLength(181);
    expect(allTemplates.filter((family) => family.category !== "integrals")).toHaveLength(168);
    const categories = new Set(allTemplates.map((family) => family.category));
    expect(categories.size).toBe(14);
    expect([...categories].reduce((total, category) => total +
      difficulties.reduce((count, level) => count + taskPool(category, level).length, 0), 0)).toBe(14925);
    expect([...categories].filter((category) => category !== "integrals").reduce((total, category) => total +
      difficulties.reduce((count, level) => count + taskPool(category, level).length, 0), 0)).toBe(13989);
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
      expect(matches.map((family) => family.id)).toEqual(["integral-parts","integral-parts-definite"]);
      expect(selectCatalogFamily(matches[0], "easy")).toEqual({
        category: "integrals", templateId: "integral-parts", difficulty: "hard", changedDifficulty: true,
      });
    }
  });
});
