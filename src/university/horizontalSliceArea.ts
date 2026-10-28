import {
  rational as r, addRational as add, multiplyRational as mul, divideRational as div,
  type Rational,
} from "../rational";
import { formatRational as fmt } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching } from "./teaching";

export type HorizontalSliceAreaProblem = Readonly<{
  kind: "integral-area-horizontal-slices";
  /** Left/right x boundaries are c ± k sqrt(y-h), for h ≤ y ≤ h+R². */
  center: Rational; coefficient: Rational; bottom: Rational; radius: Rational;
}>;
const square=(v:Rational)=>mul(v,v);
const cube=(v:Rational)=>mul(square(v),v);
const positive=(v:Rational)=>v.numerator>0n&&v.denominator>0n;
export function horizontalAreaBounds(p:HorizontalSliceAreaProblem) {
  if(!positive(p.coefficient)||!positive(p.radius))
    throw Error("Positive curve scale and radius required");
  return {lower:p.bottom,upper:add(p.bottom,square(p.radius))};
}
/** Exact area between the left and right x(y) branches. No decimal roots needed. */
export function exactHorizontalSliceArea(p:HorizontalSliceAreaProblem):Rational {
  horizontalAreaBounds(p);
  return div(mul(r(4),mul(p.coefficient,cube(p.radius))),r(3));
}
export function makeHorizontalSliceArea(variant:number,level:Difficulty):HorizontalSliceAreaProblem {
  if(!Number.isInteger(variant)||variant<0||variant>=24||
     !["hard","advanced","expert"].includes(level))
    throw Error("Unsupported horizontal-area variant");
  const i=variant%4,j=Math.floor(variant/4)%3,shift=Math.floor(variant/12);
  if(level==="hard")return {
    kind:"integral-area-horizontal-slices",
    coefficient:r(1+i),radius:r(1+j),bottom:r(0),center:r(shift),
  };
  if(level==="advanced")return {
    kind:"integral-area-horizontal-slices",
    coefficient:r(1+i,2),radius:r(1+j,2),bottom:r(1+shift),center:r(-2),
  };
  return {
    kind:"integral-area-horizontal-slices",
    coefficient:r(2+i,3),radius:r(2+j,3),bottom:r(-1-shift),center:r(2),
  };
}
export const horizontalAreaFamilies:readonly UniversityFamily[]=[{
  id:"integral-area-horizontal-slices",
  category:"integrals",
  titles:{pl:"Pole obszaru — całkowanie względem y",en:"Area using horizontal slices (dy)"},
  supportedDifficulties:["hard","advanced","expert"],
  create:makeHorizontalSliceArea,
}];

export function presentHorizontalSliceArea(p:HorizontalSliceAreaProblem,locale:Locale) {
  const lesson=teaching(locale),{t}=lesson;
  const {lower,upper}=horizontalAreaBounds(p);
  const c=fmt(p.center),k=fmt(p.coefficient),h=fmt(p.bottom),R=fmt(p.radius);
  const upperText=fmt(upper), result=fmt(exactHorizontalSliceArea(p)),Rsquared=fmt(square(p.radius));
  const left="("+c+")−("+k+")√(y−("+h+"))";
  const right="("+c+")+("+k+")√(y−("+h+"))";
  const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));
  work("x_left(y)="+left+"; x_right(y)="+right,
    "To wykres poziomo ograniczony: dla każdego y szerokość jest prawą współrzędną x minus lewą. Nie zamieniaj tych ról.",
    "These are horizontal left/right boundaries. For each y, width is right x minus left x; never reverse them.");
  work("w(y)=x_right−x_left=2·("+k+")√(y−("+h+"))",
    "Przesunięcie poziome c znika po odjęciu, a szerokość pozostaje nieujemna, bo k>0 i y≥h.",
    "The horizontal shift c cancels; the width is nonnegative because k>0 and y≥h.");
  work("A=∫_{"+h+"}^{"+upperText+"} 2·("+k+")√(y−("+h+")) dy",
    "Całkujemy względem y, bo obie krawędzie podano jako funkcje x(y). Nie stosujemy tutaj górna y minus dolna y względem x.",
    "Integrate with respect to y since both boundaries are x(y). Do not use upper-y minus lower-y with respect to x.");
  work("u=y−("+h+"); du=dy; y: "+h+"→"+upperText+" ⇔ u: 0→"+Rsquared,
    "Podstawienie usuwa przesunięcie pionowe i dokładnie zamienia granice całkowania.",
    "Substitution removes the vertical shift and transforms both bounds exactly.");
  work("∫ 2·("+k+")√u du=(4·("+k+")/3)u^(3/2)",
    "Stosujemy potęgową funkcję pierwotną: ∫u^(1/2)du=(2/3)u^(3/2).",
    "Apply the power rule for antiderivatives: ∫u^(1/2)du=(2/3)u^(3/2).");
  work("A=(4·("+k+")/3)·[("+Rsquared+")^(3/2)−0]=(4·("+k+")/3)·("+R+")³="+result,
    "Ponieważ R>0, (R²)^(3/2)=R³. Wynik jest dodatni i dokładny, bez przybliżeń pierwiastka.",
    "As R>0, (R²)^(3/2)=R³. The result is exact and nonnegative, with no square-root approximation.");
  return lesson.finish(
    t("Oblicz dokładne pole obszaru ograniczonego krzywymi x(y) oraz dwiema prostymi poziomymi. ",
      "Find the exact area between these x(y) curves and two horizontal lines. ")+
    "\nx_left(y)="+left+"\nx_right(y)="+right+"\ny ∈ ["+h+"; "+upperText+"]",
    {kind:"scalar",value:exactHorizontalSliceArea(p)},
    t("Przy poziomych paskach: A=∫(prawa granica x − lewa granica x)dy.",
      "Use horizontal slices: A=∫(right x − left x)dy."),
    t("Odejmij x_right−x_left, podstaw u=y−h i skorzystaj z ∫√u du.",
      "Subtract right x minus left x, set u=y−h, then use ∫√u du.")
  );
}