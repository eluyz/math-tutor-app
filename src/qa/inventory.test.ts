import { describe, expect, it } from "vitest";
import {
  generateInventory,
  inventoryLocales,
  type InventoryDeclaration,
  type InventoryTuple,
  validateInventory,
} from "./inventory";

function cloneTuples(tuples: readonly InventoryTuple[]): InventoryTuple[] {
  return tuples.map((tuple) => ({ ...tuple, locales: [...tuple.locales] }));
}

function cloneDeclarations(
  declarations: readonly InventoryDeclaration[],
): InventoryDeclaration[] {
  return declarations.map((declaration) => ({ ...declaration }));
}

describe("QA inventory", () => {
  it("builds deterministic tuples and canonical keys", () => {
    const first = generateInventory("test-sha");
    const second = generateInventory("test-sha");

    expect(first.tuples).toEqual(second.tuples);
    expect(first.declarations).toEqual(second.declarations);
    expect(first.summary).toEqual(second.summary);
    expect(first.tuples[0]?.inventory_sha).toBe("test-sha");
    expect(first.tuples.every((row) => row.canonical_key.startsWith(`${row.family_id}/${row.difficulty}/`))).toBe(true);
    expect(first.summary.locales).toBe(first.summary.tuples * inventoryLocales.length);
  });

  it("keeps full locale view on a single tuple", () => {
    const report = generateInventory("test-sha");
    expect(report.tuples.every((tuple) => tuple.locales.join(",") === inventoryLocales.join(","))).toBe(true);
  });

  it("rejects duplicate canonical keys", () => {
    const report = generateInventory("test-sha");
    const tuples = cloneTuples(report.tuples);
    tuples.push({ ...tuples[0] });

    expect(() => validateInventory(tuples, cloneDeclarations(report.declarations))).toThrow(
      /Duplicate canonical key/,
    );
  });

  it("rejects unknown difficulties", () => {
    const report = generateInventory("test-sha");
    const tuples = cloneTuples(report.tuples);
    tuples[0] = { ...tuples[0], difficulty: "unknown" as never };

    expect(() => validateInventory(tuples, cloneDeclarations(report.declarations))).toThrow(
      /Unknown difficulty in tuple/,
    );
  });

  it("rejects gaps in variant ranges", () => {
    const report = generateInventory("test-sha");
    const tuples = cloneTuples(report.tuples);
    const key = `${tuples[0].family_id}::${tuples[0].difficulty}`;
    for (const tuple of tuples)
      if (`${tuple.family_id}::${tuple.difficulty}` === key && tuple.variant_index > 0)
        tuple.variant_index += 1;

    expect(() => validateInventory(tuples, cloneDeclarations(report.declarations))).toThrow(
      /Gap in variant range/,
    );
  });

  it("rejects PL/EN split into separate tuples", () => {
    const report = generateInventory("test-sha");
    const tuples = cloneTuples(report.tuples);
    tuples[0] = { ...tuples[0], locales: ["pl"] };

    expect(() => validateInventory(tuples, cloneDeclarations(report.declarations))).toThrow(
      /Locale views mismatch/,
    );
  });

  it("rejects unsupported metadata source", () => {
    const report = generateInventory("test-sha");
    const declarations = cloneDeclarations(report.declarations);
    declarations[0] = {
      ...declarations[0],
      source: "unsupported" as InventoryDeclaration["source"],
    };

    expect(() => validateInventory(cloneTuples(report.tuples), declarations)).toThrow(
      /Unsupported metadata source/,
    );
  });
});
