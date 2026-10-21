import { describe, expect, it } from "vitest";
import { allTemplates } from "../generators";
import { UWM_PREP_GROUPS } from "./EntrancePrep";

describe("MT-UWM-001 curated entrance preparation", () => {
  const selected = UWM_PREP_GROUPS.flatMap((group) => group.ids);

  it("links to real distinct templates with supported levels", () => {
    expect(new Set(selected).size).toBe(selected.length);
    const byId = new Map(allTemplates.map((template) => [template.id, template]));
    for (const id of selected) {
      const template = byId.get(id);
      expect(template, `Missing exam-prep family: ${id}`).toBeDefined();
      expect(template?.supportedDifficulties.length).toBeGreaterThan(0);
    }
  });

  it("covers the stated determinant, inverse, equation and Cramer skills", () => {
    for (const family of [
      "determinant-two", "determinant-sarrus", "determinant-laplace-four",
      "determinant-row-operations", "determinant-laplace-five",
      "inverse-two", "inverse-three", "inverse-applications",
      "inverse-right-applications", "system-cramer-two", "system-cramer-three",
    ]) {
      expect(selected).toContain(family);
    }
  });

  it("provides Polish and English metadata for every group", () => {
    for (const group of UWM_PREP_GROUPS) {
      expect(group.title.pl.length).toBeGreaterThan(3);
      expect(group.title.en.length).toBeGreaterThan(3);
      expect(group.note.pl.length).toBeGreaterThan(3);
      expect(group.note.en.length).toBeGreaterThan(3);
    }
  });
});
