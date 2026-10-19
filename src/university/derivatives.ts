import {
  rational as r,
  addRational as add,
  subtractRational as sub,
  multiplyRational as mul,
  divideRational as div,
  type Rational,
} from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import { difficulties, type Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { Calculation } from "../solutions/types";
import { teaching, calculate } from "./teaching";
import type { DerivativeProblem, UniversityFamily } from "./schema";
import {
  polynomialValue,
  polynomialSum,
  polynomialProduct,
  polynomialComposition,
  polynomialText,
  formulaText,
  expandFormula,
  polynomialRoots,
  exactSquareRoot,
  powerLabel,
  trim,
  zero,
  type Polynomial,
  type PolynomialFormula,
} from "./polynomial";
import {
  allReals,
  outside,
  leftRay,
  rightRay,
  excludePoints,
  setAnswer,
  setText,
  compare,
  type RealSet,
} from "./realSets";
type Teacher = ReturnType<typeof teaching>;
const poly = (coefficients: Polynomial): PolynomialFormula => ({
  kind: "polynomial",
  coefficients,
});
const negative = (value: Rational) => sub(r(0), value);
export function derivativeCoefficients(
  p: Polynomial,
  trace?: Calculation[],
): Polynomial {
  if (p.length === 1) return [r(0)];
  return trim(
    p.slice(1).map((coefficient, i) => {
      const calculation = calculate("product", coefficient, r(i + 1));
      trace?.push(calculation);
      return calculation.result;
    }),
  );
}
function formula(v: number, level: Difficulty): PolynomialFormula {
  const i = difficulties.indexOf(level),
    left = [r(v - 11, i ? 2 : 1), r((v % 5) - 2), r(v % 2 ? -1 : 2)],
    right = [r((v % 7) - 3), r(1, 2), r(1)];
  if (i === 0) return poly(v % 4 === 0 ? left.slice(0, 1) : v % 4 === 1 ? left.slice(0, 2) : left);
  if (i === 1)
    return { kind: "sum", left: poly(left), right: poly(right.slice(0, 2)) };
  if (i === 2) return { kind: "product", left: poly(left), right: poly(right) };
  const composed: PolynomialFormula = {
    kind: "composition",
    outer: i === 3 ? [r(0), r(0), r(0), r(1)] : [r(v % 3), r((v % 5) - 2), r(0), r(3, 2)],
    inner: i === 3 ? [r(v - 11), r(1 + v % 3, 2)] : right,
  };
  if (i === 3) return composed;
  return {
    kind: "difference",
    left: composed,
    right: {
      kind: "product",
      left: poly([r(v - 11), r(-1, 2), r(1)]),
      right: poly([r(v % 5), r(1), r(1)]),
    },
  };
}
function analysisFormula(v: number, level: Difficulty): PolynomialFormula {
  const at = r(v - 11, 2 + (v % 3)),
    lead = r(v % 2 ? -1 : 1, 2),
    base: PolynomialFormula = {
      kind: "vertex",
      a: lead,
      h: at,
      k: r((v % 5) - 2),
    };
  if (level === "hard") return poly(expandFormula(base));
  if (level === "advanced")
    return {
      kind: "composition",
      outer: expandFormula(base),
      inner: [r((v % 4) - 2), r(v % 2 ? -2 : 3, 2)],
    };
  if (v % 4 === 0) return { kind: "composition", outer: [r(v - 11), r(0), r(0), lead], inner: [negative(at), r(1)] };
  const other = add(at, r(1 + (v % 3), 2)),
    slope = polynomialProduct(
      [negative(at), r(1)],
      [negative(other), r(1)],
    ).map((x) => mul(lead, x));
  // Integration here constructs a cubic with two distinct stationary points;
  // the displayed exercise still requires differentiation and a sign chart.
  return poly([r(v - 11), ...slope.map((c, i) => div(c, r(i + 1)))]);
}
function economy(v: number, level: Difficulty): DerivativeProblem {
  const i = difficulties.indexOf(level),
    at = r(v + 1, 2),
    costCoefficients = [
      r(v + 3),
      r(2),
      r(1, 2),
      ...(i > 2 ? [r(1, 6)] : []),
    ],
    cost: PolynomialFormula = i > 2 ? { kind: "composition", outer: costCoefficients, inner: [r(1), r(1)] } : poly(costCoefficients);
  const price = [r(10 + (v + 1) ** 2), r(-1), ...(i === 4 ? [r(-1, 2)] : [])];
  const revenue: PolynomialFormula =
    i === 1
      ? poly(polynomialProduct([r(0), r(1)], price))
      : { kind: "product", left: poly([r(0), r(1)]), right: poly(price) };
  return {
    kind: "derivative-economics",
    cost,
    revenue,
    target: i === 1 ? v % 2 ? "cost" : "revenue" : "profit",
    at,
  };
}
const analysisLevels = difficulties.filter((l) =>
    ["hard", "advanced", "expert"].includes(l),
  ),
  nonEasy = difficulties.filter((l) => l !== "easy");
export const derivativeFamilies: readonly UniversityFamily[] = [
  {
    id: "derivative-rational-point", category: "derivatives",
    titles: { pl: "Pochodna ilorazu w punkcie", en: "Quotient derivative at a point" },
    supportedDifficulties: nonEasy,
    create: (v, l) => {
      const at = r(v - 11, 2), root = [negative(at), r(1)];
      return { kind: "derivative-rational", numerator: formula(v, l), at,
        denominator: l === "medium" ? [sub(r(1), at), r(1)] : polynomialSum(polynomialProduct(root, root), [r(1)], false) };
    },
  },
  {
    id: "derivative-profit-maximum", category: "derivatives",
    titles: { pl: "Maksymalny zysk z ograniczeniem produkcji", en: "Maximum profit with an output constraint" },
    supportedDifficulties: analysisLevels,
    create: (v, l) => {
      const A = r(1 + v % 3, 2), at = r(v - 8, 2), slope = mul(mul(r(2), A), at), price = r(50 + v),
        revenue: PolynomialFormula = l === "expert" ? { kind: "product", left: poly([r(0), r(1)]), right: poly([price, r(-1, 4)]) } : poly([r(0), price, r(-1, 4)]),
        cost = poly([r(v + 10), sub(price, slope), sub(A, r(1, 4))]),
        profit: PolynomialFormula = l === "hard" ? poly([r(-v - 10), slope, negative(A)]) : { kind: "difference", left: revenue, right: cost };
      return { kind: "derivative-maximum", profit, cost: l === "hard" ? undefined : cost, revenue: l === "hard" ? undefined : revenue, cap: r(3 + v % 5) };
    },
  },
  {
    id: "derivative-formula",
    category: "derivatives",
    titles: {
      pl: "Pochodna: wzór, suma, iloczyn i złożenie",
      en: "Derivative: formula, sum, product and chain rule",
    },
    supportedDifficulties: difficulties,
    create: (v, l) => ({
      kind: "derivative",
      target: "formula",
      formula: formula(v, l),
      at: r(v - 11, 2),
    }),
  },
  {
    id: "derivative-point",
    category: "derivatives",
    titles: { pl: "Pochodna w punkcie", en: "Derivative at a point" },
    supportedDifficulties: difficulties,
    create: (v, l) => ({
      kind: "derivative",
      target: "point",
      formula: formula(v, l),
      at: r(v - 11, 2),
    }),
  },
  {
    id: "derivative-tangent",
    category: "derivatives",
    titles: { pl: "Równanie stycznej", en: "Equation of the tangent" },
    supportedDifficulties: nonEasy,
    create: (v, l) => ({
      kind: "derivative",
      target: "tangent",
      formula: formula(v, l),
      at: r(v - 11, 2),
    }),
  },
  {
    id: "derivative-stationary",
    category: "derivatives",
    titles: {
      pl: "Punkty stacjonarne i ekstrema",
      en: "Stationary points and extrema",
    },
    supportedDifficulties: analysisLevels,
    create: (v, l) => ({
      kind: "derivative-analysis",
      target: "stationary",
      formula: analysisFormula(v, l),
    }),
  },
  {
    id: "derivative-monotonicity",
    category: "derivatives",
    titles: {
      pl: "Znak pochodnej i monotoniczność",
      en: "Derivative sign and monotonicity",
    },
    supportedDifficulties: analysisLevels,
    create: (v, l) => ({
      kind: "derivative-analysis",
      target: v % 2 ? "positive" : "negative",
      formula: analysisFormula(v, l),
    }),
  },
  {
    id: "derivative-economics",
    category: "derivatives",
    titles: {
      pl: "Koszt, przychód i zysk krańcowy",
      en: "Marginal cost, revenue and profit",
    },
    supportedDifficulties: nonEasy,
    create: economy,
  },
];
function differentiate(
  p: PolynomialFormula,
  lesson: Teacher,
  name = "f",
): Polynomial {
  const { t } = lesson,
    trace: Calculation[] = [];
  let result: Polynomial;
  if (p.kind === "polynomial" || p.kind === "vertex") {
    const coefficients = expandFormula(p, trace);
    result = derivativeCoefficients(coefficients, trace);
    lesson.work(
      `${name}′(x) = ${polynomialText(result)}`,
      t(
        "Różniczkujemy każdy wyraz: (c·xᵏ)′=k·c·xᵏ⁻¹ dla k≥1, a pochodna stałej wynosi zero. Dokładne współczynniki pozostają ułamkami.",
        "Differentiate each term: (c·xᵏ)′=k·c·xᵏ⁻¹ for k≥1, while a constant has derivative zero. Exact coefficients remain fractions.",
      ),
      ...trace,
    );
    return result;
  }
  if (p.kind === "composition") {
    lesson.work(`F(x) = ${polynomialText(p.outer)}; g(x) = ${polynomialText(p.inner)}; ${name}(x) = F(g(x))`,
      t("Oddzielamy funkcję zewnętrzną F od wewnętrznej g. Różniczkujemy je osobno, a potem stosujemy regułę łańcuchową.", "Separate the outer function F from the inner function g. Differentiate them separately, then apply the chain rule."));
    const outer = differentiate(poly(p.outer), lesson, "F"),
      inner = differentiate(poly(p.inner), lesson, "g"),
      composed = polynomialComposition(outer, p.inner, trace);
    result = polynomialProduct(composed, inner, trace);
    lesson.work(
      `${name}′(x) = F′(g(x))·g′(x) = ${polynomialText(result)}`,
      t(
        "Reguła łańcuchowa wymaga dwóch czynników: pochodnej zewnętrznej obliczonej w g(x) i pochodnej wewnętrznej. Samo F′(g(x)) pomija zmianę argumentu.",
        "The chain rule needs two factors: the outer derivative evaluated at g(x) and the inner derivative. F′(g(x)) alone omits the change of input.",
      ),
      ...trace,
    );
    return result;
  }
  lesson.work(`u(x) = ${formulaText(p.left)}; v(x) = ${formulaText(p.right)}`,
    t("Najpierw rozpoznajemy dwie funkcje składowe i działanie, które je łączy.", "First identify the two component functions and the operation connecting them."));
  const left = differentiate(p.left, lesson, "u"),
    right = differentiate(p.right, lesson, "v");
  if (p.kind === "product") {
    const first = polynomialProduct(left, expandFormula(p.right, trace), trace),
      second = polynomialProduct(expandFormula(p.left, trace), right, trace);
    result = polynomialSum(first, second, false, trace);
    lesson.work(
      `${name}′(x) = u′(x)v(x) + u(x)v′(x) = ${polynomialText(result)}`,
      t(
        "Reguła iloczynu to suma dwóch składników. Różniczkujemy pierwszy czynnik, pozostawiając drugi, a potem odwrotnie; nie mnożymy samych pochodnych.",
        "The product rule is a sum of two terms. Differentiate the first factor while keeping the second, then reverse the roles; do not just multiply derivatives.",
      ),
      ...trace,
    );
  } else {
    result = polynomialSum(left, right, p.kind === "difference", trace);
    lesson.work(
      `${name}′(x) = u′(x) ${p.kind === "sum" ? "+" : "−"} v′(x) = ${polynomialText(result)}`,
      t(
        "Pochodna sumy lub różnicy jest odpowiednią sumą lub różnicą pochodnych. Minus dotyczy wszystkich współczynników drugiego wielomianu.",
        "The derivative of a sum or difference is the corresponding sum or difference of derivatives. A minus applies to every coefficient in the second polynomial.",
      ),
      ...trace,
    );
  }
  return result;
}
export function positivePolynomialSet(p: Polynomial): RealSet {
  const coefficients = trim(p);
  if (coefficients.length === 1)
    return coefficients[0].numerator > 0n ? allReals : [];
  const roots = polynomialRoots(coefficients).sort(compare),
    positive = coefficients.at(-1)!.numerator > 0n;
  if (coefficients.length === 2)
    return positive ? rightRay(roots[0], false) : leftRay(roots[0], false);
  if (roots.length === 0) return positive ? allReals : [];
  if (roots.length === 1) return positive ? excludePoints(allReals, roots) : [];
  return positive
    ? outside(roots[0], roots[1], false)
    : [
        {
          lower: roots[0],
          upper: roots[1],
          lowerClosed: false,
          upperClosed: false,
        },
      ];
}
const coefficientAnswer = (coefficients: Polynomial): AnswerSpec => {
  const indices = Array.from(
    { length: coefficients.length },
    (_, i) => coefficients.length - 1 - i,
  );
  return {
    kind: "list",
    values: indices.map((j) => coefficients[j]),
    labels: indices.map((j) => powerLabel(j)),
  };
};
export function presentDerivative(p: DerivativeProblem, locale: Locale) {
  const lesson = teaching(locale),
    { t } = lesson;
  if (p.kind === "derivative-rational") {
    const trace: Calculation[] = [], top = expandFormula(p.numerator, trace), bottom = p.denominator,
      denominator = polynomialValue(bottom, p.at, trace);
    if (zero(denominator)) throw new Error("Derivative point is outside the domain");
    lesson.work(`D(${f(p.at)}) = ${f(denominator)} ≠ 0`,
      t("Przed różniczkowaniem sprawdzamy dziedzinę. Iloraz jest różniczkowalny w otoczeniu punktu tylko wtedy, gdy mianownik w nim nie znika.",
        "Check the domain before differentiating. The quotient is differentiable near the point only if its denominator is nonzero there."), ...trace.splice(0));
    const dn = differentiate(p.numerator, lesson, "N"), dd = differentiate(poly(bottom), lesson, "D"),
      nAt = polynomialValue(top, p.at, trace), dnAt = polynomialValue(dn, p.at, trace), ddAt = polynomialValue(dd, p.at, trace),
      left = calculate("product", dnAt, denominator), right = calculate("product", nAt, ddAt),
      numerator = calculate("difference", left.result, right.result), square = calculate("product", denominator, denominator),
      quotient = calculate("quotient", numerator.result, square.result);
    lesson.work(`N(a)=${f(nAt)}; N′(a)=${f(dnAt)}; D(a)=${f(denominator)}; D′(a)=${f(ddAt)}`,
      t("Podstawiamy argument do obu funkcji i obu pochodnych. Zachowujemy kolejność N′D−ND′; sama różnica pochodnych nie jest regułą ilorazu.",
        "Evaluate both functions and both derivatives. Keep the order N′D−ND′; subtracting derivatives alone is not the quotient rule."), ...trace);
    lesson.work(`f′(a) = (N′(a)D(a) − N(a)D′(a))/D(a)² = ${f(quotient.result)}`,
      t("Reguła ilorazu ma kwadrat mianownika. Wyliczamy dokładny licznik i dodatni kwadrat niezerowego mianownika, a dopiero potem dzielimy.",
        "The quotient rule squares the denominator. Calculate the exact numerator and the positive square of the nonzero denominator before dividing."), left, right, numerator, square, quotient);
    return lesson.finish(`${t("Oblicz pochodną w punkcie", "Evaluate the derivative at the point")}: f′(${f(p.at)}).\nf(x) = (${formulaText(p.numerator)})/(${polynomialText(bottom)})`,
      { kind: "scalar", value: quotient.result },
      t("Sprawdź mianownik w podanym punkcie. Następnie zastosuj regułę ilorazu.", "Check the denominator at the given point, then apply the quotient rule."),
      t("Licznik pochodnej to N′D−ND′, a mianownik D². Nie odwracaj kolejności odejmowania.", "The derivative numerator is N′D−ND′ and its denominator is D². Keep the subtraction order."));
  }
  if (p.kind === "derivative-maximum") {
    const trace: Calculation[] = [], coefficients = expandFormula(p.profit, trace), [constant, linear, leading] = coefficients;
    if (coefficients.length !== 3 || leading.numerator >= 0n || p.cap.numerator <= 0n) throw new Error("A concave quadratic and positive output cap are required");
    lesson.work(`P(q) = ${polynomialText(coefficients, "q")}; 0≤q≤${f(p.cap)}`,
      t("Zysk to przychód pomniejszony o koszt. Dopuszczamy ciągłą, rzeczywistą wielkość produkcji q w podanym przedziale; jednostki zysku są pieniężne.",
        "Profit is revenue minus cost. Output q is a continuous real quantity in the given interval; profit is measured in currency units."), ...trace.splice(0));
    const derivative = derivativeCoefficients(coefficients, trace), twoA = calculate("product", r(2), leading),
      critical = calculate("quotient", negative(linear), twoA.result),
      optimum = compare(critical.result, r(0)) < 0 ? r(0) : compare(critical.result, p.cap) > 0 ? p.cap : critical.result;
    lesson.work(`P′(q) = ${polynomialText(derivative, "q")}; P′(q)=0 ⇒ q₀=${f(critical.result)}`,
      t("Stosujemy regułę potęgową i rozwiązujemy liniowe równanie pochodnej. Punkt stacjonarny jest tylko kandydatem: musimy sprawdzić ograniczenie produkcji.",
        "Apply the power rule and solve the linear derivative equation. A stationary point is only a candidate: the output constraint still matters."), ...trace.splice(0), twoA, critical);
    lesson.work(`P″(q) = ${f(twoA.result)} < 0; q* = ${f(optimum)}`,
      t("Ujemna druga pochodna oznacza ścisłą wklęsłość. P′ jest dodatnia przed q₀ i ujemna po nim. Jeśli q₀ leży poza przedziałem, zysk jest monotoniczny na całym przedziale, więc maksimum jest na właściwym końcu.",
        "The negative second derivative gives strict concavity. P′ is positive before q₀ and negative after it. If q₀ lies outside the interval, profit is monotone throughout the interval and the appropriate endpoint maximizes it."));
    const height = polynomialValue(coefficients, optimum, trace), check = polynomialValue(derivative, optimum, trace);
    lesson.work(`P(${f(optimum)}) = ${f(height)}; P′(${f(optimum)}) = ${f(check)}`,
      t("Podstawiamy dopuszczalne q* do pierwotnego zysku. Pochodna na końcu ograniczonego przedziału nie musi być zerowa. Ujemne maksimum oznacza najmniejszą stratę przy tych założeniach.",
        "Evaluate the original profit at the feasible q*. At an interval endpoint the derivative need not be zero. A negative maximum means the smallest loss under these assumptions."), ...trace);
    const data = p.cost && p.revenue ? `C(q) = ${formulaText(p.cost).replaceAll("x", "q")}\nR(q) = ${formulaText(p.revenue).replaceAll("x", "q")}; P=R−C` : `P(q) = ${polynomialText([constant, linear, leading], "q")}`;
    return lesson.finish(`${t("Znajdź produkcję q* maksymalizującą zysk i wartość P(q*). Produkcja jest rzeczywista", "Find the output q* maximizing profit and the value P(q*). Output is real-valued")}; 0≤q≤${f(p.cap)}.\n${data}`,
      { kind: "list", labels: ["q*", "P(q*)"], values: [optimum, height] },
      t("Wyznacz funkcję zysku i jej pochodną. Uwzględnij oba końce dopuszczalnego przedziału.", "Find profit and its derivative. Include both endpoints of the feasible interval."),
      t("Ujemny współczynnik przy q² daje wklęsłość. Sprawdź położenie punktu stacjonarnego względem ograniczeń.", "A negative q² coefficient gives concavity. Check where the stationary point lies relative to the constraints."));
  }
  if (p.kind === "derivative-economics") {
    const target: PolynomialFormula =
        p.target === "cost"
          ? p.cost
          : p.target === "revenue"
            ? p.revenue
            : { kind: "difference", left: p.revenue, right: p.cost },
      name = p.target === "cost" ? "C" : p.target === "revenue" ? "R" : "P";
    lesson.work(
      "P(q) = R(q) − C(q)",
      t(
        "q oznacza wielkość produkcji, C koszt, R przychód, P zysk. Rozpatrujemy lokalną zmianę dla nieujemnego q; podana cena jest dodatnia w otoczeniu wybranego punktu.",
        "q denotes output, C cost, R revenue and P profit. Consider the local change for nonnegative q; the given price is positive near the chosen point.",
      ),
    );
    const derivative = differentiate(target, lesson, name),
      trace: Calculation[] = [],
      value = polynomialValue(derivative, p.at, trace);
    lesson.work(
      `${name}′(${f(p.at)}) = ${f(value)}`,
      t(
        "Wielkość krańcowa jest chwilowym tempem zmiany: pochodną w podanym punkcie, w jednostkach pieniężnych na jednostkę produkcji. Nie jest dokładną różnicą dla całej dodatkowej jednostki.",
        "A marginal quantity is an instantaneous rate of change: the derivative at the given output, in currency per unit of output. It is not the exact difference for a whole additional unit.",
      ),
      ...trace,
    );
    return lesson.finish(
      `${t("Oblicz", "Calculate")} ${t(p.target === "cost" ? "koszt krańcowy" : p.target === "revenue" ? "przychód krańcowy" : "zysk krańcowy", p.target === "cost" ? "marginal cost" : p.target === "revenue" ? "marginal revenue" : "marginal profit")} ${name}′(${f(p.at)}).\nC(q) = ${formulaText(p.cost).replaceAll("x", "q")}\nR(q) = ${formulaText(p.revenue).replaceAll("x", "q")}; q≥0`,
      { kind: "scalar", value },
      t(
        "Wybierz właściwą funkcję: dla zysku najpierw odejmij koszt od przychodu.",
        "Choose the relevant function: for profit, first subtract cost from revenue.",
      ),
      t(
        "Wyznacz pochodną, a dopiero potem podstaw wielkość produkcji. Krańcowy nie oznacza wartości całkowitej.",
        "Differentiate first, then substitute the output. Marginal does not mean total.",
      ),
    );
  }
  const derivative = differentiate(p.formula, lesson),
    trace: Calculation[] = [],
    coefficients = expandFormula(p.formula, trace);
  if (p.kind === "derivative-analysis") {
    const roots = polynomialRoots(derivative).sort(compare),
      second = derivativeCoefficients(derivative, trace),
      positive = positivePolynomialSet(p.target === "negative" ? derivative.map(negative) : derivative);
    if (derivative.length === 3) {
      const [c, b, a] = derivative,
        b2 = calculate("product", b, b),
        ac = calculate("product", r(4), a, c),
        delta = calculate("difference", b2.result, ac.result),
        root = exactSquareRoot(delta.result),
        divisor = calculate("product", r(2), a);
      lesson.work(
        `Δ = (${f(b)})² − 4·(${f(a)})·(${f(c)}) = ${f(delta.result)}; √Δ = ${f(root)}`,
        t(
          "Rozwiązujemy kwadratowe równanie pochodnej: x=(−b±√Δ)/(2a). Dodatnia delta daje dwa różne punkty; zerowa jeden punkt. Nie pomijamy rozwiązań.",
          "Solve the quadratic derivative equation: x=(−b±√Δ)/(2a). A positive discriminant gives two distinct points; a zero discriminant gives one. Retain every solution.",
        ),
        b2,
        ac,
        delta,
        calculate("product", root, root),
        divisor,
        calculate("quotient", sub(negative(b), root), divisor.result),
        calculate("quotient", add(negative(b), root), divisor.result),
      );
    } else if (derivative.length === 2)
      lesson.work(
        `f′(x) = 0 ⇒ x = ${f(roots[0])}`,
        t(
          "Przenosimy wyraz wolny pochodnej na drugą stronę i dzielimy przez jej niezerowy współczynnik liniowy.",
          "Move the derivative's constant to the other side and divide by its nonzero linear coefficient.",
        ),
        calculate("quotient", negative(derivative[0]), derivative[1]),
      );
    lesson.work(
      `f′(x) = 0 ⇔ x ∈ {${roots.map(f).join("; ")}}`,
      t(
        "Wielomian jest różniczkowalny na ℝ. Wszystkie punkty stacjonarne znajdujemy z dokładnego równania f′(x)=0, zachowując również ułamkowe rozwiązania.",
        "A polynomial is differentiable on ℝ. Find every stationary point from the exact equation f′(x)=0, retaining fractional solutions too.",
      ),
      ...trace.splice(0),
    );
    const coordinates: Rational[] = [];
    for (const root of roots) {
      const y = polynomialValue(coefficients, root, trace),
        curvature = polynomialValue(second, root, trace);
      coordinates.push(root, y);
      lesson.work(
        `(${f(root)}; ${f(y)}): f″(${f(root)}) = ${f(curvature)} ⇒ ${t(zero(curvature) ? "punkt stacjonarny bez ekstremum" : curvature.numerator > 0n ? "minimum lokalne" : "maksimum lokalne", zero(curvature) ? "stationary point without an extremum" : curvature.numerator > 0n ? "local minimum" : "local maximum")}`,
        t(
          zero(curvature) ? "Samo f′=0 nie wystarcza. Tutaj pochodna jest niezerową stałą razy (x−x₀)²: po obu stronach ma ten sam znak, więc funkcja przechodzi przez punkt bez ekstremum." : "Obliczamy wysokość punktu w oryginalnej funkcji. Przy f′=0 dodatnia druga pochodna daje minimum, a ujemna maksimum.",
          zero(curvature) ? "The equation f′=0 alone is insufficient. Here the derivative is a nonzero constant times (x−x₀)²: its sign is the same on both sides, so the point is not an extremum." : "Evaluate the original function for its height. At f′=0, a positive second derivative gives a minimum and a negative one a maximum.",
        ),
        ...trace.splice(0),
      );
    }
    lesson.work(
      `{x: f′(x)${p.target === "negative" ? "<" : ">"}0} = ${setText(positive)}`,
      t(
        "Miejsca zerowe pochodnej dzielą oś na przedziały stałego znaku. Dodatnia pochodna daje wzrost, a ujemna spadek. Pytamy o ostrą nierówność dla pochodnej, więc wykluczamy jej zera, nawet gdy funkcja jest monotoniczna także przez taki punkt.",
        "Derivative zeros split the line into constant-sign intervals. A positive derivative gives increase and a negative one decrease. The question asks for a strict derivative inequality, so exclude its zeros even when the function is monotone through such a point.",
      ),
    );
    const answer: AnswerSpec =
      p.target !== "stationary"
        ? setAnswer(positive, roots[0])
        : {
            kind: "list",
            values: coordinates,
            labels: roots.flatMap((_, i) => [
              `x${roots.length === 1 ? "₀" : i === 0 ? "₁" : "₂"}`,
              `y${roots.length === 1 ? "₀" : i === 0 ? "₁" : "₂"}`,
            ]),
          };
    return lesson.finish(
      `${p.target === "stationary" ? t("Znajdź współrzędne wszystkich punktów stacjonarnych; uporządkuj je według rosnącego x", "Find all stationary-point coordinates, ordered by increasing x") : t(`Wyznacz zbiór argumentów, dla których f′(x)${p.target === "negative" ? "<" : ">"}0`, `Find the set where f′(x)${p.target === "negative" ? "<" : ">"}0`)}.\nf(x) = ${formulaText(p.formula)}`,
      answer,
      t(
        "Oblicz pochodną i jej wszystkie miejsca zerowe.",
        "Calculate the derivative and all its zeros.",
      ),
      t(
        "Dla współrzędnej y wróć do f, a dla znaku i ekstremum zbadaj pochodne.",
        "Use f for the y coordinate, and the derivatives for signs and extrema.",
      ),
    );
  }
  if (p.target === "formula")
    return lesson.finish(
      `${t("Podaj współczynniki wielomianu f′(x)", "Enter the polynomial coefficients of f′(x)")}.\nf(x) = ${formulaText(p.formula)}`,
      coefficientAnswer(derivative),
      t(
        "Rozpoznaj sumę, iloczyn lub złożenie, zanim wybierzesz regułę różniczkowania.",
        "Identify a sum, product or composition before choosing a differentiation rule.",
      ),
      t(
        "Podaj współczynnik przy każdej opisanej potędze, również zero. Pole 1 oznacza stałą.",
        "Enter the coefficient of each labelled power, including zero. The field 1 means the constant.",
      ),
    );
  const slope = polynomialValue(derivative, p.at, trace);
  lesson.work(
    `f′(${f(p.at)}) = ${f(slope)}`,
    t(
      "Do wzoru pochodnej podstawiamy podany argument. To nachylenie stycznej, a nie wysokość wykresu.",
      "Substitute the given input into the derivative. This is the tangent slope, not the graph's height.",
    ),
    ...trace.splice(0),
  );
  if (p.target === "point")
    return lesson.finish(
      `${t("Oblicz pochodną w punkcie", "Evaluate the derivative at the point")}: f′(${f(p.at)}).\nf(x) = ${formulaText(p.formula)}`,
      { kind: "scalar", value: slope },
      t(
        "Najpierw wyznacz f′(x), dopiero potem podstaw argument.",
        "Find f′(x) first, then substitute the input.",
      ),
      t(
        "Wartość f(a) i pochodna f′(a) opisują inne wielkości.",
        "The function value f(a) and derivative f′(a) describe different quantities.",
      ),
    );
  const height = polynomialValue(coefficients, p.at, trace),
    product = calculate("product", slope, p.at),
    intercept = calculate("difference", height, product.result);
  lesson.work(
    `y − (${f(height)}) = (${f(slope)})(x − (${f(p.at)})) ⇒ y = (${f(slope)})·x + (${f(intercept.result)})`,
    t(
      "Styczna przechodzi przez (a,f(a)) i ma nachylenie f′(a). Stąd y=f(a)+f′(a)(x−a); sprawdzamy wyraz wolny, odejmując m·a od f(a).",
      "The tangent passes through (a,f(a)) with slope f′(a). Thus y=f(a)+f′(a)(x−a); obtain its intercept by subtracting m·a from f(a).",
    ),
    ...trace,
    product,
    intercept,
  );
  return lesson.finish(
    `${t("Wyznacz styczną y=mx+b w punkcie o argumencie", "Find the tangent y=mx+b at input")} a=${f(p.at)}.\nf(x) = ${formulaText(p.formula)}`,
    { kind: "list", labels: ["m", "b"], values: [slope, intercept.result] },
    t(
      "Styczna wymaga nachylenia f′(a) oraz punktu (a,f(a)).",
      "A tangent needs the slope f′(a) and the point (a,f(a)).",
    ),
    t(
      "Wyraz wolny to f(a)−a·f′(a), a nie sama wysokość f(a).",
      "The intercept is f(a)−a·f′(a), not just the height f(a).",
    ),
  );
}
