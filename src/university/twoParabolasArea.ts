import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational} from "../rational";
import {formatRational as fmt} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type TwoParabolasAreaProblem = Readonly<{
  kind: "integral-area-parabolas";
  a:Rational; delta:Rational; radius:Rational; center:Rational;
  shift:Rational; offset:Rational; lower:Rational; upper:Rational;
}>;
const sq=(x:Rational)=>mul(x,x);
const cube=(x:Rational)=>mul(sq(x),x);
const cmp=(a:Rational,b:Rational)=>{
  const lhs=a.numerator*b.denominator,rhs=b.numerator*a.denominator;
  return lhs<rhs?-1:lhs>rhs?1:0;
};
const generate=(variant:number,level:Difficulty):TwoParabolasAreaProblem=>{
  const den=level==="hard"?1:level==="advanced"?2:3;
  const center=r(variant%7-3,den),radius=r(1+Math.floor(variant/4)%3,den);
  const a=r(4+variant%3,den),delta=r(variant%2===0?2:-2,den);
  const shift=r(variant%2===0?1:-1,den),offset=r(variant%5-2,den);
  const left=sub(center,radius),right=add(center,radius);
  const farLeft=sub(center,mul(r(2),radius)),farRight=add(center,mul(r(2),radius));
  const midpoint=center,half=div(radius,r(2));
  const bounds=variant%8;
  const lower=bounds===0||bounds===4||bounds===1||bounds===5?farLeft:
    bounds===2||bounds===6?midpoint:bounds===3?sub(center,half):farRight;
  const upper=bounds===0||bounds===4||bounds===2||bounds===6?farRight:
    bounds===1||bounds===5?midpoint:bounds===3?add(center,half):add(farRight,radius);
  return {kind:"integral-area-parabolas",a,delta,radius,center,shift,offset,lower,upper};
};
export const twoParabolasAreaFamilies:readonly UniversityFamily[]=[{
  id:"integral-area-parabolas",category:"integrals",
  titles:{pl:"Pole między dwiema parabolami",en:"Area between two parabolas"},
  supportedDifficulties:["hard","advanced","expert"],create:generate,
}];
export function parabolaValues(p:TwoParabolasAreaProblem,x:Rational):{f:Rational;g:Rational}{
  const t=sub(x,p.center);
  const f=add(mul(p.a,sq(sub(t,p.shift))),p.offset);
  const diff=mul(p.delta,sub(sq(t),sq(p.radius)));
  return {f,g:sub(f,diff)};
}
const signedPrimitive=(p:TwoParabolasAreaProblem,x:Rational)=>{
  const t=sub(x,p.center);
  return mul(p.delta,sub(div(cube(t),r(3)),mul(sq(p.radius),t)));
};
export function exactTwoParabolasArea(p:TwoParabolasAreaProblem):Rational{
  if(p.delta.numerator===0n||cmp(p.radius,r(0))<=0||cmp(p.lower,p.upper)>=0 ||
    p.a.numerator===0n||sub(p.a,p.delta).numerator===0n||p.shift.numerator===0n)
    throw Error("Expected two genuine different parabolas and valid interval");
  const roots=[sub(p.center,p.radius),add(p.center,p.radius)];
  const cuts=roots.filter(x=>cmp(x,p.lower)>0&&cmp(x,p.upper)<0);
  const bounds=[p.lower,...cuts,p.upper];
  let total=r(0);
  for(let i=0;i<bounds.length-1;i++){
    const from=bounds[i],to=bounds[i+1];
    const middle=div(add(from,to),r(2));
    const t=sub(middle,p.center);
    const sign=mul(p.delta,sub(sq(t),sq(p.radius))).numerator;
    const signed=sub(signedPrimitive(p,to),signedPrimitive(p,from));
    total=add(total,sign<0n?sub(r(0),signed):signed);
  }
  return total;
}
export function presentTwoParabolasArea(p:TwoParabolasAreaProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const a=fmt(p.a),h=fmt(p.center),s=fmt(p.shift),q=fmt(p.offset);
  const delta=fmt(p.delta),rad=fmt(p.radius),low=fmt(p.lower),up=fmt(p.upper);
  const gQuad=fmt(sub(p.a,p.delta)),gLinear=fmt(mul(r(-2),mul(p.a,p.shift)));
  const gConst=fmt(add(add(mul(p.a,sq(p.shift)),p.offset),mul(p.delta,sq(p.radius))));
  const f="("+a+")((x−("+h+"))−("+s+"))²+("+q+")";
  const g="("+gQuad+")(x−("+h+"))²+("+gLinear+")(x−("+h+"))+("+gConst+")";
  const left=fmt(sub(p.center,p.radius)),right=fmt(add(p.center,p.radius));
  const roots=[sub(p.center,p.radius),add(p.center,p.radius)];
  const interior=roots.filter(x=>cmp(x,p.lower)>0&&cmp(x,p.upper)<0);
  const value=exactTwoParabolasArea(p);
  const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));
  work("f(x)="+f+"; g(x)="+g,
    "Obie funkcje są rzeczywistymi parabolami o niezerowych i różnych współczynnikach przy x².",
    "Both functions are genuine parabolas with distinct nonzero quadratic coefficients.");
  work("f(x)−g(x)=("+delta+")[(x−("+h+"))²−("+rad+")²]",
    "Redukujemy wyrażenie różnicy, aby poprawnie ustalić punkty przecięcia.",
    "Simplify the difference to identify the intersection points.");
  work("f(x)=g(x) ⇔ x="+left+" lub x="+right,
    "Rozwiązujemy równanie kwadratowe i zachowujemy tylko przecięcia leżące wewnątrz przedziału całkowania.",
    "Solve the quadratic equality and retain only crossings within the integration interval.");
  work("A=∫_{"+low+"}^{"+up+"} |f(x)−g(x)| dx",
    "Pole geometryczne wymaga wartości bezwzględnej również gdy zmienia się krzywa położona wyżej.",
    "The geometric area requires an absolute value even when the upper curve changes.");
  work("F(x)=("+delta+")[(x−("+h+"))³/3−("+rad+")²(x−("+h+"))]",
    "To funkcja pierwotna podpisanej różnicy f−g; nie jest to jeszcze pole bezwzględne.",
    "This is an antiderivative of the signed difference f−g, not yet the absolute area.");
  work("A="+fmt(value)+"; "+t("przecięcia wewnętrzne","interior crossings")+"="+
    (interior.length?interior.map(fmt).join(", "):t("brak","none")),
    "Dzielimy przedział wyłącznie przy wewnętrznych przecięciach, sprawdzamy znak w każdym fragmencie i sumujemy dodatnie wkłady.",
    "Split only at interior crossings, check the sign on each piece, and add the nonnegative contributions.");
  return lesson.finish(
    t("Oblicz dokładne pole między parabolami na [","Find the exact area between these parabolas on [")+
    low+"; "+up+"].\nf(x)="+f+"; g(x)="+g,
    {kind:"scalar",value},
    t("Najpierw uprość f(x)−g(x) i wyznacz przecięcia.","Simplify f(x)−g(x) and find intersections first."),
    t("Całkuj |f−g|, dzieląc przedział tylko w punktach przecięcia należących do środka przedziału.",
      "Integrate |f−g|, splitting only at crossings inside the given interval."));
}
