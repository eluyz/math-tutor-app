import {
  rational as r, addRational as add, subtractRational as sub,
  divideRational as div, type Rational,
} from "../rational";
import {formatRational as fmt, type AnswerSpec} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

/** D08 synthetic study with two different exclusions: a removable hole and a genuine pole.
 * Isolated staging only: no catalog, schema or renderer changes until separate approval.
 */
export type HolePoleStudyProblem = Readonly<{
  kind: "analysis-study-hole-pole";
  hole: Rational;
  pole: Rational;
  coefficient: Rational;
  shift: Rational;
}>;

const equal = (a: Rational, b: Rational) =>
  a.numerator * b.denominator === b.numerator * a.denominator;
const compare = (a: Rational, b: Rational) => {
  const difference = a.numerator * b.denominator - b.numerator * a.denominator;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
};
const excluded = (p: HolePoleStudyProblem, x: Rational) =>
  equal(x, p.hole) || equal(x, p.pole);
const positive = (p: HolePoleStudyProblem) => p.coefficient.numerator > 0n;

function validate(p: HolePoleStudyProblem) {
  if (p.coefficient.numerator === 0n || equal(p.hole, p.pole))
    throw Error("Requires nonzero coefficient and distinct removable hole/pole");
}

export function makeHolePoleStudy(variant: number, level: Difficulty): HolePoleStudyProblem {
  if (!Number.isInteger(variant) || variant < 0 || variant >= 24 ||
      !["hard", "advanced", "expert"].includes(level))
    throw Error("Unsupported D08 variant/difficulty");
  const den = level === "hard" ? 1 : level === "advanced" ? 2 : 3;
  const pole = r(variant % 7 - 3, den);
  const displacement = r((variant % 2 === 0 ? 1 : -1) * (2 + variant % 5), den);
  return {
    kind: "analysis-study-hole-pole",
    pole,
    hole: add(pole, displacement),
    coefficient: r((variant % 2 === 0 ? 1 : -1) * (1 + variant % 4), den),
    shift: r(variant % 7 - 3, den),
  };
}

export const holePoleStudyStage = {
  id: "analysis-study-hole-pole", category: "derivatives",
  titles: {
    pl: "Pełne badanie funkcji z dziurą i biegunem",
    en: "Complete study of a rational function with a hole and pole",
  },
  supportedDifficulties: ["hard", "advanced", "expert"],
  variantCountPerLevel: 24,
  create: makeHolePoleStudy,
} as const;

/** The original rational expression contains (x-hole) in numerator AND denominator.
 * This simplified value must never be evaluated at either original excluded input.
 */
export function holePoleStudyValue(p: HolePoleStudyProblem, x: Rational): Rational {
  validate(p);
  if (excluded(p, x)) throw Error("Function undefined at original excluded input");
  return add(p.shift, div(p.coefficient, sub(x, p.pole)));
}

export function holePoleStudyHoleLimit(p: HolePoleStudyProblem): Rational {
  validate(p);
  return add(p.shift, div(p.coefficient, sub(p.hole, p.pole)));
}

/** Candidate x-intercept may be absent because shift=0 OR because the root is the hole. */
export function holePoleStudyZero(p: HolePoleStudyProblem): Rational | null {
  validate(p);
  if (p.shift.numerator === 0n) return null;
  const candidate = sub(p.pole, div(p.coefficient, p.shift));
  return excluded(p, candidate) ? null : candidate;
}

export function presentHolePoleStudy(p: HolePoleStudyProblem, locale: Locale) {
  validate(p);
  const lesson = teaching(locale), {t} = lesson;
  const h = fmt(p.hole), b = fmt(p.pole), m = fmt(p.coefficient), k = fmt(p.shift);
  const H = "(x−(" + h + "))", B = "(x−(" + b + "))";
  const original = "[" + H + "·[(" + k + ")" + B + "+(" + m + ")]]/[" + H + "·" + B + "]";
  const holeValue = holePoleStudyHoleLimit(p);
  const [first, second] = [p.hole, p.pole].sort(compare).map(fmt);
  const derivativeSign = positive(p) ? "−" : "+";
  const leftSecond = positive(p) ? "−" : "+";
  const rightSecond = positive(p) ? "+" : "−";
  const leftInfinity = positive(p) ? "−∞" : "+∞";
  const rightInfinity = positive(p) ? "+∞" : "−∞";
  const work = (action: string, pl: string, en: string) => lesson.work(action, t(pl, en));

  work("D=ℝ\\{" + first + ", " + second + "}; x≠" + h + "; x≠" + b,
    "W mianowniku są dwa różne zera. Skrócenie czynnika nie przywraca wyłączonego x.",
    "The original denominator has two distinct zeros. Cancellation does not restore an excluded x.");
  work("f(x)=(" + k + ")+(" + m + ")/" + B + "; x∈D",
    "Wspólny czynnik skracamy wyłącznie na pierwotnej dziedzinie.",
    "Cancel the common factor only on the original domain.");
  work("lim(x→" + h + ") f(x)=" + fmt(holeValue) + "; f(" + h + ") " + t("nie istnieje", "is undefined"),
    "Skończona granica przy wyłączonym punkcie daje dziurę, a nie asymptotę pionową.",
    "A finite limit at an excluded input is a removable hole, not a vertical asymptote.");
  work("lim(x→" + b + "⁻)f(x)=" + leftInfinity + "; lim(x→" + b + "⁺)f(x)=" + rightInfinity,
    "Niezerowy licznik po skróceniu daje rzeczywisty biegun o przeciwnych granicach jednostronnych.",
    "The nonzero simplified numerator gives a genuine pole with opposite one-sided limits.");
  work("lim(x→±∞)f(x)=" + k + "; x=" + b + "; y=" + k,
    "Asymptoty: pionowa przy biegunie i pozioma; wyłączona dziura nie jest asymptotą.",
    "Asymptotes: vertical at the pole and horizontal; the removable hole is not an asymptote.");

  const root = holePoleStudyZero(p);
  if (p.shift.numerator === 0n) {
    work("f(x)=0 ⇔ (" + m + ")/" + B + "=0: " + t("brak", "none"),
      "Niezerowy licznik nie daje miejsc zerowych.",
      "A nonzero numerator gives no real zeros.");
  } else {
    const candidate = sub(p.pole, div(p.coefficient, p.shift));
    work("f(x)=0 ⇔ x=" + fmt(candidate) + "; " + (root === null ? t("poza D", "excluded from D") : t("w D", "in D")),
      "Rozwiązanie równania trzeba sprawdzić w pierwotnej dziedzinie.",
      "Check any algebraic root against the original domain.");
  }
  if (excluded(p, r(0))) {
    work("0∉D; " + t("brak przecięcia z OY", "no y-axis intercept"),
      "Wartość dla x=0 nie istnieje, więc nie ma przecięcia z osią OY.",
      "The function is undefined at x=0, so it has no y-axis intercept.");
  } else {
    work("f(0)=" + fmt(holePoleStudyValue(p, r(0))),
      "Przecięcie z osią OY istnieje tylko, gdy zero należy do dziedziny.",
      "The y-axis intercept exists only if zero belongs to the domain.");
  }
  work("f′(x)=−(" + m + ")/" + B + "² ≠ 0; x∈D",
    "Pochodna jest określona wszędzie w dziedzinie i nie ma zer.",
    "The derivative is defined on the domain and never vanishes.");
  work("f′: (−∞," + first + "), (" + first + "," + second + "), (" + second + ",+∞): " + derivativeSign,
    "Dziedzina dzieli się na trzy odcinki. Znak pochodnej nie zmienia się w żadnym z nich.",
    "The original domain has three intervals. The derivative keeps the same sign on each.");
  work(t("Ekstrema lokalne: brak.", "Local extrema: none."),
    "Dziura i biegun nie należą do dziedziny, a pochodna nie jest zerowa na pozostałych punktach.",
    "Neither excluded point belongs to the domain and the derivative is nonzero elsewhere.");
  work("f″(x)=2(" + m + ")/" + B + "³; f″: x<" + b + ":" + leftSecond + ", x>" + b + ":" + rightSecond + " (x∈D)",
    "Znak drugiej pochodnej zależy od strony bieguna, z zachowaniem dodatkowego wyłączenia dziury.",
    "The second derivative changes sign across the pole, with the hole remaining excluded.");
  work(t("Punkty przegięcia: brak.", "Inflection points: none."),
    "Znak f″ zmienia się wyłącznie przez biegun poza dziedziną; dziura także nie jest punktem przegięcia.",
    "The sign change occurs across a pole outside the domain; a hole is not an inflection point either.");
  work(t("Szkic na kartce: dwie gałęzie, asymptoty oraz puste kółko w dziurze.",
         "Sketch on paper: two branches, asymptotes and an open circle at the hole."),
    "Rysunek na kartce jest oceniany samodzielnie, a aplikacja sprawdza współrzędne i asymptoty.",
    "The paper sketch is self-assessed; the app checks coordinates and asymptotes.");

  const answer: AnswerSpec = {
    kind: "list", labels: ["xₕ", "yₕ", "xₚ", "yₐ"],
    values: [p.hole, holeValue, p.pole, p.shift],
  };
  return lesson.finish(
    t("Zbadaj przebieg zmienności f(x)=" + original +
      ": dziedzinę, miejsca zerowe, przecięcia z osiami, granice, asymptoty, f′, f″, monotoniczność, ekstrema i przegięcia. Narysuj szkic na kartce. Podaj (xₕ,yₕ) dziury, xₚ asymptoty pionowej i yₐ poziomej.",
      "Fully study f(x)=" + original +
      ": domain, zeros, intercepts, limits, asymptotes, f′, f″, monotonicity, extrema and inflections. Sketch on paper. Give the hole (xₕ,yₕ), the vertical asymptote xₚ and the horizontal asymptote yₐ."),
    answer,
    t("Skróć wspólny czynnik, ale zachowaj dwa wyłączenia z pierwotnego mianownika.",
      "Cancel the common factor, but keep both exclusions from the original denominator."),
    t("W dziurze granica jest skończona; przy prawdziwym biegunie f dąży do ±∞. Dopiero potem oblicz f′ i f″.",
      "The hole has a finite limit; the genuine pole has infinite one-sided limits. Then compute f′ and f″."),
  );
}