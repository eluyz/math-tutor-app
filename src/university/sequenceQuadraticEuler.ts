import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, type Rational} from "../rational";
import {formatRational as f, type AnswerSpec} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";
import type {UniversityFamily} from "./schema";

/** C05 bounded quadratic-scaling Euler limit. */
export type QuadraticEulerSequence = Readonly<{
  a: Rational;
  b: Rational;
  c: Rational;
  d: Rational;
}>;
const levels = ["medium", "hard", "advanced", "expert"] as const;
const key = (q: Rational) => `${q.numerator}/${q.denominator}`;

export function createQuadraticEulerSequence(variant: number, level: Difficulty): QuadraticEulerSequence {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !levels.includes(level as typeof levels[number]))
    throw Error("Unsupported quadratic Euler variant or difficulty");
  const tier = levels.indexOf(level as typeof levels[number]) + 1;
  return {
    a: r(variant % 7 - 3 || 1, tier <= 2 ? 1 : 2),
    b: r(4 + (variant * 3) % 5 + 10 * (tier - 1)),
    c: r((variant * 5) % 7 - 3 || 1, tier),
    d: r(variant % 5 - 2, tier),
  };
}

/** For n>=1, b>=0 and 1+b+a>0 the base is strictly positive.
 * (1+a/(n²+b))^(c n²+d) -> exp(a c). a!=0 is needed for the log proof.
 */
export function quadraticEulerExponent(p: QuadraticEulerSequence): Rational {
  if (p.a.numerator === 0n || p.b.numerator < 0n ||
      add(add(r(1), p.b), p.a).numerator <= 0n)
    throw Error("Euler base must be strictly positive for n>=1 and a nonzero");
  return mul(p.a, p.c);
}

export function quadraticEulerAnswer(exponent: Rational): AnswerSpec {
  if (exponent.numerator === 0n) return {kind: "scalar", value: r(1)};
  const candidates = [exponent, add(exponent, r(1)), sub(exponent, r(1)), mul(exponent, r(-1)), r(0)];
  const options = [...new Map(candidates.map(q => {
    const value = `exp:${key(q)}`;
    return [value, {value, label: q.numerator === 0n ? "1" : `e^(${f(q)})`}] as const;
  })).values()];
  return {kind: "choice", value: `exp:${key(exponent)}`, options};
}

export function presentQuadraticEulerSequence(p: QuadraticEulerSequence, locale: Locale) {
  const exponent = quadraticEulerExponent(p);
  const lesson = teaching(locale), {t} = lesson;
  const a = f(p.a), b = f(p.b), c = f(p.c), d = f(p.d);
  const expr = `(1+(${a})/(n²+(${b})))^((${c})·n²+(${d}))`;
  const target = exponent.numerator === 0n ? "1" : `e^(${f(exponent)})`;
  lesson.work(
    `n≥1; n²+(${b})>0; 1+(${a})/(n²+(${b}))>0`,
    t("Sprawdzamy dodatniość podstawy potęgi, aby móc zastosować logarytm.",
      "Verify the power base is positive before using a logarithm.")
  );
  lesson.work(
    `tₙ=(${a})/(n²+(${b})) → 0; ln(1+tₙ)/tₙ → 1`,
    t("Przy n→∞ składnik tₙ dąży do zera. Stosujemy granicę logarytmiczną.",
      "As n→∞ the term tₙ tends to zero. Apply the logarithmic limit.")
  );
  lesson.work(
    `ln aₙ = ((${c})·n²+(${d}))·ln(1+tₙ) = (${a})·((${c})·n²+(${d}))/(n²+(${b})) · ln(1+tₙ)/tₙ`,
    t("Mnożymy i dzielimy przez tₙ, nie zapominając o n² w wykładniku.",
      "Multiply and divide by tₙ, keeping the n² term in the exponent.")
  );
  lesson.work(
    `lim ln aₙ = (${a})·(${c}) = ${f(exponent)}; lim aₙ = ${target}`,
    t("Iloraz (c·n²+d)/(n²+b) dąży do c; potęgując e, dostajemy dokładny wynik.",
      "The quotient (c·n²+d)/(n²+b) tends to c. Exponentiating gives the exact answer.")
  );
  return lesson.finish(
    t("Oblicz granicę przy n→+∞, n≥1.\naₙ = " + expr,
      "Find the limit as n→+∞, n≥1.\naₙ = " + expr),
    quadraticEulerAnswer(exponent),
    t("Wykładnik jest rzędu n², a nie n; porównaj z mianownikiem wewnętrznego ułamka.",
      "The exponent scales with n², not n; compare it with the fraction denominator."),
    t("Zalogarytmuj wyrażenie i użyj ln(1+t)/t→1, gdy t→0.",
      "Take a logarithm and apply ln(1+t)/t→1 as t→0.")
  );
}

export const quadraticEulerSequenceFamilies:readonly UniversityFamily[]=[{
  id:"sequence-euler-quadratic",category:"sequence-limits",
  titles:{pl:"Granica Eulera z n² w wykładniku",en:"Euler limits with n² exponents"},
  supportedDifficulties:levels,
  create:(variant,level)=>({kind:"sequence-euler-quadratic",...createQuadraticEulerSequence(variant,level)}),
}];
