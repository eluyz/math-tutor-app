import {
  addRational as add,
  divideRational as div,
  equalRational as equal,
  multiplyRational as mul,
  rational as r,
  subtractRational as sub,
  type Rational,
} from "../rational";
import { formatRational as fmt, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import { teaching, type Presentation } from "./teaching";

/** U04 source-shape candidate: FIVE unknowns (x,y,z,u,v), FIVE equality
 * signs, SIX affine expressions; only x is requested. Do not confuse with
 * the existing, independently published system-chain-five, whose six
 * expressions contain only two unknowns (x,y).
 *
 * Staged in isolation: do not register in the catalog or change the
 * historical question/archive keys without separate integration review.
 */
export type FiveUnknownChainExpression = Readonly<{
  coefficients: readonly [Rational, Rational, Rational, Rational, Rational];
  constant: Rational;
}>;
export type FiveUnknownChainProblem = Readonly<{
  kind: "linear-chain-five-unknowns";
  expressions: readonly [
    FiveUnknownChainExpression,
    FiveUnknownChainExpression,
    FiveUnknownChainExpression,
    FiveUnknownChainExpression,
    FiveUnknownChainExpression,
    FiveUnknownChainExpression,
  ];
  target: "x";
}>;

const variables = ["x", "y", "z", "u", "v"] as const;
const supported = ["medium", "hard", "advanced", "expert"] as const;

/** Deterministic synthetic source-SHAPE variants. Never publish numbers
 * copied from the user's private university worksheet or answer key. */
export function constructFiveUnknownChain(variant: number, level: Difficulty): FiveUnknownChainProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !supported.includes(level as typeof supported[number]))
    throw new Error("Unsupported five-unknown equality-chain variant");
  const tier = supported.indexOf(level as typeof supported[number]);
  const k = 2 + 3 * tier + (variant % 5);
  const constants = [
    r(12 + (variant % 7) - 3),
    r(9 + ((variant * 3) % 11) - 5),
    r(7 + ((variant * 5) % 13) - 6),
    r(6 + ((variant * 7) % 17) - 8),
    r(((variant * 11) % 19) - 9),
    r(15 + (variant % 9) - 4),
  ];
  const terms: readonly (readonly [number, number, number, number, number])[] = [
    [1, 1, 0, 0, 0], [0, 1, 1, 0, 0], [0, 0, 1, 1, 0],
    [0, 0, 0, 1, 1], [k, 0, 0, 0, 1], [0, 0, 0, 0, 0],
  ];
  const expressions = terms.map((terms, i) => ({
    coefficients: terms.map(value => r(value)) as [Rational, Rational, Rational, Rational, Rational],
    constant: constants[i],
  })) as unknown as FiveUnknownChainProblem["expressions"];
  return { kind: "linear-chain-five-unknowns", expressions, target: "x" };
}

const evaluate = (e: FiveUnknownChainExpression, values: readonly Rational[]): Rational =>
  e.coefficients.reduce((sum, coefficient, i) => add(sum, mul(coefficient, values[i])), e.constant);

const checkShape = (p: FiveUnknownChainProblem) => {
  const e = p.expressions;
  if (e.length !== 6 || p.target !== "x" || e.some(row => row.coefficients.length !== 5))
    throw Error("Exactly six expressions, five unknowns, x requested");
  const k = e[4].coefficients[0];
  const expected: readonly (readonly number[])[] = [
    [1, 1, 0, 0, 0], [0, 1, 1, 0, 0], [0, 0, 1, 1, 0],
    [0, 0, 0, 1, 1], [-1, 0, 0, 0, 1], [0, 0, 0, 0, 0],
  ];
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 5; j++)
      if (!equal(e[i].coefficients[j], i === 4 && j === 0 ? k : r(expected[i][j])))
        throw Error("Noncanonical five-unknown equality-chain source shape");
  if (equal(add(k, r(1)), r(0))) throw Error("Nonunique five-unknown equality-chain");
  return k;
};

export function solveFiveUnknownChain(p: FiveUnknownChainProblem):
  readonly [Rational, Rational, Rational, Rational, Rational] {
  const k = checkShape(p), E = p.expressions, S = E[5].constant;
  const [A, B, C, D, T] = E.slice(0, 5).map(e => e.constant);
  // Chain equations:
  // x+y=S−A; y+z=S−B; z+u=S−C; u+v=S−D; kx+v=S−T.
  // Hence v=x+A+C−B−D and (k+1)x=S−T−A−C+B+D.
  const numerator = sub(add(add(S, B), D), add(add(T, A), C));
  const x = div(numerator, add(k, r(1)));
  const y = sub(sub(S, A), x);
  const z = sub(sub(S, B), y);
  const u = sub(sub(S, C), z);
  const v = sub(sub(S, D), u);
  const values = [x, y, z, u, v] as const;
  const calculated = E.map(e => evaluate(e, values));
  if (!calculated.every(value => equal(value, S)))
    throw Error("Not all five original equality signs hold");
  return values;
}

export function presentFiveUnknownChain(p: FiveUnknownChainProblem, locale: Locale): Presentation {
  const k = checkShape(p), { t, work, finish } = teaching(locale);
  const E = p.expressions, [x, y, z, u, v] = solveFiveUnknownChain(p);
  const [A, B, C, D, T, S] = E.map(e => e.constant);
  const print = (e: FiveUnknownChainExpression): string => {
    const pieces = [fmt(e.constant)];
    for (let i = 0; i < 5; i++)
      if (!equal(e.coefficients[i], r(0)))
        pieces.push(`(${fmt(e.coefficients[i])})·${variables[i]}`);
    return pieces.join(" + ");
  };
  const chain = E.map(print).join(" = ");
  work(chain, t(
    "Sześć wyrażeń, pięć znaków równości oraz pięć różnych niewiadomych x,y,z,u,v. Ostatnie wyrażenie jest stałe.",
    "Six expressions, five equality signs and five distinct unknowns x,y,z,u,v. The final expression is constant."));
  work(`x+y=${fmt(sub(S,A))}; y+z=${fmt(sub(S,B))}; z+u=${fmt(sub(S,C))}; u+v=${fmt(sub(S,D))}; ${fmt(k)}·x+v=${fmt(sub(S,T))}`,
    t("Porównujemy każde z pierwszych pięciu wyrażeń z ostatnim i od razu usuwamy stałe.",
      "Set each of the first five expressions equal to the final constant and isolate the variable terms."));
  work(`y=${fmt(sub(S,A))}−x; z=${fmt(sub(S,B))}−y; u=${fmt(sub(S,C))}−z; v=${fmt(sub(S,D))}−u`,
    t("Wyrażamy kolejno y, z, u i v przez poprzednią niewiadomą.", "Eliminate y, z, u and v successively using the neighboring equations."));
  const numerator = sub(add(add(S, B), D), add(add(T, A), C));
  work(`(${fmt(add(k,r(1)))})·x = ${fmt(S)}−(${fmt(T)})−(${fmt(A)})−(${fmt(C)})+(${fmt(B)})+(${fmt(D)}) = ${fmt(numerator)}`,
    t("Podstawiamy v do piątej równości. Współczynnik k+1 nie może być zerowy.",
      "Substitute v into the fifth equation. The coefficient k+1 must be nonzero."));
  work(`x=${fmt(x)}; y=${fmt(y)}; z=${fmt(z)}; u=${fmt(u)}; v=${fmt(v)}`,
    t("Odczytujemy szukane x, a pozostałe niewiadome wykorzystujemy do sprawdzenia.",
      "Compute the required x, then back-substitute to verify the other unknowns."));
  work(E.map((e, i) => `E${i+1}=${fmt(evaluate(e, [x,y,z,u,v]))}`).join("; "),
    t("Sprawdzamy wszystkie sześć wyrażeń, czyli komplet pięciu równości oryginalnego łańcucha.",
      "Verify all six original expressions, hence all five equality signs."));
  const answer: AnswerSpec = { kind: "scalar", value: x };
  return finish(
    t(`Oblicz x z łańcucha pięciu równości (niewiadome x,y,z,u,v): ${chain}.`,
      `Find x from this chain of five equalities (unknowns x,y,z,u,v): ${chain}.`),
    answer,
    t("Każde wyrażenie jest równe ostatniej stałej. Zacznij od pięciu prostych równań.",
      "Every expression equals the last constant. Start with five simple equations."),
    t("Eliminuj kolejno y,z,u,v i podstaw wynik do równania zawierającego k·x+v.",
      "Eliminate y,z,u,v in order and substitute into the equation with k·x+v."));
}

export const fiveUnknownChainStage = {
  id: "system-chain-five-unknowns",
  category: "systems" as const,
  titles: {
    pl: "Pięć niewiadomych w łańcuchu pięciu równości — oblicz x",
    en: "Five unknowns in a five-equality chain — find x",
  },
  // Broad Difficulty[] type prevents catalogue-wide `.includes("easy")` narrowing.
  supportedDifficulties: supported as readonly Difficulty[],
  create: constructFiveUnknownChain,
} as const;
