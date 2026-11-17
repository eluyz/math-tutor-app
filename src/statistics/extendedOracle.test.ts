import { describe, expect, it } from "vitest";
import type { Rational } from "../rational";
import { summarizeIntegerDataset } from "./descriptive";
import { generateMeanDataset } from "./datasets";
import { generateMedianTask } from "./medianTasks";
import { generateVarianceTask } from "./varianceTasks";

// Explicit, independently worked results. No expected value calls production arithmetic.
const fixtures = [
  {data:[0], mean:[0n,1n], median:[0n,1n], variance:[0n,1n]},
  {data:[7], mean:[7n,1n], median:[7n,1n], variance:[0n,1n]},
  {data:[1,3], mean:[2n,1n], median:[2n,1n], variance:[1n,1n]},
  {data:[0,1], mean:[1n,2n], median:[1n,2n], variance:[1n,4n]},
  {data:[-1,1], mean:[0n,1n], median:[0n,1n], variance:[1n,1n]},
  {data:[1,1,1], mean:[1n,1n], median:[1n,1n], variance:[0n,1n]},
  {data:[1,2,3], mean:[2n,1n], median:[2n,1n], variance:[2n,3n]},
  {data:[-3,0,3], mean:[0n,1n], median:[0n,1n], variance:[6n,1n]},
  {data:[0,0,0,10], mean:[5n,2n], median:[0n,1n], variance:[75n,4n]},
  {data:[1,1,2,2], mean:[3n,2n], median:[3n,2n], variance:[1n,4n]},
  {data:[-5,-1,-1,3,4], mean:[0n,1n], median:[-1n,1n], variance:[52n,5n]},
  {data:[8,-2,4,0], mean:[5n,2n], median:[2n,1n], variance:[59n,4n]},
  {data:[-4,-3,-2,-1,0,1], mean:[-3n,2n], median:[-3n,2n], variance:[35n,12n]},
  {data:[9,1,3,7,5,11], mean:[6n,1n], median:[6n,1n], variance:[35n,3n]},
  {data:[2,3,6,9,10], mean:[6n,1n], median:[6n,1n], variance:[10n,1n]},
  {data:[20,1,1,1,2,2], mean:[9n,2n], median:[3n,2n], variance:[193n,4n]},
] as const;

function ratio(actual: Rational, n: bigint, d: bigint) {
  expect(actual.denominator).toBeGreaterThan(0n);
  expect(actual.numerator*d).toBe(n*actual.denominator);
}

function atRank(values: readonly number[], rank: number): number {
  const value = values.find(x => values.filter(y => y<x).length < rank && values.filter(y => y<=x).length >= rank);
  if (value === undefined) throw new Error("Missing rank");
  return value;
}

describe("Statistics S1 extended independent oracle", () => {
  it.each(fixtures)("matches the fixed summary for $data", ({data,mean,median,variance}) => {
    const input = Object.freeze([...data]);
    const summary = summarizeIntegerDataset(input);
    expect(summary.mean).toEqual({numerator:mean[0],denominator:mean[1]});
    expect(summary.median).toEqual({numerator:median[0],denominator:median[1]});
    expect(summary.populationVariance).toEqual({numerator:variance[0],denominator:variance[1]});
    expect(input).toEqual(data);
  });

  it.each(fixtures)("satisfies permutation, translation and signed scaling for $data", ({data,mean,median,variance}) => {
    const reversed = summarizeIntegerDataset([...data].reverse());
    ratio(reversed.mean, mean[0],mean[1]);
    ratio(reversed.median,median[0],median[1]);
    ratio(reversed.populationVariance,variance[0],variance[1]);
    const shifted = summarizeIntegerDataset(data.map(x => x+7));
    ratio(shifted.mean,mean[0]+7n*mean[1],mean[1]);
    ratio(shifted.median,median[0]+7n*median[1],median[1]);
    ratio(shifted.populationVariance,variance[0],variance[1]);
    for (const k of [-3,0,2]) {
      const scaled = summarizeIntegerDataset(data.map(x => k*x));
      ratio(scaled.mean,BigInt(k)*mean[0],mean[1]);
      ratio(scaled.median,BigInt(k)*median[0],median[1]);
      ratio(scaled.populationVariance,BigInt(k*k)*variance[0],variance[1]);
    }
  });

  it.each(["easy","medium","hard"] as const)("checks all three %s task outputs with independent identities and ranks", (difficulty) => {
    for (const seed of [...Array.from({length:64},(_,i)=>i),4294967295]) {
      const mean = generateMeanDataset(difficulty,seed);
      const median = generateMedianTask(difficulty,seed);
      const variance = generateVarianceTask(difficulty,seed);
      // Median-only easy ordering is intentionally different; values must still be the same multiset.
      expect([...median.values].sort((a, b) => a - b)).toEqual([...mean.values].sort((a, b) => a - b));
      expect(variance.values).toEqual(mean.values);
      const n=BigInt(mean.values.length);
      const sum=mean.values.reduce((s,x)=>s+BigInt(x),0n);
      const squares=mean.values.reduce((s,x)=>s+BigInt(x)*BigInt(x),0n);
      ratio(mean.mean,sum,n);
      ratio(variance.mean,sum,n);
      ratio(variance.populationVariance,n*squares-sum*sum,n*n);
      const left=atRank(mean.values,Math.floor((mean.values.length+1)/2));
      const right=atRank(mean.values,Math.floor(mean.values.length/2)+1);
      ratio(median.median,BigInt(left+right),2n);
    }
  });

  it("retains exact dispersion near the safe-integer boundary", () => {
    // Mean/median = MAX_SAFE_INTEGER-1; differences +1,-1 give variance exactly 1.
    const summary=summarizeIntegerDataset([9007199254740991,9007199254740989]);
    expect(summary.mean).toEqual({numerator:9007199254740990n,denominator:1n});
    expect(summary.median).toEqual({numerator:9007199254740990n,denominator:1n});
    expect(summary.populationVariance).toEqual({numerator:1n,denominator:1n});
  });
});
