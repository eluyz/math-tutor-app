import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,equalRational as eq,type Rational} from "../rational";
import {formatRational as fmt} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type MultivarExtremaProblem =
 | Readonly<{kind:"multivar-rectangle-extrema";a:Rational;b:Rational;c:Rational;h:Rational;k:Rational;x0:Rational;x1:Rational;y0:Rational;y1:Rational}>
 | Readonly<{kind:"multivar-disk-linear-extrema";u:Rational;v:Rational;c:Rational;h:Rational;k:Rational;radius:Rational;norm:Rational}>;

type Rectangle=Extract<MultivarExtremaProblem,{kind:"multivar-rectangle-extrema"}>;
type Disk=Extract<MultivarExtremaProblem,{kind:"multivar-disk-linear-extrema"}>;
type Point=readonly [Rational,Rational];
export type ExactExtremum=Readonly<{value:Rational;point:Point;points:readonly Point[]}>;
const sq=(x:Rational)=>mul(x,x);
const cmp=(x:Rational,y:Rational)=>x.numerator*y.denominator<y.numerator*x.denominator?-1:x.numerator*y.denominator>y.numerator*x.denominator?1:0;
const sign=(v:number)=>v%2===0?1:-1;
const denominator=(level:Difficulty)=>level==="hard"?1:level==="advanced"?2:3;
const mid=(a:Rational,b:Rational)=>div(add(a,b),r(2));
function location(lo:Rational,hi:Rational,mode:number):Rational{
 const length=sub(hi,lo);
 if(mode===0)return mid(lo,hi); // symmetric end points and genuine ties
 if(mode===1)return lo; // stationary point on an edge
 if(mode===2)return add(lo,div(length,r(3))); // interior stationary point
 return add(hi,div(length,r(2))); // stationary point outside the rectangle
}
function rectangle(v:number,level:Difficulty):Rectangle{
 const d=denominator(level);
 const x0=r(v%5-4,d),x1=add(x0,r(2+v%3,d));
 const y0=r(Math.floor(v/5)%4-3,d),y1=add(y0,r(2+(v+1)%3,d));
 return {kind:"multivar-rectangle-extrema",
  a:r(sign(v)*(1+v%3),d),b:r(sign(Math.floor(v/2))*(1+(v+1)%3),d),
  c:r(v%7-3,d),h:location(x0,x1,v%4),k:location(y0,y1,Math.floor(v/2)%4),
  x0,x1,y0,y1};
}
function disk(v:number,level:Difficulty):Disk{
 const d=denominator(level),triples= [[3,4,5],[5,12,13],[8,15,17],[7,24,25]] as const;
 const [a,b,hyp]=triples[v%4],scale=1+Math.floor(v/4)%3;
 return {kind:"multivar-disk-linear-extrema",
  u:r(sign(v)*a*scale,d),v:r(sign(Math.floor(v/2))*b*scale,d),norm:r(hyp*scale,d),
  c:r((v%9)-4,d),h:r((v%7)-3,d),k:r(Math.floor(v/3)-4,d),
  radius:r(1+v%4,d)};
}
export const multivarExtremaFamilies:readonly UniversityFamily[]=[
 {id:"multivar-rectangle-extrema",category:"derivatives",
  titles:{pl:"Ekstrema funkcji kwadratowej na prostokącie",en:"Quadratic extrema on a rectangle"},
  supportedDifficulties:["hard","advanced","expert"],create:rectangle},
 {id:"multivar-disk-linear-extrema",category:"derivatives",
  titles:{pl:"Ekstrema funkcji liniowej na kole",en:"Linear extrema on a disk"},
  supportedDifficulties:["hard","advanced","expert"],create:disk},
];

export function rectangleValue(p:Rectangle,x:Rational,y:Rational):Rational{
 return add(add(mul(p.a,sq(sub(x,p.h))),mul(p.b,sq(sub(y,p.k)))),p.c);
}
function axisCandidates(coefficient:Rational,center:Rational,lo:Rational,hi:Rational,minimum:boolean){
 if(coefficient.numerator===0n||cmp(lo,hi)>=0)throw Error("Expected nonzero quadratic coefficient and nonempty interval");
 const candidates=[lo,hi];
 if(cmp(center,lo)>=0&&cmp(center,hi)<=0&&!candidates.some(x=>eq(x,center)))candidates.push(center);
 const score=(x:Rational)=>mul(coefficient,sq(sub(x,center)));
 const sorted=candidates.sort(cmp),scores=sorted.map(score);
 const best=scores.reduce((acc,x)=>minimum?(cmp(acc,x)<=0?acc:x):(cmp(acc,x)>=0?acc:x));
 return sorted.filter((_,i)=>eq(scores[i],best));
}
function rectangleAt(p:Rectangle,minimum:boolean):ExactExtremum{
 const xs=axisCandidates(p.a,p.h,p.x0,p.x1,minimum);
 const ys=axisCandidates(p.b,p.k,p.y0,p.y1,minimum);
 const points:Point[]=xs.flatMap(x=>ys.map(y=>[x,y] as const));
 const point=points[0];
 return {point,points,value:rectangleValue(p,point[0],point[1])};
}
export function rectangleExtrema(p:Rectangle):Readonly<{min:ExactExtremum;max:ExactExtremum}>{
 return {min:rectangleAt(p,true),max:rectangleAt(p,false)};
}
export function diskValue(p:Disk,x:Rational,y:Rational):Rational{
 return add(add(mul(p.u,x),mul(p.v,y)),p.c);
}
export function diskExtrema(p:Disk):Readonly<{min:ExactExtremum;max:ExactExtremum}>{
 if(p.radius.numerator<=0n||p.norm.numerator<=0n||
    !eq(sq(p.norm),add(sq(p.u),sq(p.v))))throw Error("Invalid disk radius or nonzero gradient norm");
 const dx=div(mul(p.radius,p.u),p.norm),dy=div(mul(p.radius,p.v),p.norm);
 const small:[Rational,Rational]=[sub(p.h,dx),sub(p.k,dy)];
 const large:[Rational,Rational]=[add(p.h,dx),add(p.k,dy)];
 return {min:{point:small,points:[small],value:diskValue(p,...small)},
         max:{point:large,points:[large],value:diskValue(p,...large)}};
}
const pointText=(p:Point)=>"("+fmt(p[0])+", "+fmt(p[1])+")";
const setText=(points:readonly Point[])=>points.map(pointText).join("; ");
const answer=(min:ExactExtremum,max:ExactExtremum)=>({
 kind:"list" as const,labels:["x_min","y_min","f_min","x_max","y_max","f_max"],
 values:[...min.point,min.value,...max.point,max.value] as readonly Rational[]
});
export function presentMultivarExtrema(p:MultivarExtremaProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 if(p.kind==="multivar-rectangle-extrema"){
  const {min,max}=rectangleExtrema(p),x="("+fmt(p.x0)+" ≤ x ≤ "+fmt(p.x1)+")",
    y="("+fmt(p.y0)+" ≤ y ≤ "+fmt(p.y1)+")";
  lesson.work("f_x=2("+fmt(p.a)+")(x−("+fmt(p.h)+")); f_y=2("+fmt(p.b)+")(y−("+fmt(p.k)+"))",
    t("Znajdź punkty stacjonarne osobno względem x i y.", "Find stationary candidates in the x- and y-directions."));
  lesson.work("x∈["+fmt(p.x0)+","+fmt(p.x1)+"]; y∈["+fmt(p.y0)+","+fmt(p.y1)+"]",
    t("Prostokąt jest domknięty: należy uwzględnić wnętrze, krawędzie i narożniki.",
      "The rectangle is closed: consider the interior, edges and corners."));
  lesson.work("f(x,y)=a(x−h)²+b(y−k)²+c",
    t("Suma dwóch niezależnych kwadratów pozwala optymalizować każdą współrzędną oddzielnie.",
      "The sum of independent squares lets us optimize each coordinate separately."));
  lesson.work(t("Punkty minimum: ","Minimum points: ")+setText(min.points),
    t("Sprawdź oba końce każdego przedziału i położenie wierzchołka; remisy są możliwe.",
      "Check both interval endpoints and the vertex; ties are possible."));
  lesson.work(t("Punkty maksimum: ","Maximum points: ")+setText(max.points),
    t("Porównaj wartości na brzegach i narożnikach; nie ograniczaj się do Hessiana.",
      "Compare boundary and corner values; the Hessian alone is insufficient."));
  lesson.work("f_min="+fmt(min.value)+"; f_max="+fmt(max.value),
    t("W przypadku wielu punktów wybierz leksykograficznie najmniejszy (najpierw x, potem y).",
      "When several points tie, select the lexicographically smallest (x first, then y)."));
  return lesson.finish(
    t("Wyznacz globalne minimum i maksimum wraz z jednym punktem osiągania na prostokącie.",
      "Find the global minimum and maximum with one attaining point on the rectangle.")+
    "\nf(x,y)=("+fmt(p.a)+")(x−("+fmt(p.h)+"))²+("+fmt(p.b)+")(y−("+fmt(p.k)+"))²+("+fmt(p.c)+")"+
    "\n"+x+"; "+y+". "+
    t("Przy remisie wybierz punkt o najmniejszym x, następnie y.",
      "For ties, choose the point with the smallest x, then y."),
    answer(min,max),
    t("Osobno zbadaj wierzchołek i końce obu przedziałów.",
      "Examine each interval's vertex and endpoints separately."),
    t("Sprawdź krawędzie i narożniki; wpisz po kolei x_min, y_min, f_min, x_max, y_max, f_max.",
      "Check edges and corners; enter x_min, y_min, f_min, x_max, y_max, f_max in that order."));
 }
 const {min,max}=diskExtrema(p),center=pointText([p.h,p.k]);
 lesson.work("∇f=("+fmt(p.u)+", "+fmt(p.v)+") ≠ (0,0)",
   t("Gradient nie znika, więc ekstremum nie leży we wnętrzu koła.",
     "The gradient is nonzero, so the extrema are not in the disk interior."));
 lesson.work("(x−("+fmt(p.h)+"))²+(y−("+fmt(p.k)+"))²="+fmt(sq(p.radius)),
   t("Ekstrema są na okręgu ograniczającym koło.",
     "Extrema lie on the circle bounding the disk."));
 lesson.work("λ∇g=∇f; ∇g=(2(x−h), 2(y−k))",
   t("Mnożniki Lagrange’a prowadzą do kierunku równoległego do gradientu.",
     "Lagrange multipliers give a direction parallel to the gradient."));
 lesson.work("||∇f||=√(u²+v²)="+fmt(p.norm),
   t("Długość gradientu jest dokładna dzięki trójkom pitagorejskim.",
     "The gradient norm is exact thanks to Pythagorean triples."));
 lesson.work(t("Punkt minimum: ","Minimum point: ")+pointText(min.point)+
   t("; punkt maksimum: ","; maximum point: ")+pointText(max.point),
   t("Przesuń środek o ±R∇f/||∇f|| wzdłuż brzegu koła.",
     "Offset the center by ±R∇f/||∇f|| along the disk boundary."));
 lesson.work("f_min="+fmt(min.value)+"; f_max="+fmt(max.value),
   t("Podstaw oba punkty do funkcji liniowej bez zaokrąglania.",
     "Evaluate the linear function at both points without rounding."));
 return lesson.finish(
   t("Znajdź globalne minimum i maksimum funkcji na kole wraz z punktami ich osiągania.",
     "Find the global minimum and maximum on the disk, including their attaining points.")+
   "\nf(x,y)=("+fmt(p.u)+")x+("+fmt(p.v)+")y+("+fmt(p.c)+")"+
   "\n(x−("+fmt(p.h)+"))²+(y−("+fmt(p.k)+"))² ≤ "+fmt(sq(p.radius))+
   "\n"+t("Środek: ","Center: ")+center,
   answer(min,max),
   t("Dla niezerowego gradientu ekstrema funkcji liniowej są na brzegu koła.",
     "A nonzero linear gradient puts both extrema on the disk boundary."),
   t("Użyj wektora jednostkowego ∇f/||∇f|| i promienia R; podaj sześć wartości w kolejności.",
     "Use the unit vector ∇f/||∇f|| and radius R; provide all six values in order."));
}
