import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational} from "../rational";
import {formatRational as fmt} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type AreaArcProblem =
  | Readonly<{kind:"integral-area-between"; factor:Rational; radius:Rational; center:Rational; baseline:Rational; lower:Rational; upper:Rational}>
  | Readonly<{kind:"integral-arc-length"; slope:number; endRoot:number; shift:Rational; offset:Rational}>;

const neg=(x:Rational)=>sub(r(0),x);
const square=(x:Rational)=>mul(x,x);
const cube=(x:Rational)=>mul(square(x),x);
const index=(d:Difficulty)=>d==="easy"?0:d==="medium"?1:2;
function area(variant:number,difficulty:Difficulty):AreaArcProblem {
  const level=index(difficulty),den=level===0?1:level===1?2:3;
  const factor=r(1+variant%4,den),radius=r(1+Math.floor(variant/4)%3);
  const center=r(Math.floor(variant/12)+level,den),baseline=r(variant%5-2,den);
  const extra=r(1+variant%3,den);
  return {kind:"integral-area-between",factor,radius,center,baseline,
    lower:sub(sub(center,radius),level===0?r(0):extra),
    upper:add(add(center,radius),level===2?extra:r(0))};
}
function arc(variant:number,difficulty:Difficulty):AreaArcProblem {
  const level=index(difficulty);
  return {kind:"integral-arc-length",slope:1+variant%4,endRoot:2+Math.floor(variant/4),
    shift:r(level===0?0:level===1?1:-2,level===2?2:1),
    offset:r((variant%7)-3,level===0?1:level===1?2:3)};
}
export const areaArcFamilies:readonly UniversityFamily[]=[
  {id:"integral-area-between",category:"integrals",titles:{pl:"Pole między dwiema krzywymi",en:"Area between two curves"},supportedDifficulties:["easy","medium","hard"],create:area},
  {id:"integral-arc-length",category:"integrals",titles:{pl:"Długość łuku krzywej",en:"Arc length of a curve"},supportedDifficulties:["easy","medium","hard"],create:arc},
];
export function areaPrimitive(p:Extract<AreaArcProblem,{kind:"integral-area-between"}>,x:Rational):Rational {
  const t=sub(x,p.center);
  return mul(p.factor,sub(div(cube(t),r(3)),mul(square(p.radius),t)));
}
export function exactArea(p:Extract<AreaArcProblem,{kind:"integral-area-between"}>):Rational {
  const cuts=[p.lower,sub(p.center,p.radius),add(p.center,p.radius),p.upper]
    .filter(x=>x.numerator*p.lower.denominator>=p.lower.numerator*x.denominator &&
               x.numerator*p.upper.denominator<=p.upper.numerator*x.denominator)
    .sort((a,b)=>Number(a.numerator*b.denominator-b.numerator*a.denominator));
  const points=[p.lower,...cuts,p.upper];
  let total=r(0);
  for(let i=0;i<points.length-1;i++){
    const left=points[i],right=points[i+1];
    if(left.numerator*right.denominator===right.numerator*left.denominator)continue;
    const middle=div(add(left,right),r(2)),t=sub(middle,p.center);
    const signed=sub(areaPrimitive(p,right),areaPrimitive(p,left));
    total=add(total,sub(square(t),square(p.radius)).numerator<0n?neg(signed):signed);
  }
  return total;
}
export function exactArcLength(p:Extract<AreaArcProblem,{kind:"integral-arc-length"}>):Rational {
  return div(r(2*(p.endRoot**3-1)),r(3*p.slope*p.slope));
}
export function presentAreaArc(p:AreaArcProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  if(p.kind==="integral-area-between"){
    const a=fmt(p.factor),h=fmt(p.center),rad=fmt(p.radius),b=fmt(p.baseline);
    const low=fmt(p.lower),high=fmt(p.upper),left=fmt(sub(p.center,p.radius)),right=fmt(add(p.center,p.radius));
    const ans=exactArea(p);
    lesson.work("f(x)=("+a+")(x−("+h+"))²+("+b+"); g(x)=("+b+")+("+a+")("+rad+")²",
      t("Najpierw zapisz obie krzywe; stała pionowa znika po odjęciu.","Write both curves first; the vertical shift cancels in their difference."));
    lesson.work("f−g=("+a+")[(x−("+h+"))²−("+rad+")²]; x="+left+", "+right,
      t("Rozwiąż f(x)=g(x), aby wyznaczyć wszystkie punkty zmiany znaku.","Solve f(x)=g(x) to find all possible sign changes."));
    lesson.work("A=∫ od "+low+" do "+high+" |f(x)−g(x)| dx",
      t("Między punktami przecięcia parabola jest poniżej prostej; poza nimi powyżej.","Between the crossings the parabola is lower; outside them it is higher."));
    lesson.work("F(x)=("+a+")[(x−("+h+"))³/3−("+rad+")²(x−("+h+"))]",
      t("F jest funkcją pierwotną podpisanej różnicy f−g.","F is an antiderivative of the signed difference f−g."));
    lesson.work(t("Po podziale przy x=","After splitting at x=")+left+t(" i x="," and x=")+right+": A="+fmt(ans),
      t("Zsumuj dodatnie pola; dla części ujemnej odwróć znak całki.","Add nonnegative contributions, reversing the sign of each negative integral."));
    return lesson.finish(t("Oblicz dokładnie pole między wykresami na [","Find the exact area between curves on [")+low+"; "+high+"].\nf(x)=("+a+")(x−("+h+"))²+("+b+"); g(x)=("+b+")+("+a+")("+rad+")²",
      {kind:"scalar",value:ans},
      t("Pole to całka z |f−g|, a nie zwykła różnica bez znaku.","Area is the integral of |f−g|, not the unsigned subtraction."),
      t("Podziel przedział w punktach przecięcia paraboli z prostą.","Split the interval at the intersections of parabola and line."));
  }
  const k=p.slope,m=p.endRoot,h=fmt(p.shift),offset=fmt(p.offset),end=add(p.shift,r(m*m-1,k*k));
  const result=exactArcLength(p);
  const curve="y=(2·"+k+"/3)(x−("+h+"))^(3/2)+("+offset+")";
  lesson.work("y′="+k+"√(x−("+h+"))",
    t("Reguła potęgowa daje pochodną; obliczamy tylko dla x≥h.","The power rule gives the derivative for x≥h."));
  lesson.work("L=∫ od "+h+" do "+fmt(end)+" √(1+(y′)²) dx = ∫ √(1+"+(k*k)+"(x−("+h+"))) dx",
    t("Zastosuj wzór na długość łuku wykresu y(x).","Apply the arc-length formula for a graph y(x)."));
  lesson.work("u=1+"+(k*k)+"(x−("+h+")); du="+(k*k)+" dx; u: 1→"+(m*m),
    t("Podstawienie sprowadza całkę do ∫√u du; oba końce są dodatnie.","Substitution reduces the integral to ∫√u du; both bounds are positive."));
  lesson.work("L=2/(3·"+(k*k)+")["+m+"³−1]="+fmt(result),
    t("Korzystamy z u^(3/2): na końcach daje dokładnie liczby całkowite.","Use u^(3/2): the chosen endpoints yield exact integer powers."));
  return lesson.finish(t("Oblicz dokładną długość łuku krzywej na przedziale [","Find the exact arc length of the curve on [")+h+"; "+fmt(end)+"].\n"+curve,
    {kind:"scalar",value:result},
    t("Długość łuku: L=∫√(1+(y′)²)dx.","Arc length: L=∫√(1+(y′)²)dx."),
    t("Po podstawieniu u=1+k²(x−h) całkuj √u i oblicz obie granice.","Set u=1+k²(x−h), integrate √u and evaluate at both bounds."));
}