import {
  rational as r, addRational as add, subtractRational as sub,
  type Rational,
} from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

type AbsoluteProblem = Readonly<{
  kind: "derivative-absolute-one-sided";
  h: Rational; a: Rational; b: Rational; c: Rational;
}>;
type PiecewiseProblem = Readonly<{
  kind: "derivative-piecewise-point";
  h: Rational; leftSlope: Rational; rightSlope: Rational;
  at: Rational; jump: Rational;
}>;
export type NondifferentiabilityProblem = AbsoluteProblem | PiecewiseProblem;

const levelIndex = (level: Difficulty): number => level === "easy" ? 0 : level === "medium" ? 1 : 2;
const sign = (v: number): number => v % 2 ? -1 : 1;
const zero = r(0);
const isZero = (x: Rational): boolean => x.numerator === 0n;
const eq = (x: Rational, y: Rational): boolean =>
  x.numerator === y.numerator && x.denominator === y.denominator;

function absoluteProblem(v: number, level: Difficulty): AbsoluteProblem {
  const n = levelIndex(level), den = n === 0 ? 1 : n === 1 ? 2 : 3;
  // The coefficient of |x-h| is never zero: all instances have a genuine corner.
  return {
    kind: "derivative-absolute-one-sided",
    h: r(v - 11),
    a: r(sign(v) * (1 + ((v + n) % 5)), den),
    b: n === 0 ? zero : r((v % 7) - 3, den),
    c: add(r((v % 5) - 2), r(n, 7)), // keep different levels distinct even after rational reduction
  };
}

function piecewiseProblem(v: number, level: Difficulty): PiecewiseProblem {
  const n = levelIndex(level), den = n === 0 ? 1 : n === 1 ? 2 : 3 + (v % 2);
  const mode = v % 3; // 0: smooth; 1: continuous corner; 2: jump
  const left = r(sign(v) * (1 + v % 5), den);
  const right = mode === 0 ? left :
    add(left, r(1 + ((v + n) % 4), den));
  return {
    kind: "derivative-piecewise-point",
    h: r(v - 11),
    leftSlope: left,
    rightSlope: right,
    at: add(r((v % 7) - 3), r(n, 5)),
    jump: mode === 2 ? r(sign(v + 1) * (1 + (v % 3)), den) : zero,
  };
}

export const nondifferentiabilityFamilies: readonly UniversityFamily[] = [
  { id: "derivative-absolute-one-sided", category: "derivatives",
    titles: { pl: "Pochodne jednostronne i ostry wierzchołek", en: "One-sided derivatives at an absolute-value corner" },
    supportedDifficulties: ["easy", "medium", "hard"], create: absoluteProblem },
  { id: "derivative-piecewise-point", category: "derivatives",
    titles: { pl: "Różniczkowalność funkcji przedziałami", en: "Differentiability of a piecewise function" },
    supportedDifficulties: ["easy", "medium", "hard"], create: piecewiseProblem },
];

export function oneSidedSlopes(p: AbsoluteProblem): Readonly<{left:Rational;right:Rational}> {
  return { left: sub(p.b, p.a), right: add(p.b, p.a) };
}
export type PointClassification = "smooth" | "corner" | "jump";
export function piecewiseClassification(p: PiecewiseProblem): PointClassification {
  if (!isZero(p.jump)) return "jump";
  return eq(p.leftSlope, p.rightSlope) ? "smooth" : "corner";
}

function pairLabel(left: Rational, right: Rational, h: Rational): string {
  return "f′₋(" + f(h) + ") = " + f(left) + "; f′₊(" + f(h) + ") = " + f(right);
}
function fourChoices(labels: readonly [string,string,string,string], correct: number, rotate: number, prefix = "derivative") {
  if (new Set(labels).size !== 4) throw new Error("Non-distinct derivative distractors");
  const options = labels.map((label,i)=>({value:prefix+":"+i,label}));
  const shift = rotate % 4;
  return { kind: "choice" as const, value: options[correct].value,
    options: [...options.slice(shift), ...options.slice(0, shift)] };
}

function absolutePresentation(p:AbsoluteProblem,locale:Locale) {
  const lesson=teaching(locale),{t}=lesson;
  const slopes=oneSidedSlopes(p);
  const offset = "(x−(" + f(p.h) + "))";
  const expression = "(" + f(p.a) + ")|" + offset + "| + (" + f(p.b) + ")" + offset + " + (" + f(p.c) + ")";
  lesson.work(t("Dla x mniejszego od punktu", "For x below the point") + ": |x−h|=−(x−h)",
    t("Po lewej stronie h moduł odwraca znak wyrażenia x−h.",
      "To the left of h, the absolute value changes the sign of x−h."));
  lesson.work("f′₋(" + f(p.h) + ") = (" + f(p.b) + ") − (" + f(p.a) + ") = " + f(slopes.left),
    t("Różniczkujemy liniowe wyrażenie po lewej stronie punktu.",
      "Differentiate the linear expression on the left of the point."));
  lesson.work("f′₊(" + f(p.h) + ") = (" + f(p.b) + ") + (" + f(p.a) + ") = " + f(slopes.right),
    t("Po prawej stronie h moduł jest równy x−h.",
      "To the right of h, the absolute value equals x−h."));
  lesson.work("f′₋(" + f(p.h) + ") ≠ f′₊(" + f(p.h) + ")",
    t("Ponieważ współczynnik przy module jest niezerowy, pochodne jednostronne są różne: zwykła pochodna w h nie istnieje.",
      "Because the absolute-value coefficient is nonzero, the one-sided derivatives differ, so the derivative at h does not exist."));
  const correct=pairLabel(slopes.left,slopes.right,p.h);
  const ans:AnswerSpec=fourChoices([
    correct,
    pairLabel(slopes.right,slopes.left,p.h),
    pairLabel(p.b,p.b,p.h),
    pairLabel(add(slopes.left,r(1)),add(slopes.right,r(1)),p.h),
  ],0,Math.abs(Number(p.h.numerator)) + Math.abs(Number(p.a.numerator)),"slope");
  return lesson.finish(
    t("Wyznacz obie pochodne jednostronne w punkcie", "Find both one-sided derivatives at")+
    " x = " + f(p.h) + ".\nf(x) = " + expression,
    ans,
    t("Rozpisz moduł osobno dla x<h i x>h.", "Expand the absolute value separately for x<h and x>h."),
    t("Po lewej współczynnik przy x−h wynosi b−a, a po prawej b+a. Sprawdź, czy są równe.",
      "The slope to the left is b−a, and to the right it is b+a. Compare them."));
}

const classificationLabels: Record<Locale, Record<PointClassification | "vertical",string>> = {
  pl: {
    smooth: "ciągła i różniczkowalna",
    corner: "ciągła, ale nieróżniczkowalna (załamanie)",
    jump: "nieciągła (skok)",
    vertical: "ciągła, lecz ma styczną pionową",
  },
  en: {
    smooth: "continuous and differentiable",
    corner: "continuous but not differentiable (corner)",
    jump: "discontinuous (jump)",
    vertical: "continuous but with a vertical tangent",
  },
};
export function presentNondifferentiability(p:NondifferentiabilityProblem,locale:Locale) {
  if(p.kind==="derivative-absolute-one-sided")return absolutePresentation(p,locale);
  const lesson=teaching(locale),{t}=lesson;
  const state=piecewiseClassification(p);
  const at=f(p.at),h=f(p.h),left=f(p.leftSlope),right=f(p.rightSlope),jump=f(p.jump);
  const leftForm="("+left+")(x−("+h+")) + ("+at+")";
  const rightForm="("+right+")(x−("+h+")) + ("+at+") + ("+jump+")";
  lesson.work("f("+h+") = "+at+"; lim x→"+h+"⁻ f(x) = "+at,
    t("W punkcie obowiązuje pierwsza gałąź (x≤h), więc wartość i lewa granica są równe wyrazowi wolnemu.",
      "The first branch applies at x=h; its value and left limit equal the constant term."));
  lesson.work("lim x→"+h+"⁺ f(x) = "+f(add(p.at,p.jump)),
    t("Prawa granica zawiera dodatkową składową skoku; porównaj ją z f(h).",
      "The right-hand limit contains the jump term; compare it with f(h)."));
  if(state==="jump"){
    lesson.work("lim x→"+h+"⁺ f(x) ≠ f("+h+")",
      t("Funkcja nie jest ciągła. Iloraz różnicowy z prawej ma składnik skok/(x−h), więc nie ma skończonej pochodnej w tym punkcie.",
        "The function is discontinuous. The right difference quotient contains jump/(x−h), so there is no finite derivative at this point."));
  } else {
    lesson.work("f′₋("+h+") = "+left+"; f′₊("+h+") = "+right,
      t("Dla ciągłych gałęzi liniowych pochodne jednostronne są ich współczynnikami kierunkowymi.",
        "For continuous linear branches, the one-sided derivatives are their slopes."));
    lesson.work(state==="smooth"?"f′₋("+h+") = f′₊("+h+")":"f′₋("+h+") ≠ f′₊("+h+")",
      state==="smooth"?
      t("Pochodne jednostronne są równe, więc pochodna istnieje.",
        "The one-sided derivatives agree, so the derivative exists.") :
      t("Funkcja jest ciągła, ale ma różne pochodne jednostronne, więc w punkcie jest załamanie.",
        "The function is continuous but has different one-sided derivatives, hence a corner."));
  }
  const labels=classificationLabels[locale];
  const options:readonly [string,string,string,string]=[
    labels.smooth,labels.corner,labels.jump,labels.vertical,
  ];
  const indices:Record<PointClassification,number>={smooth:0,corner:1,jump:2};
  return lesson.finish(
    t("Oceń ciągłość i różniczkowalność funkcji w punkcie", "Classify continuity and differentiability of the function at") +
      " x = "+h+".\nf(x) = {\n  "+leftForm+"  "+t("dla","for")+" x ≤ "+h+
      "\n  "+rightForm+"  "+t("dla","for")+" x > "+h+"\n}",
    fourChoices(options,indices[state],Math.abs(Number(p.h.numerator))+Math.abs(Number(p.at.numerator))),
    t("Najpierw sprawdź ciągłość, dopiero potem porównaj pochodne jednostronne.",
      "Check continuity first; then compare one-sided derivatives."),
    t("Porównaj f(h) z prawą granicą. Jeśli są równe, porównaj nachylenia obu gałęzi.",
      "Compare f(h) with the right limit. If they agree, compare the slopes of the two branches."));
}
