import { describe, expect, it } from "vitest";
import { assessAnswer, emptyAnswer } from "../answers";
import {
  makeJumpGapUnbounded, jumpGapGeometry, jumpGapValue,
  jumpGapNonInjectiveWitness, jumpGapOracle,
  jumpGapFields, presentJumpGapUnbounded,
} from "./graphJumpGapUnbounded";

const fmt = (n: number) => String(n).replace(/-/g, "−");
const interval = (a: string, b: string, lc = false, rc = false) =>
  (lc ? "[" : "(") + a + "; " + b + (rc ? "]" : ")");
const join = (...a: string[]) => a.join(" ∪ ");

describe("F05/c synthetic discontinuous graph with a separate x gap", () => {
  const signatures = new Set<string>();
  for (const level of ["hard","advanced","expert"] as const) {
    for (let variant = 0; variant < 24; variant++) {
      it(level + ":" + variant + " exact independent shape and six PL/EN fields", () => {
        const p = makeJumpGapUnbounded(variant, level);
        signatures.add(JSON.stringify(p));
        jumpGapGeometry(p);
        expect(p.a).toBeLessThan(p.b);
        expect(p.b).toBeLessThan(p.c);
        expect(p.c).toBeLessThan(p.t);
        expect(p.lower).toBeLessThan(p.upper);
        expect(p.rightMin).toBeLessThan(p.upper);
        expect(p.b).not.toBe(-p.c);
        // Independent 4-piece affine reconstruction, including the jump and gap.
        const slopeMiddle = (p.secondEnd - p.lower) / (p.b - p.a);
        const slopeDown = (p.rightMin - p.rightStart) / (p.t - p.c);
        expect(p.leftSlope).toBeGreaterThan(0);
        expect(slopeMiddle).toBeGreaterThan(0);
        expect(slopeDown).toBeLessThan(0);
        expect(p.rightSlope).toBeGreaterThan(0);
        for (const x of [p.a - 5, p.a - 2, p.a - 0.25])
          expect(jumpGapValue(p,x)).toBeCloseTo(p.upper + p.leftSlope*(x-p.a),10);
        expect(jumpGapValue(p,p.a)).toBe(p.lower);
        for (const x of [p.a, (p.a+p.b)/2, p.b - 0.125])
          expect(jumpGapValue(p,x)).toBeCloseTo(p.lower + slopeMiddle*(x-p.a),10);
        for (const x of [p.b, (p.b+p.c)/2, p.c])
          expect(() => jumpGapValue(p,x)).toThrow();
        for (const x of [p.c+0.125, (p.c+p.t)/2,p.t])
          expect(jumpGapValue(p,x)).toBeCloseTo(p.rightStart + slopeDown*(x-p.c),10);
        for (const x of [p.t, p.t+1, p.t+4])
          expect(jumpGapValue(p,x)).toBeCloseTo(p.rightMin + p.rightSlope*(x-p.t),10);
        expect(() => jumpGapValue(p,Number.NaN)).toThrow();
        expect(() => jumpGapValue(p,Infinity)).toThrow();
        const leftLimit = jumpGapValue(p,p.a - 1e-6);
        const rightAtJump = jumpGapValue(p,p.a);
        expect(leftLimit).toBeCloseTo(p.upper,4);
        expect(rightAtJump).toBe(p.lower);
        expect(leftLimit).toBeGreaterThan(rightAtJump);
        // These two unbounded y-rays overlap, giving the entire real line.
        expect(p.rightMin).toBeLessThan(p.upper);
        // Independent horizontal-line pair on descending and right rising pieces.
        const shared = (p.rightMin + p.rightStart)/2;
        const downX = (p.c+p.t)/2;
        const rightX = p.t + (p.rightStart-p.rightMin)/(2*p.rightSlope);
        expect(p.c).toBeLessThan(downX);
        expect(downX).toBeLessThan(p.t);
        expect(p.t).toBeLessThan(rightX);
        expect(jumpGapValue(p,downX)).toBeCloseTo(shared,9);
        expect(jumpGapValue(p,rightX)).toBeCloseTo(shared,9);
        expect(jumpGapNonInjectiveWitness(p).y).toBeTruthy();

        const expected = {
          domain: join(interval("−∞",fmt(p.b)),interval(fmt(p.c),"+∞")),
          range:"ℝ",
          increasing:join(
            interval("−∞",fmt(p.a)),
            interval(fmt(p.a),fmt(p.b),true),
            interval(fmt(p.t),"+∞",true)),
          decreasing:interval(fmt(p.c),fmt(p.t),false,true),
          injective:"no",parity:"neither",
        };
        expect(jumpGapOracle(p)).toEqual(expected);
        for (const locale of ["pl","en"] as const) {
          const lesson = presentJumpGapUnbounded(p,locale);
          const spec = lesson.answer;
          const labels = {
            ...expected,
            injective: locale==="pl"?"Nie":"No",
            parity: locale==="pl"?"Ani parzysta, ani nieparzysta":"Neither",
          };
          expect(spec.kind).toBe("multi-choice");
          if (spec.kind!=="multi-choice") throw Error("Expected six fields");
          expect(spec.fields.map(x=>x.id)).toEqual(jumpGapFields);
          for (const field of spec.fields) {
            expect(new Set(field.options.map(x=>x.label)).size).toBe(field.options.length);
            expect(field.options.some(x=>x.value===field.value)).toBe(true);
          }
          const correct = {
            kind: "multi-choice" as const,
            values: Object.fromEntries(spec.fields.map(field=>{
              const opts=field.options.filter(option=>option.label===labels[field.id as keyof typeof labels]);
              expect(opts).toHaveLength(1);
              return [field.id,opts[0].value];
            })),
          };
          expect(assessAnswer(spec,correct).kind).toBe("correct");
          expect(assessAnswer(spec,emptyAnswer(spec)).kind).toBe("invalid");
          for (const field of spec.fields) {
            const incomplete = {...correct.values};
            delete incomplete[field.id];
            expect(assessAnswer(spec,{kind:"multi-choice",values:incomplete}).kind).toBe("invalid");
            const wrong = field.options.find(x=>x.value!==correct.values[field.id]);
            expect(wrong).toBeDefined();
            expect(assessAnswer(spec,{kind:"multi-choice",values:{
              ...correct.values,[field.id]:wrong!.value,
            }}).kind).toBe("incorrect");
          }
          const work = lesson.solution.filter(x=>x.kind==="working");
          expect(work).toHaveLength(6);
          for (const [i,k] of (["domain","range","increasing","decreasing"] as const).entries())
            expect(work[i].action).toContain(expected[k]);
          expect(lesson.hint.length).toBeGreaterThan(30);
          expect(lesson.nextHint.length).toBeGreaterThan(40);
          expect(lesson.question.length).toBeGreaterThan(50);
          if (locale==="en") {
            const all = [lesson.question,lesson.hint,lesson.nextHint,
              ...work.map(s=>s.action+" "+s.reason)].join(" ");
            expect(all).not.toMatch(/[ąćęłńóśźż]/i);
          }
        }
      });
    }
  }
  it("makes 72 different index-stable synthetic profiles without modifying old tasks",()=>{
    expect(signatures.size).toBe(72);
    for(const level of ["hard","advanced","expert"] as const)
      for(const v of [-1,24,0.2,NaN,Infinity])
        expect(()=>makeJumpGapUnbounded(v,level)).toThrow();
    expect(()=>makeJumpGapUnbounded(0,"easy")).toThrow();
    const p=makeJumpGapUnbounded(0,"hard");
    for (const mutation of [
      {...p,b:p.a}, {...p,c:p.b}, {...p,t:p.c},
      {...p,upper:p.lower},{...p,rightMin:p.upper},
      {...p,leftSlope:0},{...p,rightSlope:0},
      {...p,c:-p.b},
    ]) expect(()=>jumpGapGeometry(mutation)).toThrow();
  });
});
