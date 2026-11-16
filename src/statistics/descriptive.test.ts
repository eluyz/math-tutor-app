import { describe, expect, it } from "vitest";
import { rational as r } from "../rational";
import { summarizeIntegerDataset } from "./descriptive";

describe("statistics S1: independently specified descriptive examples", () => {
  it.each([
    { data: [2, 4, 6, 8, 10], mean: r(6), median: r(6), variance: r(8) },
    { data: [1, 1, 1, 1, 1], mean: r(1), median: r(1), variance: r(0) },
    { data: [9, 1, 3, 7, 5, 11], mean: r(6), median: r(6), variance: r(35, 3) },
    { data: [-5, -1, -1, 3, 4], mean: r(0), median: r(-1), variance: r(52, 5) },
    { data: [0, 0, 0, 1, 1, 1], mean: r(1, 2), median: r(1, 2), variance: r(1, 4) },
    { data: [3, 3, 5, 5], mean: r(4), median: r(4), variance: r(1) },
    { data: [7], mean: r(7), median: r(7), variance: r(0) },
  ])("returns exact mean, median and population variance for $data", ({ data, mean, median, variance }) => {
    const result = summarizeIntegerDataset(data);
    expect(result.count).toBe(data.length);
    expect(result.mean).toEqual(mean);
    expect(result.median).toEqual(median);
    expect(result.populationVariance).toEqual(variance);
  });

  it("does not change under permutation", () => {
    const forward = summarizeIntegerDataset([1, 3, 9, 9, -2, 1]);
    const reversed = summarizeIntegerDataset([1, -2, 9, 9, 3, 1]);
    expect(forward).toEqual(reversed);
  });

  it("shifting each observation shifts location but not population variance", () => {
    const original = summarizeIntegerDataset([-4, 0, 1, 5, 8]);
    const shifted = summarizeIntegerDataset([6, 10, 11, 15, 18]);
    expect(shifted.mean).toEqual(r(original.mean.numerator + 10n * original.mean.denominator, original.mean.denominator));
    expect(shifted.median).toEqual(r(original.median.numerator + 10n * original.median.denominator, original.median.denominator));
    expect(shifted.populationVariance).toEqual(original.populationVariance);
  });

  it("uses population n rather than sample n-1", () => {
    // For [1, 3] the mean is 2, the sum of squared deviations is 2.
    expect(summarizeIntegerDataset([1, 3]).populationVariance).toEqual(r(1));
  });

  it.each([
    { values: [] as number[] },
    { values: [1, 1.5] },
    { values: [Number.NaN] },
    { values: [Number.POSITIVE_INFINITY] },
    { values: [Number.MAX_SAFE_INTEGER + 1] },
  ])("rejects invalid or empty data $values", ({ values }) => {
    expect(() => summarizeIntegerDataset(values)).toThrow();
  });

  it("enforces the explicit dataset size bound", () => {
    expect(() => summarizeIntegerDataset(Array(101).fill(1))).toThrow(RangeError);
  });

  it("uses BigInt arithmetic when safe observations sum beyond Number.MAX_SAFE_INTEGER", () => {
    const max = Number.MAX_SAFE_INTEGER;
    const summary = summarizeIntegerDataset([max, max - 2]);
    expect(summary.mean).toEqual(r(BigInt(max) - 1n));
    expect(summary.median).toEqual(r(BigInt(max) - 1n));
    expect(summary.populationVariance).toEqual(r(1));
  });
});
