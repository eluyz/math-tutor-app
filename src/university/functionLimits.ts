import {
  rational as r,
  addRational as add,
  subtractRational as sub,
  multiplyRational as mul,
  divideRational as div,
  type Rational,
} from "../rational";
import { formatRational as f, limitText, type LimitValue } from "../answers";
import { difficulties, type Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { Calculation } from "../solutions/types";
import { teaching, calculate } from "./teaching";
import type { FunctionLimitProblem, UniversityFamily } from "./schema";
import {
  polynomialValue,
  polynomialProduct,
  polynomialText,
  expandFormula,
  formulaText,
  trim,
  zero,
  type Polynomial,
  type PolynomialFormula,
} from "./polynomial";
import {
  rationalProblem,
  collectRatio,
  rationalExpressionText,
  polynomialRatioLimit,
} from "./sequences";
const poly = (coefficients: Polynomial): PolynomialFormula => ({
  kind: "polynomial",
  coefficients,
});
const negative = (x: Rational) => sub(r(0), x);
const power = (p: Polynomial, n: number): Polynomial =>
  Array.from({ length: n }).reduce<Polynomial>(
    (value) => polynomialProduct(value, p),
    [r(1)],
  );
function pointProblem(v: number, level: Difficulty): FunctionLimitProblem {
  const i = difficulties.indexOf(level),
    at = r(v - 11, i > 1 ? 2 + (v % 3) : 1),
    root = [negative(at), r(1)],
    lead = r(v % 2 ? -2 : 3, i > 1 ? 2 : 1),
    side = ["both", "left", "right"][v % 3] as "both" | "left" | "right";
  if (i === 0)
    return {
      kind: "limit-point",
      numerator: poly([r((v % 5) - 2), lead, r(v % 3)]),
      denominator: v % 2 ? [r(1)] : [sub(r(1), at), r(1)],
      at,
      side: "both",
    };
  if (i === 1) {
    const other = add(at, r(1 + (v % 3)));
    return {
      kind: "limit-point",
      numerator: poly(polynomialProduct(root, [negative(other), lead])),
      denominator: root,
      at,
      side: "both",
      definedAt: v % 2 ? add(sub(mul(lead, at), other), r(1)) : undefined,
    };
  }
  if (i === 2)
    return {
      kind: "limit-point",
      numerator: poly([r(v - 11 || 1)]),
      denominator: power(root, 1 + (v % 2)),
      at,
      side,
      definedAt: r(v - 7),
    };
  if (i === 3) {
    const original = [r(v - 11), r((v % 3) - 1), lead],
      slope = add(original[1], mul(r(2), mul(lead, at))),
      value = polynomialValue(original, at),
      line = [sub(value, mul(slope, at)), slope];
    return {
      kind: "limit-point",
      numerator: {
        kind: "difference",
        left: poly(original),
        right: poly(line),
      },
      denominator: power(root, 1 + (v % 3)),
      at,
      side,
      definedAt: add(value, r(1)),
    };
  }
  const outer = [r((v % 3) - 1), r((v % 5) - 2), lead],
    inner = [r(v - 11), r(1, 2), r(1)],
    composed = expandFormula({ kind: "composition", outer, inner });
  // Subtract a supplied polynomial with the same initial local coefficients.
  // The learner must compose, collect and factor the given expression first.
  const shifted = expandFormula({
      kind: "composition",
      outer: composed,
      inner: [at, r(1)],
    }),
    order = 2 + (v % 2);
  const correction = expandFormula({
    kind: "composition",
    outer: shifted.slice(0, order),
    inner: [negative(at), r(1)],
  });
  return {
    kind: "limit-point",
    numerator: {
      kind: "difference",
      left: { kind: "composition", outer, inner },
      right: poly(correction),
    },
    denominator: power(root, 2 + (v % 3)),
    at,
    side,
    definedAt: r(v - 11),
  };
}
export const functionLimitFamilies: readonly UniversityFamily[] = [
  {
    id: "limit-conjugate",
    category: "function-limits",
    titles: { pl: "Granice z pierwiastkami i sprzężeniem", en: "Limits with square roots and conjugates" },
    supportedDifficulties: difficulties.filter(l => l !== "easy"),
    create: (v, l) => ({
      kind: "limit-conjugate", at: r(v - 11, 2 + v % 3),
      s: r(1 + v % 4), k: r(v - 11 || 1, 2),
      b: l === "medium" ? r(0) : l === "hard" ? r((v % 2 ? -1 : 1) * (1 + v % 5), 3) : r(v % 5 - 2, 3), c: r(v % 5 + 1, 2),
      mode: l === "medium" ? "linear" : l === "hard" ? "quadratic" : l === "advanced" ? "second-order" : "two-roots",
    }),
  },
  {
    id: "limit-point",
    category: "function-limits",
    titles: {
      pl: "Granica w punkcie i granice jednostronne",
      en: "Point limits and one-sided limits",
    },
    supportedDifficulties: difficulties,
    create: pointProblem,
  },
  {
    id: "limit-infinity",
    category: "function-limits",
    titles: {
      pl: "Granice funkcji w nieskończoności",
      en: "Function limits at infinity",
    },
    supportedDifficulties: difficulties,
    create: (v, l) => ({
      kind: "limit-infinity",
      expression: rationalProblem(v, l).expression,
      direction: v % 2 ? "negative" : "positive",
    }),
  },
];
/** Exact repeated synthetic division by x-a. Every remainder is checked. */
export function removeAt(
  input: Polynomial,
  at: Rational,
  trace?: Calculation[],
): { order: number; residual: Polynomial; value: Rational } {
  let residual = trim(input),
    order = 0;
  if (residual.length === 1 && zero(residual[0]))
    return { order: Number.POSITIVE_INFINITY, residual, value: r(0) };
  while (zero(polynomialValue(residual, at, trace))) {
    if (residual.length === 1) throw new Error("Invalid constant factor");
    const quotient = Array.from({ length: residual.length - 1 }, () => r(0));
    quotient[quotient.length - 1] = residual.at(-1)!;
    for (let j = quotient.length - 1; j > 0; j--) {
      const product = calculate("product", at, quotient[j]),
        sum = calculate("sum", residual[j], product.result);
      trace?.push(product, sum);
      quotient[j - 1] = sum.result;
    }
    const remainder = add(residual[0], mul(at, quotient[0]));
    if (!zero(remainder)) throw new Error("Nonzero synthetic remainder");
    residual = trim(quotient);
    order++;
  }
  return { order, residual, value: polynomialValue(residual, at, trace) };
}
export function pointLimit(
  top: Polynomial,
  bottom: Polynomial,
  at: Rational,
  side: "both" | "left" | "right",
): LimitValue {
  const n = removeAt(top, at),
    den = removeAt(bottom, at);
  if (!Number.isFinite(den.order))
    throw new Error("Zero denominator polynomial");
  if (!Number.isFinite(n.order) || n.order > den.order)
    return { kind: "finite", value: r(0) };
  const coefficient = div(n.value, den.value);
  if (n.order === den.order) return { kind: "finite", value: coefficient };
  const poleOrder = den.order - n.order;
  if (side === "both" && poleOrder % 2) return { kind: "does-not-exist" };
  const sign = coefficient.numerator > 0n ? 1 : -1,
    approachSign = side === "left" && poleOrder % 2 ? -1 : 1;
  return {
    kind: sign * approachSign > 0 ? "positive-infinity" : "negative-infinity",
  };
}
export function presentFunctionLimit(p: FunctionLimitProblem, locale: Locale) {
  const lesson = teaching(locale),
    { t } = lesson;
  if (p.kind === "limit-conjugate") {
    if (p.s.numerator <= 0n) throw new Error("Positive square-root value required");
    const squared = calculate("product", p.s, p.s),
      twice = calculate("product", r(2), p.s),
      tangent = calculate("quotient", p.k, twice.result),
      radical = (b: Rational) => `√((${f(squared.result)}) + (${f(p.k)})·h + (${f(b)})·h²)`,
      root = radical(p.b),
      higher = p.mode === "second-order" || p.mode === "two-roots";
    lesson.work(`h = x − (${f(p.at)}), h→0; ${t("wyraz stały pod pierwiastkiem", "constant radicand term")} = ${f(squared.result)} > 0`,
      t("Oba kierunki są dozwolone: ciągły wielomian pod pierwiastkiem jest dodatni w pewnym otoczeniu h=0, bo w zerze wynosi s²>0. W ilorazie h≠0; 0/0 nie jest odpowiedzią.",
        "Both directions are allowed: the continuous radicand is positive in some neighbourhood of h=0 because its value there is s²>0. In the ratio h≠0; 0/0 is not an answer."), squared);
    let expression: string, value: Rational;
    if (p.mode === "two-roots") {
      const diff = calculate("difference", p.b, p.c), quotient = calculate("quotient", diff.result, twice.result);
      expression = `(${root} − ${radical(p.c)})/h²`;
      value = quotient.result;
      lesson.work(`(${root} − ${radical(p.c)})/h² = (${f(diff.result)})/(${root} + ${radical(p.c)})`,
        t("Mnożymy przez sumę pierwiastków. Stałe i wyrazy liniowe znikają w różnicy kwadratów; zostaje (b−c)h². Skracamy h² wyłącznie dla h≠0.",
          "Multiply by the sum of the roots. Constant and linear terms cancel in the difference of squares, leaving (b−c)h². Cancel h² only for h≠0."), diff);
      lesson.work(`lim = (${f(diff.result)})/(${f(twice.result)}) = ${f(value)}`,
        t("Każdy pierwiastek dąży do dodatniego s. Ich suma ma niezerową granicę 2s, więc możemy podstawić h=0 po skróceniu.",
          "Each root tends to positive s. Their sum has nonzero limit 2s, so substitution is valid after cancellation."), twice, quotient);
    } else if (p.mode === "second-order") {
      const square = calculate("product", tangent.result, tangent.result), correction = calculate("difference", p.b, square.result), quotient = calculate("quotient", correction.result, twice.result);
      expression = `(${root} − (${f(p.s)}) − (${f(tangent.result)})·h)/h²`;
      value = quotient.result;
      lesson.work(`t = (${f(p.k)})/(2·(${f(p.s)})) = ${f(tangent.result)}; (${root})² − ((${f(p.s)}) + t·h)² = (${f(correction.result)})·h²`,
        t("Sprzężenie dotyczy całego s+t·h. Wybór t=k/(2s) usuwa wyraz liniowy, bo 2s·t=k; resztą jest (b−t²)h².",
          "Conjugate the entire s+t·h. Choosing t=k/(2s) cancels the linear term since 2s·t=k; the remainder is (b−t²)h²."), twice, tangent, square, correction);
      lesson.work(`(${expression}) = (${f(correction.result)})/(${root} + (${f(p.s)}) + (${f(tangent.result)})·h) → ${f(value)}`,
        t("Skracamy h² w przebitym otoczeniu. Sprzężenie dąży do 2s>0, więc w wystarczająco małym otoczeniu nie jest zerowe.",
          "Cancel h² in a punctured neighbourhood. The conjugate tends to 2s>0, so it is nonzero in a sufficiently small neighbourhood."), quotient);
    } else {
      expression = `(${root} − (${f(p.s)}))/h`;
      value = tangent.result;
      lesson.work(`${expression} = ((${f(p.k)}) + (${f(p.b)})·h)/(${root} + (${f(p.s)}))`,
        t("Mnożymy przez sprzężenie i stosujemy różnicę kwadratów. Stałe s² znikają; skracamy h dla h≠0. Suma pierwiastka i s jest dodatnia.",
          "Multiply by the conjugate and use the difference of squares. The constants s² cancel; cancel h for h≠0. The root plus s is positive."));
      lesson.work(`lim = (${f(p.k)})/(${f(twice.result)}) = ${f(value)}`,
        t("Po skróceniu używamy ciągłości. Składnik b·h dąży do zera, a mianownik do s+s=2s, nie do zera.",
          "After cancellation use continuity. The term b·h tends to zero, while the denominator tends to s+s=2s, not zero."), twice, tangent);
    }
    return lesson.finish(`${t("Wyznacz granicę", "Find the limit")}: x→(${f(p.at)}).\nh = x − (${f(p.at)}); f(x) = ${expression} (h≠0)`, { kind: "limit", value: { kind: "finite", value } },
      t(higher ? "Sprawdź, które składniki znikną po pomnożeniu przez sprzężenie całej różnicy." : "Pomnóż licznik i mianownik przez sumę pierwiastka i odejmowanej liczby.",
        higher ? "Check which terms cancel when conjugating the entire difference." : "Multiply numerator and denominator by the root plus the subtracted number."),
      t("Skracaj tylko dla h≠0. Następnie sprawdź, czy graniczny mianownik jest niezerowy.", "Cancel only for h≠0, then check that the limiting denominator is nonzero."));
  }
  if (p.kind === "limit-infinity") {
    const trace: Calculation[] = [],
      collected = collectRatio(p.expression, trace),
      negative = p.direction === "negative";
    lesson.work(
      `f(x) = (${polynomialText(collected.numerator)})/(${polynomialText(collected.denominator)})`,
      t(
        "Najpierw redukujemy całe wyrażenie do jednego ilorazu. Różnica dwóch rosnących składników może usuwać najwyższe potęgi, dlatego nie oceniamy ich osobno.",
        "First collect the whole expression as one ratio. Subtracting growing terms can cancel leading powers, so do not assess those terms separately.",
      ),
      ...trace.splice(0),
    );
    const transform = (values: Polynomial) =>
        values.map((v, i) => (negative && i % 2 ? mul(r(-1), v) : v)),
      top = transform(collected.numerator),
      bottom = transform(collected.denominator),
      value = polynomialRatioLimit(top, bottom),
      a = trim(top),
      b = trim(bottom);
    lesson.work(
      `${negative ? "x = −t" : "x = t"}, t→+∞: f(${negative ? "−" : ""}t) = (${polynomialText(top, "t")})/(${polynomialText(bottom, "t")})`,
      t(
        "Sprowadzamy oba kierunki do t→+∞. Dla x=−t potęgi nieparzyste zmieniają znak, a parzyste go zachowują.",
        "Reduce both directions to t→+∞. With x=−t, odd powers change sign while even powers keep it.",
      ),
    );
    const difference = a.length - b.length,
      coefficient = div(a.at(-1)!, b.at(-1)!);
    lesson.work(
      `${t("Różnica stopni", "Degree difference")}: ${difference}; ${t("iloraz współczynników", "leading-coefficient ratio")} = ${f(coefficient)}`,
      t(
        "Wyłączamy najwyższe potęgi t. Ujemna różnica stopni daje zero, równa zero iloraz współczynników; dodatnia prowadzi do nieskończoności ze znakiem tego ilorazu. To analiza dokładnego wzoru, nie kilku przybliżeń.",
        "Factor the highest powers of t. A negative degree difference gives zero; zero gives the coefficient ratio; a positive difference gives infinity with that ratio's sign. This uses the exact formula, not a few approximations.",
      ),
      calculate("quotient", a.at(-1)!, b.at(-1)!),
    );
    return lesson.finish(
      `${t("Wyznacz granicę", "Find the limit")}: x→${negative ? "−" : "+"}∞.\nf(x) = ${rationalExpressionText(p.expression, "x")}`,
      { kind: "limit", value },
      t(
        "Uprość wyrażenie przed porównaniem stopni. Dla −∞ podstaw x=−t.",
        "Simplify before comparing degrees. For −∞ substitute x=−t.",
      ),
      t(
        "Sprawdź, które potęgi zmieniają znak. Dopiero po redukcji wybierz dominujące składniki.",
        "Check which powers change sign. Choose dominant terms only after cancellation.",
      ),
    );
  }
  const trace: Calculation[] = [],
    numerator = expandFormula(p.numerator, trace),
    nAt = polynomialValue(numerator, p.at, trace),
    dAt = polynomialValue(p.denominator, p.at, trace),
    value = pointLimit(numerator, p.denominator, p.at, p.side);
  lesson.work(
    `N(x) = ${polynomialText(numerator)}; N(${f(p.at)}) = ${f(nAt)}; M(${f(p.at)}) = ${f(dAt)}`,
    t(
      "Rozwijamy licznik i sprawdzamy podstawienie do oryginalnego ilorazu. Niezerowy mianownik pozwala użyć ciągłości, ale 0/0 jest postacią nieoznaczoną, a nie wynikiem granicy.",
      "Expand the numerator and substitute into the original ratio. A nonzero denominator allows continuity, but 0/0 is an indeterminate form, never the limit itself.",
    ),
    ...trace.splice(0),
  );
  const n = removeAt(numerator, p.at, trace),
    den = removeAt(p.denominator, p.at, trace);
  if (Number.isFinite(n.order))
    lesson.work(
      `N(x) = (x − (${f(p.at)}))^${n.order}·(${polynomialText(n.residual)}); M(x) = (x − (${f(p.at)}))^${den.order}·(${polynomialText(den.residual)})`,
      t(
        "Dzielimy dokładnie przez x−a, dopóki reszta z podstawienia wynosi zero. Skracanie jest dozwolone w przebitym otoczeniu a, gdzie x≠a. Pozostały mianownik ma niezerową wartość w a.",
        "Divide exactly by x−a while substitution gives zero remainder. Cancellation is valid in a punctured neighbourhood where x≠a. The residual denominator is nonzero at a.",
      ),
      ...trace.splice(0),
    );
  else
    lesson.work(
      t(
        "Licznik jest zerowym wielomianem",
        "The numerator is the zero polynomial",
      ),
      t(
        "W przebitym otoczeniu punktu funkcja jest równa zero, zatem granica wynosi zero niezależnie od wartości w samym punkcie.",
        "In a punctured neighbourhood the function is zero, so its limit is zero regardless of its value at the point.",
      ),
      ...trace.splice(0),
    );
  if (value.kind === "finite")
    lesson.work(
      `lim f(x) = ${f(value.value)}`,
      t(
        n.order > den.order
          ? "Po skróceniu pozostaje dodatnia potęga x−a. Dąży ona do zera, a resztowy iloraz jest ciągły i skończony."
          : "Potęgi x−a skracają się w całości. Podstawiamy a do ciągłego ilorazu pozostałych czynników o niezerowym mianowniku.",
        n.order > den.order
          ? "After cancellation a positive power of x−a remains. It tends to zero while the residual ratio is finite and continuous."
          : "The powers of x−a cancel completely. Substitute a into the continuous residual ratio with its nonzero denominator.",
      ),
    );
  else {
    const left = pointLimit(numerator, p.denominator, p.at, "left"),
      right = pointLimit(numerator, p.denominator, p.at, "right");
    lesson.work(
      `limₓ→ₐ₋ f(x) = ${limitText(left)}; limₓ→ₐ₊ f(x) = ${limitText(right)}`,
      t(
        "Niezerowy resztowy iloraz zachowuje znak blisko a. Parzysta potęga x−a jest dodatnia po obu stronach, nieparzysta ma przeciwne znaki. Granica obustronna istnieje tylko przy zgodnych granicach jednostronnych.",
        "The nonzero residual ratio keeps its sign near a. An even power of x−a is positive on both sides; an odd power has opposite signs. A two-sided limit requires matching one-sided limits.",
      ),
    );
  }
  if (p.definedAt !== undefined)
    lesson.work(
      `f(${f(p.at)}) = ${f(p.definedAt)}; ${t("granica", "limit")} = ${limitText(value)}`,
      t(
        "Wartość zdefiniowana w jednym punkcie nie zmienia granicy. Granica opisuje wartości funkcji dla argumentów zbliżających się do punktu, a nie obowiązkowo jej wartość w tym punkcie.",
        "Changing a function at one point does not change its limit. A limit describes nearby inputs approaching the point, not necessarily the value at that point.",
      ),
    );
  else if (zero(dAt))
    lesson.work(`f(${f(p.at)}) ${t("nie jest określona", "has no defined value")}`,
      t("Oryginalny mianownik w tym punkcie jest zerowy. Nie przypisujemy funkcji wartości przez skracanie; granica zależy od wartości w przebitym otoczeniu.",
        "The original denominator is zero at this point. Cancellation does not assign a function value there; the limit depends on values in a punctured neighbourhood."));
  const side = p.side === "left" ? "⁻" : p.side === "right" ? "⁺" : "";
  return lesson.finish(
    `${t("Wyznacz granicę", "Find the limit")}: x→(${f(p.at)})${side}.\nf(x) = (${formulaText(p.numerator)})/(${polynomialText(p.denominator)})${p.definedAt !== undefined ? ` ${t("dla", "for")} x≠${f(p.at)}; f(${f(p.at)}) = ${f(p.definedAt)}` : ""}`,
    { kind: "limit", value },
    t(
      "Podstaw punkt do licznika i mianownika. Przy 0/0 rozłóż i skróć czynniki.",
      "Substitute into numerator and denominator. For 0/0, factor and cancel.",
    ),
    t(
      "Po redukcji sprawdź krotności czynników i znaki po wymaganej stronie punktu. Wartość f(a) nie rozstrzyga granicy.",
      "After cancellation, check factor multiplicities and signs on the requested side. The value f(a) does not determine the limit.",
    ),
  );
}
