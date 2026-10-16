import { describe, expect, it } from "vitest";
import { equalRational, parseAnswer, rational as r } from "./rational";

function valid(input: string) {
  const result = parseAnswer(input);
  expect(result.kind).toBe("valid");
  if (result.kind !== "valid")
    throw new Error(`Expected a valid number: ${input}`);
  return result.value;
}

describe("dokładne porównywanie odpowiedzi", () => {
  it.each([
    ["3/4", "0,75"],
    ["6/8", "0.75"],
    ["1/2", "0.5"],
    ["-3/-4", "0.75"],
    ["  2 / 4  ", ".5"],
    ["+5", "5,0"],
    ["-0", "0"],
  ])("uznaje %s i %s za równoważne", (left, right) => {
    expect(equalRational(valid(left), valid(right))).toBe(true);
  });

  it("nie używa tolerancji dla wartości przybliżonych", () => {
    expect(equalRational(valid("1/3"), valid("0.3333333333333333"))).toBe(
      false,
    );
    expect(equalRational(valid("0.3"), valid("0.30000000000000004"))).toBe(
      false,
    );
    expect(equalRational(valid("1/2"), valid("0.5000000001"))).toBe(false);
  });

  it.each([
    ["", "empty"],
    ["  ", "empty"],
    ["1/0", "division-by-zero"],
    ["0/0", "division-by-zero"],
    ["3+4", "format"],
    ["1/2/3", "format"],
    ["Infinity", "format"],
    ["NaN", "format"],
    ["0,1.2", "format"],
    ["1e3", "format"],
    ["1/0.5", "format"],
    ["9".repeat(101), "too-long"],
  ] as const)("odrzuca %s z powodem %s", (input, reason) => {
    expect(parseAnswer(input)).toEqual({ kind: "invalid", reason });
  });

  it("normalizuje znak i skraca ułamki bez liczb zmiennoprzecinkowych", () => {
    expect(valid("-6/-8")).toEqual(r(3, 4));
    expect(valid("0.125")).toEqual(r(1, 8));
    expect(valid("-0.")).toEqual(r(0));
  });
});
