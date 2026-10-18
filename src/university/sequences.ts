import {
  rational as r,
  addRational as add,
  subtractRational as sub,
  multiplyRational as mul,
  divideRational as div,
  equalRational,
  type Rational,
} from "../rational";
import { formatRational as f, limitText, type LimitValue } from "../answers";
import { difficulties, type Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { Calculation } from "../solutions/types";
import type {
  SequenceProblem,
  RationalExpression,
  GeometricTerm,
  UniversityFamily,
} from "./schema";
import {
  polynomialProduct,
  polynomialSum,
  polynomialText,
  trim,
  zero,
  type Polynomial,
} from "./polynomial";
import { compare } from "./realSets";
import { teaching, calculate } from "./teaching";
const ratio = (
  numerator: Polynomial,
  denominator: Polynomial = [r(1)],
): RationalExpression => ({ kind: "ratio", numerator, denominator });
const difference = (
  left: RationalExpression,
  right: RationalExpression,
): RationalExpression => ({ kind: "difference", left, right });
const product = (
  left: RationalExpression,
  right: RationalExpression,
): RationalExpression => ({ kind: "product", left, right });
const finite = (value: Rational): LimitValue => ({ kind: "finite", value });
export const sameLimit = (a: LimitValue, b: LimitValue) =>
  a.kind === b.kind &&
  (a.kind !== "finite" ||
    (b.kind === "finite" && equalRational(a.value, b.value)));
function rationalProblem(v: number, level: Difficulty): SequenceProblem {
  const i = difficulties.indexOf(level),
    A = r(v - 11 || 1, i > 1 ? 2 + (v % 3) : 1),
    B = r((v % 5) - 2),
    C = r((v % 7) - 3),
    D = r(2 + (v % 3)),
    E = r(1 + (v % 2)),
    G = r(1 + (v % 4));
  if (i === 0)
    return { kind: "sequence-rational", expression: ratio([B, A], [E, D]) };
  if (i === 1) {
    const nDegree = (v % 3) + 1,
      dDegree = (Math.floor(v / 3) % 3) + 1;
    return {
      kind: "sequence-rational",
      expression: ratio(
        [
          ...Array.from({ length: nDegree }, (_, j) =>
            r(j === 0 ? v - 11 : j + 1),
          ),
          A,
        ],
        [...Array.from({ length: dDegree }, (_, j) => r(j + 1)), D],
      ),
    };
  }
  if (i === 2) {
    const nDegree = v % 4,
      dDegree = Math.floor(v / 4) % 4;
    return {
      kind: "sequence-rational",
      expression: ratio(
        [...Array.from({ length: nDegree }, (_, j) => r(v - 11 + j, 2 + j)), A],
        [...Array.from({ length: dDegree }, (_, j) => r(j + 1, 2)), D],
      ),
    };
  }
  const slope = div(A, D);
  if (i === 3)
    return {
      kind: "sequence-rational",
      expression: difference(ratio([C, B, A], [E, D]), ratio([r(0), slope])),
    };
  const constant = div(sub(B, mul(slope, E)), D),
    next = v % 4 === 0 ? add(mul(slope, G), mul(constant, E)) : C;
  return {
    kind: "sequence-rational",
    expression: product(
      ratio([r(0), r(1)]),
      difference(
        difference(
          ratio([r((v % 3) + 1), next, B, A], [G, E, D]),
          ratio([r(0), slope]),
        ),
        ratio([constant]),
      ),
    ),
  };
}
const term = (coefficient: Rational, base: Rational): GeometricTerm => ({
  coefficient,
  base,
});
function geometricProblem(v: number, level: Difficulty): SequenceProblem {
  const i = difficulties.indexOf(level),
    coefficient = r(v - 11 || 1, i > 1 ? 2 : 1),
    offset = term(r(v - 11), r(1)),
    bases = [r(0), r(1), r(-1), r(1, 2), r(-1, 2), r(2), r(-2), r(3, 2)],
    B = r(2 + (v % 3)),
    negativeB = sub(r(0), B);
  if (i === 0)
    return {
      kind: "sequence-geometric",
      terms: [term(coefficient, bases[v % 8])],
    };
  if (i === 1)
    return {
      kind: "sequence-geometric",
      terms: [term(coefficient, bases[v % 8]), offset],
    };
  if (i === 2)
    return {
      kind: "sequence-geometric",
      terms: [
        term(coefficient, v % 2 ? B : r(-1, 2)),
        term(r((v % 3) + 1), v % 2 ? sub(negativeB, r(1)) : r(1, 3)),
        offset,
      ],
    };
  if (i === 3) {
    const c = [r(2), r(-2), r(1), r(0), r(1), r(-1)][v % 6],
      other = [r(1), r(1), r(1), r(1), r(2), r(-1)][v % 6];
    return {
      kind: "sequence-geometric",
      terms: [
        term(mul(c, coefficient), B),
        term(mul(other, coefficient), negativeB),
        offset,
      ],
    };
  }
  const denominator = [term(r(3), B), term(r(1), negativeB), term(r(1), r(1))];
  const terms =
    v % 6 === 0
      ? [term(coefficient, B), term(r(1), negativeB), offset]
      : v % 6 === 1
        ? denominator.map((t) => term(mul(coefficient, t.coefficient), t.base))
        : v % 6 === 2
          ? [term(coefficient, sub(B, r(1))), offset]
          : v % 6 === 3
            ? [term(r(v + 1), add(B, r(1))), term(r(1), sub(negativeB, r(1)))]
            : v % 6 === 4
              ? [term(coefficient, sub(negativeB, r(1))), offset]
              : [term(r(-v - 1), add(B, r(1))), offset];
  return { kind: "sequence-geometric", terms, denominator };
}
function conjugateProblem(v: number, level: Difficulty): SequenceProblem {
  const mode =
      level === "medium"
        ? "basic"
        : level === "hard"
          ? "scaled"
          : level === "advanced"
            ? "multiply"
            : "second-order",
    a = mode === "multiply" ? r(0) : r(v - 11),
    b =
      mode === "multiply"
        ? r(v + 1, 2 + (v % 3))
        : r((v - 11) ** 2 + 1 + (v % 4)),
    k = mode === "scaled" ? r(2 + (v % 3)) : r(1);
  return { kind: "sequence-conjugate", mode, a, b, k };
}
export const sequenceFamilies: readonly UniversityFamily[] = [
  {
    id: "sequence-rational",
    category: "sequence-limits",
    titles: {
      pl: "Ilorazy wielomianów i redukcja",
      en: "Polynomial ratios and cancellation",
    },
    supportedDifficulties: difficulties,
    create: rationalProblem,
  },
  {
    id: "sequence-geometric",
    category: "sequence-limits",
    titles: {
      pl: "Ciągi geometryczne i oscylacje",
      en: "Geometric sequences and oscillation",
    },
    supportedDifficulties: difficulties,
    create: geometricProblem,
  },
  {
    id: "sequence-conjugate",
    category: "sequence-limits",
    titles: {
      pl: "Pierwiastki i wyrażenie sprzężone",
      en: "Square roots and conjugates",
    },
    supportedDifficulties: difficulties.filter((l) => l !== "easy"),
    create: conjugateProblem,
  },
];
export function rationalExpressionText(expression: RationalExpression): string {
  if (expression.kind === "ratio")
    return expression.denominator.length === 1 &&
      equalRational(expression.denominator[0], r(1))
      ? polynomialText(expression.numerator, "n")
      : `(${polynomialText(expression.numerator, "n")})/(${polynomialText(expression.denominator, "n")})`;
  return `(${rationalExpressionText(expression.left)}) ${expression.kind === "difference" ? "−" : "·"} (${rationalExpressionText(expression.right)})`;
}
export function collectRatio(
  expression: RationalExpression,
  trace?: Calculation[],
): { numerator: Polynomial; denominator: Polynomial } {
  if (expression.kind === "ratio")
    return {
      numerator: trim(expression.numerator),
      denominator: trim(expression.denominator),
    };
  const left = collectRatio(expression.left, trace),
    right = collectRatio(expression.right, trace);
  const numerator =
    expression.kind === "product"
      ? polynomialProduct(left.numerator, right.numerator, trace)
      : polynomialSum(
          polynomialProduct(left.numerator, right.denominator, trace),
          polynomialProduct(right.numerator, left.denominator, trace),
          true,
          trace,
        );
  return {
    numerator,
    denominator: polynomialProduct(left.denominator, right.denominator, trace),
  };
}
export function polynomialRatioLimit(
  numerator: Polynomial,
  denominator: Polynomial,
): LimitValue {
  const top = trim(numerator),
    bottom = trim(denominator);
  if (bottom.length === 1 && zero(bottom[0]))
    throw new Error("Zero polynomial denominator");
  if ((top.length === 1 && zero(top[0])) || top.length < bottom.length)
    return finite(r(0));
  const leadingRatio = div(top.at(-1)!, bottom.at(-1)!);
  return top.length === bottom.length
    ? finite(leadingRatio)
    : {
        kind:
          leadingRatio.numerator > 0n
            ? "positive-infinity"
            : "negative-infinity",
      };
}
export function paritySpectrum(
  terms: readonly GeometricTerm[],
  parity: 0 | 1,
  trace?: Calculation[],
): readonly GeometricTerm[] {
  const grouped = new Map<string, GeometricTerm>();
  for (const { coefficient, base } of terms) {
    if (zero(base)) continue; // n>=1: 0^n is identically zero, not 0^0.
    const squared = calculate("product", base, base),
      scaled = calculate("product", coefficient, parity ? base : r(1));
    trace?.push(squared, scaled);
    const key = `${squared.result.numerator}/${squared.result.denominator}`,
      previous = grouped.get(key),
      sum = calculate("sum", previous?.coefficient ?? r(0), scaled.result);
    trace?.push(sum);
    grouped.set(key, { base: squared.result, coefficient: sum.result });
  }
  return [...grouped.values()]
    .filter((t) => !zero(t.coefficient))
    .sort((a, b) => -compare(a.base, b.base));
}
function parityLimit(
  top: readonly GeometricTerm[],
  bottom?: readonly GeometricTerm[],
): LimitValue {
  const n = top[0];
  if (bottom) {
    const d = bottom[0];
    if (!d) throw new Error("Identically zero subsequence denominator");
    if (!n || compare(n.base, d.base) < 0) return finite(r(0));
    const value = div(n.coefficient, d.coefficient);
    return equalRational(n.base, d.base)
      ? finite(value)
      : {
          kind:
            value.numerator > 0n ? "positive-infinity" : "negative-infinity",
        };
  }
  if (!n || compare(n.base, r(1)) < 0) return finite(r(0));
  return equalRational(n.base, r(1))
    ? finite(n.coefficient)
    : {
        kind:
          n.coefficient.numerator > 0n
            ? "positive-infinity"
            : "negative-infinity",
      };
}
const geometricText = (terms: readonly GeometricTerm[]) =>
  terms.map((t) => `(${f(t.coefficient)})·(${f(t.base)})ⁿ`).join(" + ");
const spectrumText = (terms: readonly GeometricTerm[]) =>
  terms.length
    ? terms.map((t) => `(${f(t.coefficient)})·(${f(t.base)})ᵏ`).join(" + ")
    : "0";
export function presentSequence(p: SequenceProblem, locale: Locale) {
  const lesson = teaching(locale),
    { t } = lesson;
  const instruction = t(
    "Wyznacz granicę dla n→+∞, n≥1",
    "Find the limit as n→+∞, n≥1",
  );
  if (p.kind === "sequence-rational") {
    const trace: Calculation[] = [],
      { numerator, denominator } = collectRatio(p.expression, trace),
      top = trim(numerator),
      bottom = trim(denominator),
      value = polynomialRatioLimit(top, bottom);
    lesson.work(
      `aₙ = (${polynomialText(top, "n")})/(${polynomialText(bottom, "n")})`,
      t(
        "Sprowadzamy wyrażenie do wspólnego mianownika i redukujemy współczynniki, zanim porównamy najwyższe potęgi. Mianowniki w zadaniu są dodatnie dla n≥1.",
        "Use a common denominator and collect coefficients before comparing highest powers. The denominators in this exercise are positive for n≥1.",
      ),
      ...trace,
    );
    if (top.length === 1 && zero(top[0]))
      lesson.work(
        t(
          "Licznik jest tożsamościowo zerowy",
          "The numerator is identically zero",
        ),
        t(
          "Mianownik nie zeruje się w rozważanym ciągu, więc każdy jego wyraz jest równy zero i granica również wynosi zero.",
          "The denominator is nonzero throughout the sequence, so every term is zero and the limit is zero too.",
        ),
      );
    else {
      const degree = top.length - bottom.length;
      lesson.work(
        `aₙ = n^(${degree}) · ((${f(top.at(-1)!)}) + …)/((${f(bottom.at(-1)!)}) + …)`,
        t(
          "Wyłączamy najwyższą potęgę n osobno z licznika i mianownika. Pozostałe składniki zawierają ujemne potęgi n i dążą do zera; niezerowe współczynniki wiodące pozostają.",
          "Factor out the highest power of n separately in numerator and denominator. Remaining terms contain negative powers of n and tend to zero; the nonzero leading coefficients remain.",
        ),
      );
      lesson.work(
        `${t("Różnica stopni", "Degree difference")}: ${degree}; ${t("iloraz współczynników", "leading-coefficient ratio")} = ${f(div(top.at(-1)!, bottom.at(-1)!))}`,
        t(
          degree < 0
            ? "Ujemna różnica stopni daje ujemną potęgę n, która dąży do zera. Niezerowy skończony iloraz współczynników tego nie zmienia."
            : degree === 0
              ? "Przy równych stopniach czynnik n znika. Granicą jest dokładny iloraz współczynników wiodących; mianownik graniczny jest niezerowy."
              : "Dodatnia potęga n rośnie bez ograniczeń. Ponieważ n jest dodatnie, znak granicy niewłaściwej wyznacza iloraz współczynników wiodących.",
          degree < 0
            ? "A negative degree difference gives a negative power of n, which tends to zero. Multiplication by a finite nonzero coefficient ratio preserves that limit."
            : degree === 0
              ? "Equal degrees remove the power of n. The limit is the exact leading-coefficient ratio, with a nonzero limiting denominator."
              : "A positive power of n grows without bound. Since n is positive, the leading-coefficient ratio determines the sign of the infinite limit.",
        ),
        calculate("quotient", top.at(-1)!, bottom.at(-1)!),
      );
    }
    return lesson.finish(
      `${instruction}.\naₙ = ${rationalExpressionText(p.expression)}`,
      { kind: "limit", value },
      t(
        "Najpierw uprość całe wyrażenie. O wyniku decydują najwyższe potęgi, które nie zniknęły po redukcji.",
        "Simplify the entire expression first. The highest powers that survive cancellation determine the limit.",
      ),
      t(
        "Porównaj stopnie licznika i mianownika oraz znaki ich współczynników wiodących.",
        "Compare numerator and denominator degrees and the signs of their leading coefficients.",
      ),
    );
  }
  if (p.kind === "sequence-geometric") {
    const limits: LimitValue[] = [];
    lesson.work(
      t(
        "Rozdzielamy wyrazy parzyste i nieparzyste",
        "Separate even and odd terms",
      ),
      t(
        "Dla n=2k+p, p∈{0,1}, mamy qⁿ=qᵖ(q²)ᵏ. W ten sposób usuwamy zmienny znak i najpierw łączymy składniki o tej samej podstawie; mogą się skrócić.",
        "For n=2k+p, p∈{0,1}, qⁿ=qᵖ(q²)ᵏ. This removes alternating signs. Combine equal bases first because their coefficients may cancel.",
      ),
    );
    if (p.denominator)
      lesson.work(
        t(
          "Mianownik jest zawsze dodatni",
          "The denominator is always positive",
        ),
        t(
          "Mianownik ma postać 3Bⁿ+(−B)ⁿ+1 dla B>1. Jest nie mniejszy niż 2Bⁿ+1>0 dla każdego n≥1, więc iloraz jest określony.",
          "The denominator is 3Bⁿ+(−B)ⁿ+1 with B>1. It is at least 2Bⁿ+1>0 for every n≥1, so the ratio is defined.",
        ),
      );
    for (const parity of [0, 1] as const) {
      const trace: Calculation[] = [],
        top = paritySpectrum(p.terms, parity, trace),
        bottom = p.denominator
          ? paritySpectrum(p.denominator, parity, trace)
          : undefined,
        limit = parityLimit(top, bottom);
      limits.push(limit);
      lesson.work(
        `${t(parity ? "Podciąg nieparzysty" : "Podciąg parzysty", parity ? "Odd subsequence" : "Even subsequence")}: a₂ₖ${parity ? "₊₁" : ""} = ${bottom ? `(${spectrumText(top)})/(${spectrumText(bottom)})` : spectrumText(top)}`,
        t(
          "Po dokładnym połączeniu równych podstaw największa pozostała dodatnia podstawa dominuje. Iloraz każdej mniejszej podstawy przez największą jest mniejszy od 1, więc jego potęgi dążą do zera.",
          "After collecting equal bases exactly, the largest remaining positive base dominates. Each smaller base divided by it is less than 1, so those powers tend to zero.",
        ),
        ...trace,
      );
      lesson.work(
        `lim a₂ₖ${parity ? "₊₁" : ""} = ${limitText(limit)}`,
        t(
          bottom
            ? "Dzielimy licznik i mianownik przez dominującą podstawę mianownika do potęgi k. Mniejsza podstawa licznika daje zero, równa iloraz współczynników, większa wzrost o znaku ilorazu współczynników."
            : "Dla największej podstawy mniejszej od 1 dostajemy zero; równej 1 zostaje stały współczynnik; większej od 1 otrzymujemy odpowiedni znak nieskończoności. Pusty zbiór składników daje zero.",
          bottom
            ? "Divide numerator and denominator by the dominant denominator base to power k. A smaller numerator base gives zero, an equal base gives a coefficient ratio, and a larger one grows with the sign of that ratio."
            : "A largest base below 1 gives zero; a base of 1 leaves its constant coefficient; a base above 1 gives the corresponding signed infinity. No remaining terms means zero.",
        ),
      );
    }
    const value: LimitValue = sameLimit(limits[0], limits[1])
      ? limits[0]
      : { kind: "does-not-exist" };
    lesson.work(
      t(
        "Porównujemy granice obu podciągów",
        "Compare the two subsequence limits",
      ),
      t(
        value.kind === "does-not-exist"
          ? "Podciągi parzysty i nieparzysty mają różne granice. Cały ciąg nie ma granicy, także niewłaściwej; oscylacji nie nazywamy +∞ ani −∞."
          : "Oba podciągi mają tę samą granicę. Każdy indeks jest parzysty lub nieparzysty, więc granica całego ciągu jest właśnie tą wspólną granicą.",
        value.kind === "does-not-exist"
          ? "The even and odd subsequences have different limits. The full sequence has no limit, including an infinite one; oscillation is neither +∞ nor −∞."
          : "Both subsequences have the same limit. Every index is even or odd, so the whole sequence has that common limit.",
      ),
    );
    return lesson.finish(
      `${instruction}.\naₙ = ${p.denominator ? `(${geometricText(p.terms)})/(${geometricText(p.denominator)})` : geometricText(p.terms)}`,
      { kind: "limit", value },
      t(
        "Dla ujemnych podstaw sprawdź osobno indeksy parzyste i nieparzyste.",
        "For negative bases, examine even and odd indices separately.",
      ),
      t(
        "Połącz jednakowe podstawy przed wyborem dominującego składnika. Dwa różne wyniki podciągów oznaczają brak granicy.",
        "Combine equal bases before choosing a dominant term. Different subsequence limits mean the sequence has no limit.",
      ),
    );
  }
  const square = calculate("product", p.a, p.a),
    radicand = `(${f(mul(p.k, p.k))})·n² + (${f(p.a)})·n + (${f(p.b)})`,
    root = `√(${radicand})`,
    halfA = div(p.a, r(2)),
    correction = sub(p.b, div(square.result, r(4)));
  let expression: string, value: Rational;
  lesson.work(
    t(
      "Sprawdzamy pierwiastek i znak n",
      "Check the square root and the sign of n",
    ),
    t(
      "Mamy n≥1, więc √(n²)=n. Dodatni wyraz resztowy po uzupełnieniu kwadratu gwarantuje, że wyrażenie pod pierwiastkiem jest dodatnie.",
      "Since n≥1, √(n²)=n. The positive remainder after completing the square guarantees a positive radicand.",
    ),
  );
  if (p.mode === "second-order") {
    expression = `n·(${root} − n − (${f(halfA)}))`;
    value = div(correction, r(2));
    const quarter = calculate("quotient", square.result, r(4)),
      diff = calculate("difference", p.b, quarter.result);
    lesson.work(
      `aₙ = n·(${f(correction)})/(${root} + n + (${f(halfA)}))`,
      t(
        "Mnożymy przez sprzężenie względem całego n+a/2. Kwadraty n² i wyrazy liniowe a·n skracają się, zostawiając b−a²/4. Ponieważ b−a²/4>0, pierwiastek jest większy niż |n+a/2|, więc sprzężenie jest dodatnie.",
        "Use the conjugate of the entire n+a/2. The n² and a·n terms cancel, leaving b−a²/4. Since b−a²/4>0, the root exceeds |n+a/2|, so the conjugate is positive.",
      ),
      square,
      quarter,
      diff,
    );
    lesson.work(
      `aₙ = (${f(correction)})/(√(1 + (${f(p.a)})/n + (${f(p.b)})/n²) + 1 + (${f(halfA)})/n)`,
      t(
        "Dzielimy mianownik przez dodatnie n i skracamy n z licznika. Ciągłość pierwiastka w 1 daje w mianowniku 1+1+0=2.",
        "Divide the denominator by positive n and cancel the numerator n. Continuity of the square root at 1 gives denominator 1+1+0=2.",
      ),
      calculate("quotient", correction, r(2)),
    );
  } else {
    const multiply = p.mode === "multiply";
    expression = multiply ? `n·(${root} − n)` : `${root} − (${f(p.k)})·n`;
    value = multiply ? div(p.b, r(2)) : div(p.a, mul(r(2), p.k));
    lesson.work(
      `aₙ = ${multiply ? "n·" : ""}((${f(p.a)})·n + (${f(p.b)}))/(${root} + (${f(p.k)})·n)`,
      t(
        "Mnożymy różnicę przez jej sprzężenie i używamy (u−v)(u+v)=u²−v². Najwyższe potęgi n² znikają; dodawany pierwiastek i dodatnie k·n gwarantują niezerowy mianownik.",
        "Multiply the difference by its conjugate and use (u−v)(u+v)=u²−v². The leading n² terms cancel; the added root and positive k·n make the denominator nonzero.",
      ),
    );
    lesson.work(
      multiply
        ? `aₙ = (${f(p.b)})/(√(1 + (${f(p.b)})/n²) + 1)`
        : `aₙ = ((${f(p.a)}) + (${f(p.b)})/n)/(√((${f(mul(p.k, p.k))}) + (${f(p.a)})/n + (${f(p.b)})/n²) + (${f(p.k)}))`,
      t(
        "Dzielimy mianownik i licznik przez n. Ułamki ze stałą w liczniku i dodatnią potęgą n w mianowniku dążą do zera; ciągłość pierwiastka daje dodatni graniczny mianownik.",
        "Divide numerator and denominator by n. Constants divided by positive powers of n tend to zero; continuity of the square root gives a positive limiting denominator.",
      ),
      calculate(
        "quotient",
        multiply ? p.b : p.a,
        multiply ? r(2) : mul(r(2), p.k),
      ),
    );
  }
  return lesson.finish(
    `${instruction}.\naₙ = ${expression}`,
    { kind: "limit", value: finite(value) },
    t(
      "Różnica rosnących składników wymaga przekształcenia. Użyj wyrażenia sprzężonego.",
      "A difference of growing terms needs transformation. Use the conjugate expression.",
    ),
    t(
      "Po skróceniu najwyższych potęg podziel przez n. Pamiętaj, że √(n²)=n dla n≥1.",
      "After cancelling the highest powers, divide by n. Remember √(n²)=n for n≥1.",
    ),
  );
}
