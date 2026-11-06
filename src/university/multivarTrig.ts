import { rational as r, type Rational } from "../rational";
import type { UniversityFamily } from "./schema";
import type { Locale } from "../locales/types";
import { teaching } from "./teaching";

export type MultivarTrigProblem = Readonly<{
  kind: "multivar-trig-partial";
  mode: "sin-square-linear" | "cos-xy-square";
  a: number; b: number; k: number;
  target: "x" | "y" | "xx" | "xy" | "yx" | "yy";
}>;

const targets = ["x", "y", "xx", "xy", "yx", "yy"] as const;
export const multivarTrigFamilies: readonly UniversityFamily[] = [{
  id: "multivar-trig-partial",
  category: "derivatives",
  titles: {
    pl: "Pochodne cząstkowe trygonometrycznych funkcji dwóch zmiennych",
    en: "Symbolic partial derivatives of bivariate trigonometric functions",
  },
  supportedDifficulties: ["hard"],
  create: (v: number): MultivarTrigProblem => {
    const n = Math.floor(v / 2);
    return {
      kind: "multivar-trig-partial",
      mode: v % 2 === 0 ? "sin-square-linear" : "cos-xy-square",
      a: 2 + (n % 4), b: -(2 + (Math.floor(n / 4) % 3)),
      k: 2 + (n % 4), target: targets[n % 6],
    };
  },
}];

export function multivarTrigCoefficients(p: MultivarTrigProblem): readonly Rational[] {
  const { target: t, a, b, k } = p;
  if (p.mode === "sin-square-linear") {
    const values = { x: a, y: b, xx: 2*a*a, xy: 2*a*b, yx: 2*a*b, yy: 2*b*b };
    return [r(values[t])];
  }
  switch (t) {
    case "x": return [r(-k)];
    case "y": return [r(-2*k)];
    case "xx": return [r(-k*k)];
    case "xy": case "yx": return [r(-2*k), r(-2*k*k)];
    case "yy": return [r(-2*k), r(-4*k*k)];
  }
}

export function presentMultivarTrig(p: MultivarTrigProblem, locale: Locale) {
  const lesson = teaching(locale), { t } = lesson;
  const linear = p.mode === "sin-square-linear";
  const u = linear ? `(${p.a})x+(${p.b})y` : `(${p.k})xy²`;
  const fx = linear ? "sin²(u)" : "cos(u)";
  const ux = linear ? String(p.a) : `(${p.k})y²`;
  const uy = linear ? String(p.b) : `(${2*p.k})xy`;
  const uxx = "0", uxy = linear ? "0" : `(${2*p.k})y`;
  const uyy = linear ? "0" : `(${2*p.k})x`;
  const labels = linear
    ? [p.target.length === 1 ? "sin(2u)" : "cos(2u)"]
    : p.target === "x" ? ["y²sin(u)"]
    : p.target === "y" ? ["xysin(u)"]
    : p.target === "xx" ? ["y⁴cos(u)"]
    : p.target === "yy" ? ["xsin(u)", "x²y²cos(u)"]
    : ["ysin(u)", "xy³cos(u)"];
  const values = multivarTrigCoefficients(p);
  const first = p.target.length === 1;
  const axis = (a: string) => a === "x" ? ux : uy;
  const mixed = (a: string, b: string) => a === "x" && b === "x" ? uxx : a === "y" && b === "y" ? uyy : uxy;
  const selected = first
    ? linear ? `f_${p.target}=sin(2u)·(${axis(p.target)})` : `f_${p.target}=−sin(u)·(${axis(p.target)})`
    : linear
      ? `f_${p.target}=2cos(2u)·(${axis(p.target[0])})·(${axis(p.target[1])})+sin(2u)·(${mixed(p.target[0],p.target[1])})`
      : `f_${p.target}=−cos(u)·(${axis(p.target[0])})·(${axis(p.target[1])})−sin(u)·(${mixed(p.target[0],p.target[1])})`;

  lesson.work(`u(x,y)=${u}; f(x,y)=${fx}`,
    t("Rozpoznaj złożenie i oblicz pochodne argumentu, a nie wartości w wybranym punkcie.",
      "Identify the composition and differentiate the argument as a function, not at a chosen point."));
  lesson.work("D(f)=ℝ²; f∈C∞(ℝ²)",
    t("Sinus i cosinus są gładkie, a argument wielomianowy jest określony dla wszystkich x i y.",
      "Sine and cosine are smooth and the polynomial inner expression is defined for every x and y."));
  lesson.work(`u_x=${ux}; u_y=${uy}; u_xx=${uxx}; u_xy=u_yx=${uxy}; u_yy=${uyy}`,
    t("Różniczkuj argument po jednej zmiennej, drugą traktując jako stałą.",
      "Differentiate the inner expression in each variable while holding the other fixed."));
  lesson.work(linear
      ? "f_i=sin(2u)u_i; f_ij=2cos(2u)u_i u_j+sin(2u)u_ij"
      : "f_i=−sin(u)u_i; f_ij=−cos(u)u_i u_j−sin(u)u_ij",
    t("Połącz regułę łańcuchową z regułą iloczynu; zachowaj pochodną drugiego rzędu argumentu.",
      "Combine the chain and product rules; retain the second derivative of the inner expression."));
  lesson.work(selected,
    t("Podstaw właściwe pochodne argumentu i uprość oba składniki.",
      "Substitute the selected inner derivatives and simplify both terms."));
  lesson.work(`f_${p.target}=${values.map((v,i)=>`(${v.numerator}/${v.denominator})·${labels[i]}`).join(" + ")}`,
    t("Podaj współczynniki funkcji w kolejności podanej bazy, bez podstawiania punktu.",
      "Give the function coefficients in the stated basis order, without substituting a point."));
  return lesson.finish(
    t("Wyznacz ", "Find ") + `f_${p.target}` + t(" jako funkcję. Wpisz współczynniki w bazie: ",
      " as a function. Enter the coefficients in the basis: ") + labels.join(", ")
      + `.\nu=${u}; f=${fx}.`,
    { kind: "list" as const, labels, values },
    t("Oblicz u_x, u_y oraz pochodne drugiego rzędu argumentu.",
      "Find u_x, u_y and the second-order inner derivatives."),
    first
      ? t("Zastosuj regułę łańcuchową do wybranej pochodnej pierwszego rzędu.",
          "Use the chain rule for the requested first partial.")
      : t("Zastosuj regułę łańcuchową i iloczynu. Pamiętaj o składniku z u_ij.",
          "Use the chain and product rules. Include the term with u_ij."),
  );
}
