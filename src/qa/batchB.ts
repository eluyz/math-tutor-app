import { makeUniversityTask, localizeUniversity } from "../university/catalog";
import { q, a, s, m, d, eq } from "../university/audit";
import { referenceExpand, referenceRatio, referencePolynomialLimit, referencePointLimit, selectedSetContains, cmp } from "../university/functions-audit";
import { formatRational as f, type AnswerInput, type LimitValue } from "../answers";
import type { Rational } from "../rational";

/** Public synthetic witnesses only. Each row is also exercised through the UI. */
export const batchB = [
  { skill: "C01", family: "sequence-rational", level: "medium", variants: [1, 7] },
  { skill: "C03", family: "sequence-conjugate", level: "medium", variants: [1] },
  { skill: "C03", family: "sequence-conjugate", level: "hard", variants: [12] },
  { skill: "F01", family: "function-radical-over-linear-domain", level: "medium", variants: [0, 1, 2] },
  { skill: "F01", family: "function-domain", level: "hard", variants: [0] },
  { skill: "F01", family: "function-domain", level: "expert", variants: [0, 1] },
  { skill: "G01", family: "limit-point", level: "easy", variants: [1] },
  { skill: "G02", family: "limit-point", level: "medium", variants: [1] },
  { skill: "G03", family: "limit-point", level: "hard", variants: [0, 1, 2] },
  { skill: "G03", family: "limit-cancelled-pole", level: "hard", variants: [0, 1] },
  { skill: "G05", family: "limit-conjugate", level: "advanced", variants: [0] },
  { skill: "G05", family: "limit-root-infinity-conjugates", level: "advanced", variants: [0, 1, 2, 3] },
  { skill: "G05", family: "limit-radical-infinity", level: "hard", variants: [0, 1, 2, 3] },
  { skill: "D01", family: "derivative-formula", level: "easy", variants: [2] },
  { skill: "D01", family: "derivative-fractional-powers", level: "medium", variants: [0, 1, 2, 3] },
  { skill: "D01", family: "derivative-higher-root-powers", level: "hard", variants: [0, 1] },
] as const;

type Task = ReturnType<typeof makeUniversityTask>;
const finite = (value: Rational): LimitValue => ({ kind: "finite", value });
const limitInput = (value: LimitValue): AnswerInput => ({ kind: "limit", classification: value.kind, value: value.kind === "finite" ? f(value.value) : "" });
const list = (values: readonly Rational[]): AnswerInput => ({ kind: "list", values: values.map(f) });

/** No production limit/derivative/domain solver or answer values are read here.
 * The shared audit library expands coefficient arrays independently of the app's
 * collector. Domain options are decoded and tested on every boundary/open cell.
 */
export function batchBOracle(task: Task): AnswerInput {
  const p = task.university;
  switch (p.kind) {
    case "sequence-rational": {
      const ratio = referenceRatio(p.expression);
      return limitInput(referencePolynomialLimit(ratio.n, ratio.d));
    }
    case "sequence-conjugate":
      return limitInput(finite(p.mode === "second-order" ? d(s(m(q(4), p.b), m(p.a, p.a)), q(8)) : p.mode === "multiply" ? d(p.b, q(2)) : d(p.a, m(q(2), p.k))));
    case "limit-point":
      return limitInput(referencePointLimit(referenceExpand(p.numerator), p.denominator, p.at, p.side));
    case "limit-conjugate": {
      const twice = m(q(2), p.s), tangent = d(p.k, twice);
      return limitInput(finite(p.mode === "second-order" ? d(s(p.b, m(tangent, tangent)), twice) : p.mode === "two-roots" ? d(s(p.b, p.c), twice) : tangent));
    }
    case "limit-root-infinity-conjugates": {
      const numerator = p.mode === "quadratic-pair" ? s(p.b, p.d) : p.b;
      return limitInput(finite(p.mode === "linear-pair" ? q(0) : d(m(q(p.direction === "positive" ? 1 : -1), numerator), m(q(2), p.s))));
    }
    case "limit-radical-infinity": {
      const direction = p.direction === "positive" ? 1 : -1;
      const slope = a(p.c, m(q(direction), p.a));
      return limitInput(slope.numerator === 0n ? finite(p.d) : { kind: (slope.numerator > 0n) === (direction > 0) ? "positive-infinity" : "negative-infinity" });
    }
    case "function-domain": {
      const boundaries = [p.p, p.q, p.r].sort(cmp);
      const points = [...boundaries, s(boundaries[0], q(1)), a(boundaries[2], q(1)), d(a(boundaries[0], boundaries[1]), q(2)), d(a(boundaries[1], boundaries[2]), q(2))];
      const allowed = (x: Rational) => p.mode === "root-over-one"
        ? m(p.sign, s(x, p.p)).numerator >= 0n && !eq(x, p.q)
        : m(s(x, p.p), s(x, p.q)).numerator >= 0n && (p.mode === "root-ratio" ? m(p.sign, s(x, p.r)).numerator > 0n : !eq(x, p.r));
      const spec = localizeUniversity(task, "pl").answer;
      if (spec.kind !== "choice") throw Error("Expected domain choices");
      const matches = spec.options.filter(option => points.every(x => selectedSetContains(option.value, x) === allowed(x)));
      if (matches.length !== 1) throw Error("Independent domain oracle must identify exactly one option");
      return { kind: "choice", value: matches[0].value };
    }
    case "derivative": {
      if (p.target !== "formula") throw Error("Expected polynomial formula");
      const coefficients = referenceExpand(p.formula).slice(1).map((c, i) => m(c, q(i + 1)));
      return list((coefficients.length ? coefficients : [q(0)]).reverse());
    }
    case "derivative-fractional-powers": {
      // Independently transcribed from the four displayed radical forms.
      const powers = [[q(1, 2), q(-1), q(2)], [q(3, 2), q(-1, 2), q(1)], [q(-2), q(3, 2), q(2)], [q(-3, 2), q(-3), q(1, 2)]][p.mode];
      return list(p.coefficients.map((c, i) => m(c, powers[i])));
    }
    case "derivative-higher-root-powers": {
      // (ax - b*x^(5/6))/x^(3/2) = ax^(-1/2)-bx^(-2/3).
      const powers = p.mode === "sum" ? [q(2), q(1, 3), q(8, 5), q(-1, 4)] : [q(-1, 2), q(-2, 3)];
      return list(powers.map((exponent, i) => m(m(p.coefficients[i], q(p.mode === "quotient" && i === 1 ? -1 : 1)), exponent)));
    }
    default: throw Error("Uncovered Batch B form: " + p.kind);
  }
}

export function wrongBatchBAnswer(correct: AnswerInput, task: Task): AnswerInput {
  if (typeof correct === "string") throw Error("Unexpected scalar input");
  if (correct.kind === "limit") return { kind: "limit", classification: correct.classification === "finite" ? "positive-infinity" : "finite", value: "0" };
  if (correct.kind === "list") return { kind: "list", values: ["999999", ...correct.values.slice(1)] };
  if (correct.kind === "choice") {
    const spec = localizeUniversity(task, "pl").answer;
    if (spec.kind === "choice") return { kind: "choice", value: spec.options.find(o => o.value !== correct.value)!.value };
  }
  throw Error("Unexpected Batch B input");
}
