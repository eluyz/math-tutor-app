import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational} from "../rational";
import {formatRational as fmt} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type ParametricArcProblem=Readonly<{
 kind:"integral-arc-parametric";
 scale:Rational; shift:Rational; offset:Rational; lower:Rational; upper:Rational;
}>;
const square=(x:Rational)=>mul(x,x);
const cube=(x:Rational)=>mul(square(x),x);
const cmp=(a:Rational,b:Rational)=>{
 const l=a.numerator*b.denominator,q=b.numerator*a.denominator;
 return l<q?-1:l>q?1:0;
};
const make=(v:number,level:Difficulty):ParametricArcProblem=>{
 const den=level==="hard"?1:level==="advanced"?2:3;
 const scale=r(1+v%4,den),lower=r((v%7)-4,den);
 return {kind:"integral-arc-parametric",
  scale,shift:r(v%5-2,den),offset:r(Math.floor(v/5)-2,den),lower,
  upper:add(lower,r(2+Math.floor(v/6),den))};
};
export const parametricArcFamilies:readonly UniversityFamily[]=[{
 id:"integral-arc-parametric",category:"integrals",
 titles:{pl:"Długość łuku krzywej parametrycznej",en:"Parametric curve arc length"},
 supportedDifficulties:["hard","advanced","expert"],create:make,
}];
export function parametricArcPoint(p:ParametricArcProblem,t:Rational):{x:Rational;y:Rational}{
 return {x:add(mul(p.scale,sub(div(cube(t),r(3)),t)),p.shift),
  y:add(mul(p.scale,square(t)),p.offset)};
}
export function parametricArcDerivatives(p:ParametricArcProblem,t:Rational):{dx:Rational;dy:Rational}{
 return {dx:mul(p.scale,sub(square(t),r(1))),dy:mul(mul(r(2),p.scale),t)};
}
export function exactParametricArcLength(p:ParametricArcProblem):Rational{
 if(cmp(p.scale,r(0))<=0||cmp(p.lower,p.upper)>=0)
  throw Error("Expected positive speed scale and ordered interval");
 const primitive=(t:Rational)=>mul(p.scale,add(div(cube(t),r(3)),t));
 return sub(primitive(p.upper),primitive(p.lower));
}
export function presentParametricArc(p:ParametricArcProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const k=fmt(p.scale),h=fmt(p.shift),q=fmt(p.offset),low=fmt(p.lower),up=fmt(p.upper);
 const curveX="("+k+")(t³/3−t)+("+h+")";
 const curveY="("+k+")t²+("+q+")";
 const answer=exactParametricArcLength(p);
 const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));
 work("x(t)="+curveX+"; y(t)="+curveY,
  "Wykres zadano parametrycznie; długość liczymy względem parametru t, nie z pochodnej dy/dx.",
  "The curve is parametric; measure length in parameter t rather than using dy/dx.");
 work("x′(t)=("+k+")(t²−1); y′(t)=2("+k+")t",
  "Różniczkujemy osobno obie współrzędne parametryczne.",
  "Differentiate both parametric coordinates separately.");
 work("x′(t)²+y′(t)²=("+k+")²[(t²−1)²+4t²]=("+k+")²(t²+1)²",
  "Wyrażenie pod pierwiastkiem jest dokładnym kwadratem dla każdego rzeczywistego t.",
  "The expression under the radical is a perfect square for every real t.");
 work("√(x′(t)²+y′(t)²)=("+k+")(t²+1)",
  "Skala jest dodatnia i t²+1>0, więc wartość bezwzględna nie zmienia wyrażenia.",
  "The scale is positive and t²+1>0, so the absolute value simplifies without a sign change.");
 work("L=∫_{"+low+"}^{"+up+"} ("+k+")(t²+1) dt; F(t)=("+k+")(t³/3+t)",
  "Używamy wzoru parametrycznego na długość łuku i całkujemy dokładny wielomian.",
  "Apply the parametric arc-length formula and integrate the polynomial exactly.");
 work("L=F("+up+")−F("+low+")="+fmt(answer),
  "Podstawiamy granice w podanej kolejności, otrzymując dokładną długość dodatnią.",
  "Evaluate upper minus lower bounds to obtain the positive exact arc length.");
 return lesson.finish(
  t("Oblicz dokładną długość łuku krzywej parametrycznej dla t∈[",
    "Find the exact arc length of the parametric curve for t∈[")+
  low+"; "+up+"].\nx(t)="+curveX+"; y(t)="+curveY,
  {kind:"scalar",value:answer},
  t("Wyznacz x′(t), y′(t) i użyj √(x′²+y′²).","Find x′(t), y′(t) and use √(x′²+y′²)."),
  t("Uprość (t²−1)²+4t² do (t²+1)², potem scałkuj.",
    "Simplify (t²−1)²+4t² to (t²+1)², then integrate."));
}
