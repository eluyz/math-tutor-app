import type { makeUniversityTask } from "../university/catalog";
import { formatRational as f, type AnswerInput, type LimitValue } from "../answers";
import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational } from "../rational";
import { referenceRatio } from "../university/functions-audit";
import type { GeometricTerm } from "../university/schema";

/** Six bounded combinations, 144 unit variants, sixteen distinct UI witnesses. */
export const batchC = [
  { skill: "C02", family: "sequence-radical-ratio", level: "expert", variants: [0, 1] },
  { skill: "C04", family: "sequence-exponential-ratio", level: "expert", variants: [6, 7] },
  { skill: "C04", family: "sequence-power-exponential", level: "advanced", variants: [1, 3, 4] },
  { skill: "F02", family: "function-log-rational-domain", level: "expert", variants: [0, 1, 2] },
  { skill: "G04", family: "limit-infinity", level: "hard", variants: [0, 1, 4] },
  { skill: "G04", family: "limit-radical-infinity", level: "expert", variants: [0, 1, 4] },
] as const;

type Task = ReturnType<typeof makeUniversityTask>;
const compare = (x: Rational, y: Rational) => {
  const delta = x.numerator * y.denominator - y.numerator * x.denominator;
  return delta < 0n ? -1 : delta > 0n ? 1 : 0;
};
const finite = (value: Rational): LimitValue => ({ kind: "finite", value });
const infinity = (sign: number): LimitValue => ({ kind: sign > 0 ? "positive-infinity" : "negative-infinity" });
const input = (value: LimitValue): AnswerInput => ({ kind: "limit", classification: value.kind, value: value.kind === "finite" ? f(value.value) : "" });
const sign = (x: Rational) => compare(x, r(0));

/** Sort the original bases and sum their coefficients, without a production
 * solver or its Map-based collector. A cancelled base cannot dominate. */
function dominant(terms: readonly GeometricTerm[]) {
  const bases = terms.map(t => t.base).sort((x, y) => -compare(x, y));
  for (const base of bases) {
    if (sign(base) <= 0) throw Error("This bounded oracle requires positive bases");
    const coefficient = terms.filter(t => compare(t.base, base) === 0)
      .reduce((sum, t) => add(sum, t.coefficient), r(0));
    if (sign(coefficient)) return { base, coefficient };
  }
  return null;
}

/** Sign is constant on every open cell: all zeros/poles are simple and known.
 * Evaluate the original rational argument in each cell; exclude all endpoints.
 * Construct the serialized answer directly, without reading production choices. */
function logDomain(p: Extract<Task["university"], { kind: "function-log-rational-domain" }>): AnswerInput {
  const critical = [p.p, p.q, p.pole].sort(compare);
  if (critical.some((x, i) => i > 0 && compare(x, critical[i - 1]) === 0)) throw Error("Distinct boundaries required");
  const bounds = [null, ...critical, null];
  const intervals: [string | null, string | null, boolean, boolean][] = [];
  const key = (x: Rational | null) => x === null ? null : `${x.numerator}/${x.denominator}`;
  for (let i = 0; i < bounds.length - 1; i++) {
    const lo = bounds[i], hi = bounds[i + 1];
    const x = lo === null ? sub(hi!, r(1)) : hi === null ? add(lo, r(1)) : div(add(lo, hi), r(2));
    const argument = div(mul(sub(x, p.p), sub(x, p.q)), sub(x, p.pole));
    if (sign(argument) > 0) intervals.push([key(lo), key(hi), false, false]);
  }
  return { kind: "choice", value: "set:" + JSON.stringify(intervals) };
}

/** Exact independent asymptotic oracle; no production answer/solver is read. */
export function batchCOracle(task: Task): AnswerInput {
  const p = task.university;
  switch (p.kind) {
    case "sequence-radical-ratio": {
      if ([p.a, p.e, p.c, p.remainder].some(x => sign(x) <= 0) || sign(add(p.e, p.lowerLinear)) <= 0) throw Error("Root/denominator assumptions fail");
      // n>0: divide by n, then sqrt((a+b/n)^2+c/n^2) tends to |a|=a.
      return input(finite(div(add(p.a, p.linear), add(p.e, p.lowerLinear))));
    }
    case "sequence-exponential-ratio": {
      const top = dominant(p.numerator), bottom = dominant(p.denominator);
      if (!bottom || p.denominator.some(t => sign(t.base) <= 0 || sign(t.coefficient) <= 0)) throw Error("Positive denominator required");
      if (!top || compare(top.base, bottom.base) < 0) return input(finite(r(0)));
      return input(compare(top.base, bottom.base) === 0 ? finite(div(top.coefficient, bottom.coefficient)) : infinity(sign(top.coefficient)));
    }
    case "sequence-power-exponential": {
      if (sign(p.numeratorBase) <= 0 || sign(p.denominatorBase) <= 0 || sign(p.denominatorCoefficient) <= 0) throw Error("Positive bases and denominator required");
      const baseOrder = compare(p.numeratorBase, p.denominatorBase);
      const degreeOrder = p.numeratorDegree - p.denominatorDegree;
      const order = baseOrder || Math.sign(degreeOrder);
      return input(order < 0 ? finite(r(0)) : order > 0 ? infinity(sign(p.coefficient)) : finite(div(p.coefficient, p.denominatorCoefficient)));
    }
    case "function-log-rational-domain": return logDomain(p);
    case "limit-infinity": {
      // Independent convolution/collection handles cancellation in the input AST.
      const ratio = referenceRatio(p.expression);
      const trim = (values: readonly Rational[]) => {
        const result = [...values];
        while (result.length && sign(result.at(-1)!) === 0) result.pop();
        return result;
      };
      const top = trim(ratio.n), bottom = trim(ratio.d);
      if (!bottom.length) throw Error("Identically zero denominator");
      if (!top.length || top.length < bottom.length) return input(finite(r(0)));
      const coefficient = div(top.at(-1)!, bottom.at(-1)!);
      const degreeDifference = top.length - bottom.length;
      const directionSign = p.direction === "negative" && degreeDifference % 2 ? -1 : 1;
      return input(degreeDifference === 0 ? finite(coefficient) : infinity(sign(coefficient) * directionSign));
    }
    case "limit-radical-infinity": {
      if (sign(p.a) <= 0 || sign(p.b) <= 0) throw Error("Positive radical parameters required");
      // sqrt(a²x²+b) = a|x| + b/(sqrt(a²x²+b)+a|x|).
      // The rationalized remainder tends to zero along either ray.
      const direction = p.direction === "positive" ? 1 : -1;
      const slope = add(p.c, mul(r(direction), p.a));
      return input(sign(slope) ? infinity(sign(slope) * direction) : finite(p.d));
    }
    default: throw Error("Uncovered Batch C form: " + p.kind);
  }
}
