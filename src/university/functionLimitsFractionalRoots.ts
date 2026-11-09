import { rational as r, type Rational } from "../rational";
import { formatRational as fmt, limitText, type LimitValue } from "../answers";
import type { Locale } from "../locales/types";
import { teaching, type Presentation } from "./teaching";

/**
 * G04 staged source-SHAPE method: competing x^(1/2) and x^(1/3) at +infinity.
 * Synthetic coefficients only; not yet registered in the student catalog.
 * A separate integration/visual QA gate is required before publication.
 */
export type FractionalRootLimitProblem = Readonly<{
  kind: "limit-mixed-fractional-roots";
  mode: "sqrt-over-cuberoot" | "cuberoot-over-sqrt";
  a: Rational;
  b: Rational;
  c: Rational;
  d: Rational;
}>;

export const fractionalRootLimitStage = {
  id: "limit-mixed-fractional-roots",
  variantCount: 24,
  supportedDifficulties: ["hard"] as const,
};

/** Exactly 24 synthetic cases; neither source coefficients nor answer keys. */
export function createFractionalRootLimit(variant: number): FractionalRootLimitProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= fractionalRootLimitStage.variantCount) {
    throw new Error("Unsupported fractional-root variant");
  }
  const leading = [2, -1, -3, 4] as const;
  const divisor = [3, -2, 4, -5] as const;
  return {
    kind: "limit-mixed-fractional-roots",
    mode: variant % 3 === 1 ? "cuberoot-over-sqrt" : "sqrt-over-cuberoot",
    a: r(leading[variant % leading.length]),
    b: r((variant * 5) % 9 - 4),
    c: r(2 + (variant % 7)),
    d: r(divisor[Math.floor(variant / 2) % divisor.length]),
  };
}

/** Exact asymptotic classification; never estimates an infinity numerically. */
export function fractionalRootLimit(p: FractionalRootLimitProblem): LimitValue {
  if (p.a.numerator === 0n || p.d.numerator === 0n) {
    throw new Error("Nonzero leading coefficients required");
  }
  if (p.mode === "cuberoot-over-sqrt") {
    return { kind: "finite", value: r(0) };
  }
  return {
    kind: (p.a.numerator > 0n) === (p.d.numerator > 0n)
      ? "positive-infinity" : "negative-infinity",
  };
}

export function presentFractionalRootLimit(p: FractionalRootLimitProblem, locale: Locale): Presentation {
  const lesson = teaching(locale), { t } = lesson;
  const first = p.mode === "sqrt-over-cuberoot" ? "√x" : "∛x";
  const second = p.mode === "sqrt-over-cuberoot" ? "∛x" : "√x";
  const expr = "((" + fmt(p.a) + ")·" + first + "+(" + fmt(p.b) + "))/((" +
    fmt(p.c) + ")+(" + fmt(p.d) + ")·" + second + ")";
  const result = fractionalRootLimit(p);
  lesson.work(
    "x>0, x→+∞; √x=x^(1/2), ∛x=x^(1/3); 1/2>1/3",
    t(
      "Oba pierwiastki są określone. Mianownik jest ostatecznie niezerowy, bo współczynnik dominującego pierwiastka d≠0.",
      "Both roots are defined. The denominator is eventually nonzero because the coefficient d of its dominant root is nonzero.",
    ),
  );
  if (p.mode === "sqrt-over-cuberoot") {
    lesson.work(
      "f(x)=[(" + fmt(p.a) + ")x^(1/6)+(" + fmt(p.b) +
      ")/x^(1/3)]/[(" + fmt(p.d) + ")+(" + fmt(p.c) + ")/x^(1/3)]",
      t(
        "Dzielimy licznik i mianownik przez x^(1/3). W liczniku pozostaje rosnące x^(1/6), w mianowniku niezerowa stała d.",
        "Divide numerator and denominator by x^(1/3). A growing x^(1/6) remains in the numerator and the denominator tends to nonzero d.",
      ),
    );
    lesson.work(
      "x^(1/6)→+∞; sign(a/d)=" +
      ((p.a.numerator > 0n) === (p.d.numerator > 0n) ? "+" : "−"),
      t(
        "O znaku nieskończonej granicy decyduje iloraz współczynników wiodących a/d.",
        "The sign of the infinite limit is determined by the leading-coefficient ratio a/d.",
      ),
    );
  } else {
    lesson.work(
      "f(x)=[(" + fmt(p.a) + ")/x^(1/6)+(" + fmt(p.b) +
      ")/x^(1/2)]/[(" + fmt(p.d) + ")+(" + fmt(p.c) + ")/x^(1/2)]",
      t(
        "Dzielimy przez x^(1/2). Licznik dąży do zera, zaś mianownik do niezerowego d.",
        "Divide by x^(1/2). The numerator tends to zero while the denominator tends to nonzero d.",
      ),
    );
    lesson.work(
      "x^(−1/6)→0; x^(−1/2)→0; lim f(x)=0",
      t(
        "Wolniej rosnący pierwiastek sześcienny nie równoważy pierwiastka kwadratowego w mianowniku.",
        "The slower-growing cube root cannot balance the square root in the denominator.",
      ),
    );
  }
  lesson.work(
    "lim f(x)=" + limitText(result),
    t(
      "Porównanie wykładników i znaku współczynników daje dokładną klasyfikację granicy.",
      "Comparing exponents and leading-coefficient signs gives the exact limit classification.",
    ),
  );
  return lesson.finish(
    t("Wyznacz granicę przy x→+∞. ", "Find the limit as x→+∞. ") + "f(x)=" + expr,
    { kind: "limit", value: result },
    t("Zapisz √x i ∛x jako potęgi x o wykładnikach ułamkowych.",
      "Write √x and ∛x as fractional powers of x."),
    t("Porównaj 1/2 z 1/3, podziel przez potęgę dominującą w mianowniku i sprawdź znak.",
      "Compare 1/2 and 1/3, divide by the denominator's dominant power, and check the sign."),
  );
}
