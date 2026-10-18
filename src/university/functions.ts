import {
  rational as r,
  addRational as add,
  subtractRational as sub,
  multiplyRational as mul,
  equalRational,
  type Rational,
} from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import {
  difficulties,
  legacyDifficulties,
  type Difficulty,
} from "../difficulty";
import type { Locale } from "../locales/types";
import type { Calculation } from "../solutions/types";
import type { FunctionProblem, UniversityFamily } from "./schema";
import { teaching, calculate } from "./teaching";
import {
  polynomialValue,
  polynomialProduct,
  polynomialComposition,
  polynomialSum,
  polynomialText,
  formulaText,
  expandFormula,
  polynomialRoots,
  exactSquareRoot,
  powerLabel,
  zero,
  type Polynomial,
  type PolynomialFormula,
} from "./polynomial";
import {
  allReals,
  excludePoints,
  intersection,
  outside,
  rightRay,
  leftRay,
  setAnswer,
  setText,
  type RealSet,
} from "./realSets";

const levelIndex = (level: Difficulty) => difficulties.indexOf(level);
const negative = (value: Rational) => sub(r(0), value);
const poly = (coefficients: Polynomial): PolynomialFormula => ({
  kind: "polynomial",
  coefficients,
});
const factors = (x: Rational, y: Rational): Polynomial =>
  polynomialProduct([negative(x), r(1)], [negative(y), r(1)]);
const fraction = (v: number, offset = 0) => r(v - 11 + offset, 2 + (v % 3));
function shape(v: number, level: Difficulty): PolynomialFormula {
  const i = levelIndex(level),
    h = fraction(v),
    k = r((v % 7) - 3, i > 1 ? 2 : 1),
    a = r(v % 2 ? -1 : 1, i > 1 ? 2 + (v % 3) : 1);
  if (i === 0) return { kind: "vertex", a, h, k };
  const coefficients = expandFormula({ kind: "vertex", a, h, k });
  if (i < 3) return poly(coefficients);
  if (i === 3)
    return {
      kind: "composition",
      outer: coefficients,
      inner: [r((v % 4) - 2), r(v % 2 ? -2 : 3, 2)],
    };
  return {
    kind: "difference",
    left: { kind: "vertex", a: mul(r(3), a), h, k },
    right: { kind: "vertex", a, h: add(h, r(1)), k: r((v % 5) - 2) },
  };
}
function valueProblem(v: number, level: Difficulty): FunctionProblem {
  const i = levelIndex(level),
    at = r(i === 4 ? v - 11 || 1 : v - 11, i > 1 ? 2 + (v % 3) : 1);
  const numerator =
    i === 0
      ? [r((v % 5) - 2), r((v % 3) + 1)]
      : [r((v % 7) - 3), r((v % 5) - 2), r(v % 2 ? -1 : 2, i > 1 ? 2 : 1)];
  const inner =
    i > 2
      ? i === 3
        ? [r((v % 4) - 2), r(v % 2 ? -2 : 3, 2)]
        : [r(v % 3), r(1), r(1, 2)]
      : undefined;
  let pole = add(inner ? polynomialValue(inner, at) : at, r(1));
  if (i === 4 && equalRational(pole, polynomialValue(inner!, negative(at))))
    pole = add(pole, r(1));
  return {
    kind: "function-value",
    numerator,
    denominator: i < 2 ? [r(1)] : [negative(pole), r(1)],
    at,
    inner,
    difference: i === 4,
  };
}
function domainProblem(v: number, level: Difficulty): FunctionProblem {
  const i = levelIndex(level),
    p = fraction(v),
    q = add(p, r(1 + (v % 3), 2)),
    third = add(p, r(v % 3 === 0 ? -1 : v % 3 === 1 ? 0 : 3, 2));
  return {
    kind: "function-domain",
    mode:
      i === 0
        ? v % 2
          ? "all"
          : "one-pole"
        : i === 1
          ? v % 2
            ? "two-poles"
            : "root-ray"
          : i === 2
            ? "root-over-linear"
            : i === 3
              ? "root-over-two"
              : "root-ratio",
    p,
    q,
    r: third,
    sign: r(v % 2 ? -1 : 1),
  };
}
function zerosProblem(v: number, level: Difficulty): FunctionProblem {
  const i = levelIndex(level),
    x = fraction(v),
    y = add(x, r(v % 3 === 0 ? 0 : 2)),
    pole = v % 2 ? x : add(y, r(1));
  if (i === 0)
    return {
      kind: "function-zeros",
      formula: poly([negative(x), r(1)]),
      denominator: [r(1)],
    };
  let numerator =
    v % 4 === 0 ? polynomialSum(factors(x, x), [r(1)]) : factors(x, y);
  if (i === 1)
    return {
      kind: "function-zeros",
      formula: poly(numerator),
      denominator: [r(1)],
    };
  if (i === 2)
    return {
      kind: "function-zeros",
      formula: poly(numerator),
      denominator: [negative(pole), r(1)],
    };
  if (i === 3)
    return {
      kind: "function-zeros",
      formula: {
        kind: "composition",
        outer: numerator,
        inner: [r((v % 3) - 1), r(v % 2 ? -2 : 3, 2)],
      },
      denominator: [negative(x), r(1)],
    };
  const k = r((v % 3) - 1);
  numerator = factors(pole, y);
  return {
    kind: "function-zeros",
    formula: {
      kind: "difference",
      left: poly(numerator),
      right: poly([negative(mul(k, y)), k]),
    },
    denominator: [negative(pole), r(1)],
  };
}
function linearProblem(v: number, level: Difficulty): FunctionProblem {
  const i = levelIndex(level),
    x1 = i ? fraction(v) : r(0),
    x2 = i ? add(x1, r(1 + (v % 3), i > 1 ? 2 : 1)) : r(1);
  const target: Polynomial = [
    r(v - 11, i > 1 ? 3 : 1),
    r((v % 5) - 2, i > 1 ? 2 : 1),
  ];
  const known = i > 2 ? [r((v % 7) - 3), r(v % 2 ? -2 : 3, 2)] : undefined;
  const given =
    i === 3
      ? polynomialSum(target, known!)
      : i === 4
        ? polynomialComposition(target, known!)
        : target;
  return {
    kind: "function-linear",
    points: [x1, polynomialValue(given, x1), x2, polynomialValue(given, x2)],
    known,
    relation: i === 3 ? "sum" : i === 4 ? "composition" : undefined,
  };
}
function monotonicityProblem(v: number, level: Difficulty): FunctionProblem {
  const i = levelIndex(level),
    base: Polynomial = [
      fraction(v),
      r(i === 1 ? (v % 3) - 1 || 1 : (v % 3) - 1, i === 2 ? 2 : 1),
    ];
  const formula: PolynomialFormula =
    i === 0
      ? poly(base)
      : i === 1
        ? {
            kind: "composition",
            outer: base,
            inner: [r(v - 11), r((v % 3) - 1)],
          }
        : {
            kind: "difference",
            left: poly(base),
            right: poly([r(v - 11), r((v % 5) - 2, 3)]),
          };
  return { kind: "function-monotonicity", formula };
}
function compositionProblem(v: number, level: Difficulty): FunctionProblem {
  const i = levelIndex(level),
    outer = [fraction(v), r((v % 5) - 2 || 1), ...(i > 1 ? [r(2)] : [])],
    inner = [r((v % 7) - 3), r(v % 2 ? -1 : 2), ...(i > 2 ? [r(3, 2)] : [])];
  return { kind: "function-composition", outer, inner, commutator: i === 4 };
}
export const functionFamilies: readonly UniversityFamily[] = [
  {
    id: "function-value",
    category: "functions",
    titles: {
      pl: "Wartość funkcji i podstawianie",
      en: "Function values and substitution",
    },
    supportedDifficulties: difficulties,
    create: valueProblem,
  },
  {
    id: "function-domain",
    category: "functions",
    titles: { pl: "Dziedzina funkcji", en: "Domain of a function" },
    supportedDifficulties: difficulties,
    create: domainProblem,
  },
  {
    id: "function-zeros",
    category: "functions",
    titles: {
      pl: "Miejsca zerowe i dziedzina",
      en: "Zeros and domain restrictions",
    },
    supportedDifficulties: difficulties,
    create: zerosProblem,
  },
  {
    id: "function-linear",
    category: "functions",
    titles: {
      pl: "Współczynniki funkcji liniowej",
      en: "Coefficients of a linear function",
    },
    supportedDifficulties: difficulties,
    create: linearProblem,
  },
  {
    id: "function-monotonicity",
    category: "functions",
    titles: {
      pl: "Monotoniczność funkcji liniowej",
      en: "Monotonicity of a linear function",
    },
    supportedDifficulties: legacyDifficulties,
    create: monotonicityProblem,
  },
  {
    id: "function-vertex",
    category: "functions",
    titles: {
      pl: "Wierzchołek i oś symetrii",
      en: "Vertex and axis of symmetry",
    },
    supportedDifficulties: difficulties,
    create: (v, l) => ({
      kind: "function-shape",
      target: "vertex",
      formula: shape(v, l),
    }),
  },
  {
    id: "function-range",
    category: "functions",
    titles: {
      pl: "Zbiór wartości funkcji kwadratowej",
      en: "Range of a quadratic function",
    },
    supportedDifficulties: difficulties,
    create: (v, l) => ({
      kind: "function-shape",
      target: "range",
      formula: shape(v, l),
    }),
  },
  {
    id: "function-composition",
    category: "functions",
    titles: { pl: "Złożenia funkcji", en: "Composition of functions" },
    supportedDifficulties: difficulties.filter((l) => l !== "easy"),
    create: compositionProblem,
  },
];

export function domainFormula(
  p: Extract<FunctionProblem, { kind: "function-domain" }>,
): string {
  const linear = (at: Rational) => `(x − (${f(at)}))`,
    root = `√((${f(p.sign)})·${linear(p.p)})`,
    quadratic = `${linear(p.p)}·${linear(p.q)}`;
  switch (p.mode) {
    case "all":
      return polynomialText([p.p, p.q, r(1)]);
    case "one-pole":
      return `1/${linear(p.p)}`;
    case "two-poles":
      return `1/(${quadratic})`;
    case "root-ray":
      return root;
    case "root-over-linear":
      return `√(${quadratic})/${linear(p.r)}`;
    case "root-over-two":
      return `${root}/(${linear(p.q)}·${linear(p.r)})`;
    case "root-ratio":
      return `√(${quadratic})/√((${f(p.sign)})·${linear(p.r)})`;
  }
}
export function functionDomain(
  p: Extract<FunctionProblem, { kind: "function-domain" }>,
): RealSet {
  const ray = (at: Rational, closed: boolean) =>
    p.sign.numerator > 0n ? rightRay(at, closed) : leftRay(at, closed);
  switch (p.mode) {
    case "all":
      return allReals;
    case "one-pole":
      return excludePoints(allReals, [p.p]);
    case "two-poles":
      return excludePoints(allReals, [p.p, p.q]);
    case "root-ray":
      return ray(p.p, true);
    case "root-over-linear":
      return excludePoints(outside(p.p, p.q, true), [p.r]);
    case "root-over-two":
      return excludePoints(ray(p.p, true), [p.q, p.r]);
    case "root-ratio":
      return intersection(outside(p.p, p.q, true), ray(p.r, false));
  }
}

export function presentFunction(p: FunctionProblem, locale: Locale) {
  const lesson = teaching(locale),
    { t } = lesson;
  const expansion = (formula: PolynomialFormula, name = "f") => {
    const trace: Calculation[] = [],
      result = expandFormula(formula, trace);
    lesson.work(
      `${name}(x) = ${polynomialText(result)}`,
      t(
        "Rozwijamy wszystkie nawiasy i łączymy współczynniki tych samych potęg. Złożenie oznacza podstawienie całego wyrażenia za x.",
        "Expand every bracket and collect coefficients of equal powers. Composition substitutes the entire inner expression for x.",
      ),
      ...trace,
    );
    return result;
  };
  if (p.kind === "function-value") {
    const trace: Calculation[] = [];
    const evaluate = (at: Rational) => {
      const input = p.inner ? polynomialValue(p.inner, at, trace) : at;
      if (p.inner)
        lesson.work(
          `${t("Funkcja wewnętrzna", "Inner function")}: g(${f(at)}) = ${f(input)}`,
          t(
            "Najpierw obliczamy funkcję wewnętrzną. Jej wartość staje się argumentem funkcji zewnętrznej.",
            "Evaluate the inner function first. Its value becomes the input of the outer function.",
          ),
          ...trace.splice(0),
        );
      const denominator = polynomialValue(p.denominator, input, trace),
        numerator = polynomialValue(p.numerator, input, trace);
      if (zero(denominator))
        throw new Error("Function is undefined at the selected input");
      const result = calculate("quotient", numerator, denominator);
      lesson.work(
        `f(${f(input)}) = (${f(numerator)})/(${f(denominator)}) = ${f(result.result)}`,
        t(
          "Podstawiamy argument do każdej potęgi i współczynnika. Mianownik jest niezerowy, więc możemy podzielić dokładne wartości.",
          "Substitute the input into every power and coefficient. The denominator is nonzero, so divide the exact values.",
        ),
        ...trace.splice(0),
        result,
      );
      return result.result;
    };
    let value = evaluate(p.at);
    if (p.difference) {
      const second = evaluate(negative(p.at)),
        calc = calculate("difference", value, second);
      value = calc.result;
      lesson.work(
        `f(g(${f(p.at)})) − f(g(${f(negative(p.at))})) = ${f(value)}`,
        t(
          "Odejmujemy dopiero gotowe wartości obu złożeń. Minus przed argumentem dotyczy wejścia funkcji g, a nie jej całej wartości.",
          "Subtract the two completed compositions. Negating the input of g does not negate its entire output.",
        ),
        calc,
      );
    }
    const task = p.inner
      ? p.difference
        ? `f(g(${f(p.at)})) − f(g(${f(negative(p.at))}))`
        : `f(g(${f(p.at)}))`
      : `f(${f(p.at)})`;
    return lesson.finish(
      `${t("Oblicz dokładnie", "Evaluate exactly")}: ${task}.\nf(x) = (${polynomialText(p.numerator)})/(${polynomialText(p.denominator)})${p.inner ? `\ng(x) = ${polynomialText(p.inner)}` : ""}`,
      { kind: "scalar", value },
      t(
        "Podstawiaj od środka i zachowuj nawiasy przy liczbach ujemnych.",
        "Substitute from the inside out and keep brackets around negative values.",
      ),
      t(
        "Sprawdź mianownik przed dzieleniem. Oblicz każde złożenie osobno.",
        "Check the denominator before division. Evaluate each composition separately.",
      ),
    );
  }
  if (p.kind === "function-domain") {
    const result = functionDomain(p);
    lesson.work(
      t("Warunki istnienia wzoru", "Conditions for the formula to be defined"),
      t(
        "Wielomian jest określony dla każdej liczby rzeczywistej. Wykluczamy każde zero mianownika; wyrażenie pod pierwiastkiem kwadratowym musi być nieujemne.",
        "A polynomial is defined for every real number. Exclude every zero of a denominator; a square-root radicand must be nonnegative.",
      ),
    );
    if (["root-over-linear", "root-ratio"].includes(p.mode))
      lesson.work(
        `(x − (${f(p.p)}))(x − (${f(p.q)})) ≥ 0 ⇔ x ≤ ${f(p.p)} ∨ x ≥ ${f(p.q)}`,
        t(
          "Uporządkowane miejsca zerowe dzielą oś na trzy przedziały. Iloczyn ma znak dodatni na zewnątrz i ujemny pomiędzy nimi; końce są dozwolone w liczniku.",
          "The ordered zeros split the line into three intervals. The product is positive outside and negative between them; endpoints are allowed in a numerator.",
        ),
      );
    if (["root-ray", "root-over-two", "root-ratio"].includes(p.mode)) {
      const at = p.mode === "root-ratio" ? p.r : p.p,
        strict = p.mode === "root-ratio";
      lesson.work(
        `(${f(p.sign)})(x − (${f(at)})) ${strict ? ">" : "≥"} 0`,
        t(
          strict
            ? "Pierwiastek w mianowniku musi być ściśle dodatni: zero też uniemożliwia dzielenie. Przy ujemnym mnożniku odwracamy kierunek nierówności."
            : "Pierwiastek w liczniku dopuszcza zero. Przy dzieleniu nierówności przez ujemny mnożnik odwracamy jej kierunek.",
          strict
            ? "A square root in the denominator must be strictly positive: zero also prevents division. A negative multiplier reverses the inequality."
            : "A numerator square root allows zero. Dividing an inequality by a negative multiplier reverses its direction.",
        ),
      );
    }
    if (
      ["one-pole", "two-poles", "root-over-linear", "root-over-two"].includes(
        p.mode,
      )
    ) {
      const poles =
        p.mode === "one-pole"
          ? [p.p]
          : p.mode === "two-poles"
            ? [p.p, p.q]
            : p.mode === "root-over-linear"
              ? [p.r]
              : [p.q, p.r];
      lesson.work(
        `${t("Wykluczenia", "Excluded inputs")}: x ∉ {${poles.map(f).join("; ")}}`,
        t(
          "Każdy czynnik mianownika musi być niezerowy, także wtedy, gdy licznik również znika. Przecinamy wszystkie warunki zamiast łączyć je alternatywą.",
          "Every denominator factor must be nonzero, even if the numerator vanishes too. Intersect all the conditions rather than taking their union.",
        ),
      );
    }
    lesson.work(
      `${t("Dziedzina", "Domain")} D = ${setText(result)}`,
      t(
        "Łączymy warunki w jeden zbiór. Nawias kwadratowy zawiera koniec, okrągły go wyklucza; symbol ∪ łączy rozłączne przedziały.",
        "Combine the conditions into one set. A square bracket includes an endpoint, a round bracket excludes it; ∪ joins separate intervals.",
      ),
    );
    return lesson.finish(
      `${t("Wyznacz dziedzinę rzeczywistą", "Find the real domain")}:\nf(x) = ${domainFormula(p)}`,
      setAnswer(result, p.p),
      t(
        "Sprawdź osobno mianowniki i wyrażenia pod pierwiastkami.",
        "Check denominators and square-root radicands separately.",
      ),
      t(
        "Warunki muszą zachodzić jednocześnie. Pierwiastek w mianowniku wymaga nierówności ostrej.",
        "All conditions must hold simultaneously. A denominator square root requires a strict inequality.",
      ),
    );
  }
  if (p.kind === "function-zeros") {
    const numerator = expansion(p.formula, "N"),
      trace: Calculation[] = [],
      [c, b = r(0), a = r(0)] = numerator;
    if (!zero(a)) {
      const b2 = calculate("product", b, b),
        ac4 = calculate("product", r(4), a, c),
        delta = calculate("difference", b2.result, ac4.result);
      lesson.work(
        `Δ = (${f(b)})² − 4·(${f(a)})·(${f(c)}) = ${f(delta.result)}`,
        t(
          "Dla uporządkowanego licznika kwadratowego znak delty rozstrzyga liczbę rzeczywistych kandydatów. Ujemna delta oznacza brak miejsc zerowych.",
          "For a collected quadratic numerator, the discriminant determines the number of real candidates. A negative discriminant gives no zeros.",
        ),
        b2,
        ac4,
        delta,
      );
      if (delta.result.numerator >= 0n) {
        const root = exactSquareRoot(delta.result);
        lesson.work(
          `√Δ = ${f(root)}; x = (−(${f(b)}) ± ${f(root)})/(2·(${f(a)}))`,
          t(
            "Dokładny pierwiastek delty podstawiamy do wzoru kwadratowego. Przy delcie zero obie wartości są tym samym miejscem zerowym.",
            "Insert the exact square root into the quadratic formula. With zero discriminant both values represent the same zero.",
          ),
          calculate("product", root, root),
        );
      }
    } else
      lesson.work(
        `(${f(b)})·x = ${f(negative(c))}`,
        t(
          "Licznik liniowy zeruje się po przeniesieniu stałej i podzieleniu przez niezerowy współczynnik przy x.",
          "A linear numerator is zero after moving its constant and dividing by the nonzero coefficient of x.",
        ),
        calculate("quotient", negative(c), b),
      );
    const candidates = polynomialRoots(numerator),
      values: Rational[] = [];
    for (const candidate of candidates) {
      const n = polynomialValue(numerator, candidate, trace),
        denominator = polynomialValue(p.denominator, candidate, trace);
      if (!zero(n)) throw new Error("Invalid polynomial root");
      if (!zero(denominator)) values.push(candidate);
      lesson.work(
        `x = ${f(candidate)}: N(x) = ${f(n)}, M(x) = ${f(denominator)}`,
        t(
          zero(denominator)
            ? "Ten kandydat zeruje mianownik i nie należy do dziedziny. Skrócenie czynnika nie przywraca usuniętego punktu."
            : "Licznik jest zerowy, a mianownik niezerowy. Ten kandydat należy do dziedziny i jest miejscem zerowym funkcji.",
          zero(denominator)
            ? "This candidate makes the denominator zero and is outside the domain. Cancelling a factor does not restore the removed point."
            : "The numerator is zero and the denominator is nonzero. This candidate is in the domain and is a zero of the function.",
        ),
        ...trace.splice(0),
      );
    }
    return lesson.finish(
      `${t("Znajdź wszystkie rzeczywiste miejsca zerowe", "Find all real zeros")}:\nf(x) = (${formulaText(p.formula)})/(${polynomialText(p.denominator)})`,
      { kind: "roots", context: "zeros", values },
      t(
        "Miejsce zerowe musi zerować licznik i należeć do dziedziny.",
        "A zero must make the numerator zero and belong to the domain.",
      ),
      t(
        "Rozwiń licznik, rozwiąż równanie i odrzuć każde zero mianownika.",
        "Expand the numerator, solve its equation and reject every denominator zero.",
      ),
    );
  }
  if (p.kind === "function-linear") {
    const [x1, y1, x2, y2] = p.points,
      dy = calculate("difference", y2, y1),
      dx = calculate("difference", x2, x1),
      slope = calculate("quotient", dy.result, dx.result),
      ax = calculate("product", slope.result, x1),
      intercept = calculate("difference", y1, ax.result);
    lesson.work(
      `h(x) = (${f(slope.result)})·x + (${f(intercept.result)})`,
      t(
        "Różne argumenty dają a_h=(y₂−y₁)/(x₂−x₁). Następnie b_h=y₁−a_h x₁. Nie dzielimy przez zero, bo x₁≠x₂.",
        "Distinct inputs give a_h=(y₂−y₁)/(x₂−x₁). Then b_h=y₁−a_h x₁. The denominator is nonzero because x₁≠x₂.",
      ),
      dy,
      dx,
      slope,
      ax,
      intercept,
    );
    let a = slope.result,
      b = intercept.result;
    if (p.known) {
      const slopeCalc = calculate(
        p.relation === "sum" ? "difference" : "quotient",
        a,
        p.known[1],
      );
      a = slopeCalc.result;
      const offset =
        p.relation === "sum" ? p.known[0] : calculate("product", a, p.known[0]);
      const interceptCalc = calculate(
        "difference",
        b,
        "result" in offset ? offset.result : offset,
      );
      b = interceptCalc.result;
      lesson.work(
        `f(x) = (${f(a)})·x + (${f(b)})`,
        t(
          p.relation === "sum"
            ? "Skoro h=f+g, odejmujemy znane współczynniki funkcji g od współczynników h."
            : "Dla h=f∘g mamy a_h=a_f a_g oraz b_h=a_f b_g+b_f. Niezerowe a_g pozwala odzyskać a_f, a potem b_f.",
          p.relation === "sum"
            ? "Since h=f+g, subtract the known coefficients of g from those of h."
            : "For h=f∘g, a_h=a_f a_g and b_h=a_f b_g+b_f. Nonzero a_g lets us recover a_f and then b_f.",
        ),
        slopeCalc,
        ...("result" in offset ? [offset] : []),
        interceptCalc,
      );
    }
    const trace: Calculation[] = [],
      target = [b, a],
      check = p.known
        ? p.relation === "sum"
          ? polynomialSum(target, p.known)
          : polynomialComposition(target, p.known)
        : target;
    for (const [x, y] of [
      [x1, y1],
      [x2, y2],
    ])
      if (!equalRational(polynomialValue(check, x, trace), y))
        throw new Error("Linear reconstruction failed");
    lesson.work(
      t("Sprawdzenie obu danych punktów", "Verify both given points"),
      t(
        "Odtworzony wzór spełnia obie podane wartości. Dwa różne argumenty wyznaczają dokładnie jedną funkcję liniową.",
        "The reconstructed formula satisfies both given values. Two distinct inputs determine exactly one linear function.",
      ),
      ...trace,
    );
    return lesson.finish(
      `${t("Wyznacz a i b funkcji f(x)=ax+b", "Find a and b for f(x)=ax+b")}.\n${p.known ? `g(x) = ${polynomialText(p.known)}; h = ${p.relation === "sum" ? "f + g" : "f ∘ g"}` : "h = f"}\nh(${f(x1)}) = ${f(y1)}; h(${f(x2)}) = ${f(y2)}`,
      { kind: "list", values: [a, b], labels: ["a", "b"] },
      t(
        "Najpierw wyznacz współczynniki funkcji h na podstawie dwóch punktów.",
        "First recover the coefficients of h from its two points.",
      ),
      t(
        "Wykorzystaj różnicę wartości podzieloną przez różnicę argumentów. Następnie uwzględnij związek h z f.",
        "Divide the difference of outputs by the difference of inputs. Then use the relationship between h and f.",
      ),
    );
  }
  if (p.kind === "function-monotonicity") {
    const coefficients = expansion(p.formula),
      slope = coefficients[1] ?? r(0),
      value =
        slope.numerator > 0n
          ? "function-increasing"
          : slope.numerator < 0n
            ? "function-decreasing"
            : "function-constant";
    lesson.work(
      `x₂ > x₁ ⇒ f(x₂) − f(x₁) = (${f(slope)})·(x₂ − x₁)`,
      t(
        "Różnica argumentów jest dodatnia. Znak współczynnika przy x decyduje o znaku różnicy wartości: dodatni daje wzrost, ujemny spadek, a zero funkcję stałą.",
        "The difference of inputs is positive. The slope determines the sign of the difference of outputs: positive means increasing, negative decreasing, and zero constant.",
      ),
    );
    return lesson.finish(
      `${t("Określ monotoniczność na ℝ", "Determine monotonicity on ℝ")}:\nf(x) = ${formulaText(p.formula)}`,
      {
        kind: "choice",
        value,
        options: [
          {
            value: "function-increasing",
            label: t("Ściśle rosnąca", "Strictly increasing"),
          },
          {
            value: "function-decreasing",
            label: t("Ściśle malejąca", "Strictly decreasing"),
          },
          { value: "function-constant", label: t("Stała", "Constant") },
        ],
      },
      t(
        "Uprość wzór i sprawdź znak współczynnika przy x.",
        "Simplify the formula and inspect the sign of its slope.",
      ),
      t(
        "Wyraz wolny przesuwa wykres, ale nie zmienia monotoniczności funkcji liniowej.",
        "The intercept shifts the graph but does not change a linear function's monotonicity.",
      ),
    );
  }
  if (p.kind === "function-shape") {
    const coefficients = expansion(p.formula),
      [, b = r(0), a = r(0)] = coefficients;
    if (zero(a) || coefficients.length !== 3)
      throw new Error("A quadratic was required");
    const twiceA = calculate("product", r(2), a),
      h = calculate("quotient", negative(b), twiceA.result),
      trace: Calculation[] = [],
      k = polynomialValue(coefficients, h.result, trace);
    lesson.work(
      `xᵥ = −b/(2a) = ${f(h.result)}; yᵥ = f(xᵥ) = ${f(k)}`,
      t(
        "Po uporządkowaniu wzoru obliczamy argument wierzchołka, a następnie podstawiamy go do całej funkcji, aby otrzymać jego wysokość.",
        "After collecting the formula, compute the vertex input, then substitute it into the entire function to obtain its height.",
      ),
      twiceA,
      h,
      ...trace,
    );
    const axisCheck = calculate("sum", b, mul(twiceA.result, h.result));
    lesson.work(
      `f(x) = (${f(a)})·(x − (${f(h.result)}))² + (${f(k)}); x = ${f(h.result)}`,
      t(
        "Współczynnik liniowy po przesunięciu znika: b+2axᵥ=0. Kwadrat jest symetryczny wokół xᵥ, więc pionowa prosta x=xᵥ jest osią symetrii.",
        "The shifted linear coefficient vanishes: b+2axᵥ=0. The square is symmetric about xᵥ, so the vertical line x=xᵥ is the axis of symmetry.",
      ),
      axisCheck,
    );
    let answer: AnswerSpec;
    if (p.target === "vertex")
      answer = { kind: "list", labels: ["xᵥ", "yᵥ"], values: [h.result, k] };
    else {
      const range = a.numerator > 0n ? rightRay(k, true) : leftRay(k, true);
      lesson.work(
        `f(ℝ) = ${setText(range)}`,
        t(
          a.numerator > 0n
            ? "Kwadrat jest nieujemny, a a>0. Najmniejsza wartość to yᵥ, osiągana dla x=xᵥ; każda większa wartość też jest osiągana."
            : "Kwadrat jest nieujemny, a a<0. Największa wartość to yᵥ, osiągana dla x=xᵥ; każda mniejsza wartość też jest osiągana.",
          a.numerator > 0n
            ? "The square is nonnegative and a>0. The minimum yᵥ is attained at x=xᵥ; every larger value is attained too."
            : "The square is nonnegative and a<0. The maximum yᵥ is attained at x=xᵥ; every smaller value is attained too.",
        ),
      );
      answer = setAnswer(range, k);
    }
    return lesson.finish(
      `${t(p.target === "vertex" ? "Wyznacz wierzchołek (xᵥ,yᵥ). Oś symetrii ma równanie x=xᵥ" : "Wyznacz zbiór wartości dla dziedziny ℝ", p.target === "vertex" ? "Find the vertex (xᵥ,yᵥ). The symmetry axis is x=xᵥ" : "Find the range for domain ℝ")}.\nf(x) = ${formulaText(p.formula)}`,
      answer,
      t(
        "Najpierw sprowadź funkcję do postaci ax²+bx+c i sprawdź znak a.",
        "First collect the function as ax²+bx+c and check the sign of a.",
      ),
      t(
        "Oblicz xᵥ=−b/(2a), potem yᵥ=f(xᵥ). Wierzchołek należy do wykresu, więc końca zbioru wartości nie wykluczamy.",
        "Compute xᵥ=−b/(2a), then yᵥ=f(xᵥ). The vertex lies on the graph, so the range includes its endpoint.",
      ),
    );
  }
  const trace: Calculation[] = [],
    composed = polynomialComposition(p.outer, p.inner, trace);
  lesson.work(
    `(f ∘ g)(x) = ${polynomialText(composed)}`,
    t(
      "Podstawiamy cały wzór g do każdego wystąpienia argumentu funkcji f. Potęgujemy nawiasy, mnożymy współczynniki i łączymy te same potęgi.",
      "Substitute the entire formula for g into every input occurrence in f. Expand powers of brackets, multiply coefficients and collect equal powers.",
    ),
    ...trace.splice(0),
  );
  let coefficients = composed;
  if (p.commutator) {
    const reversed = polynomialComposition(p.inner, p.outer, trace);
    lesson.work(
      `(g ∘ f)(x) = ${polynomialText(reversed)}`,
      t(
        "Zamiana kolejności złożenia zwykle zmienia wynik. Obliczamy drugie złożenie niezależnie, zanim wykonamy odejmowanie.",
        "Reversing composition usually changes the result. Compute the other composition independently before subtracting.",
      ),
      ...trace.splice(0),
    );
    coefficients = polynomialSum(composed, reversed, true, trace);
    lesson.work(
      `(f ∘ g − g ∘ f)(x) = ${polynomialText(coefficients)}`,
      t(
        "Odejmujemy odpowiadające sobie współczynniki, również brakujące zera. Minus obejmuje cały drugi wielomian.",
        "Subtract corresponding coefficients, including missing zeros. The minus applies to the entire second polynomial.",
      ),
      ...trace,
    );
  }
  const indices = Array.from(
    { length: coefficients.length },
    (_, j) => coefficients.length - j - 1,
  );
  return lesson.finish(
    `${t("Podaj współczynniki wielomianu", "Enter the polynomial coefficients")}: ${p.commutator ? "f ∘ g − g ∘ f" : "f ∘ g"}.\nf(x) = ${polynomialText(p.outer)}\ng(x) = ${polynomialText(p.inner)}`,
    {
      kind: "list",
      values: indices.map((j) => coefficients[j]),
      labels: indices.map((j) => powerLabel(j)),
    },
    t(
      "Złożenie f∘g oznacza f(g(x)), a nie iloczyn f(x)g(x).",
      "Composition f∘g means f(g(x)), not the product f(x)g(x).",
    ),
    t(
      "Wpisz każdy współczynnik przy opisanej potędze, także zero, oraz wyraz wolny w polu 1.",
      "Enter each coefficient under its labelled power, including zero, and put the constant in the field labelled 1.",
    ),
  );
}
