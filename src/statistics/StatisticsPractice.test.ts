import { describe, expect, it } from "vitest";
import { nextStatisticsSeed } from "./StatisticsPractice";

describe("ST-101 UI next-exercise seed policy",()=>{
  it.each([[0,1],[1,2],[4294967294,4294967295],[4294967295,0]])("advances %s to %s without signed truncation",(seed,next)=>{
    expect(nextStatisticsSeed(seed)).toBe(next);
  });
  it.each([-1,4294967296,0.1,NaN,Infinity])("rejects invalid internal seed %s",seed=>{
    expect(()=>nextStatisticsSeed(seed)).toThrow(RangeError);
  });
});
