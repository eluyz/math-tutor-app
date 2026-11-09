import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,type Rational} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

type HessianProblemData=Readonly<{
 a:Rational;b:Rational;c:Rational;d:Rational;e:Rational;offset:Rational;
 h:Rational;k:Rational;degenerate:boolean;completeMinimum?:true;
}>;
export type HessianProblem=HessianProblemData & (Readonly<{kind:"multivar-stationary-point"}> | Readonly<{kind:"multivar-hessian-classify"}>);
const neg=(x:Rational)=>sub(r(0),x);
const index=(d:Difficulty)=>d==="easy"?0:d==="medium"?1:2;
function create(v:number,level:Difficulty,kind:HessianProblem["kind"]):HessianProblem{
 const n=index(level),complete=kind==="multivar-stationary-point"&&level==="advanced",den=complete?4:n===0?1:n===1?2:3;
 const mode=complete?0:kind==="multivar-stationary-point"&&v%4===3?0:v%4;
 const lead=r(1+v%3,den),other=r(1+(v+1)%3,den);
 const a=mode===1?neg(lead):lead;
 const c=mode===1?neg(other):mode===2?neg(other):mode===3?r(0):other;
 const b=mode===3?r(0):r(v%2,den);
 // Keep easy exercises readable: small integer stationary points, not ±11/large linear coefficients.
 const h=n===0?r(v%5-2):n===1?r(v%9-4,2):r(v-11,den);
 const k=n===0?r(Math.floor(v/5)-2):n===1?r((2*v)%9-4,2):r(v%7-3,den);
 const d=neg(add(mul(mul(r(2),a),h),mul(b,k)));
 const e=neg(add(mul(b,h),mul(mul(r(2),c),k)));
 return {kind,...(complete?{completeMinimum:true as const}:{}),a,b,c,d,e,offset:r(v%5-2,den),h,k,degenerate:mode===3};
}
export const hessianFamilies:readonly UniversityFamily[]=[
 {id:"multivar-stationary-point",category:"derivatives",titles:{pl:"Punkty stacjonarne funkcji dwóch zmiennych",en:"Stationary points of a two-variable function"},supportedDifficulties:["easy","medium","hard","advanced"],create:(v,d)=>create(v,d,"multivar-stationary-point")},
 {id:"multivar-hessian-classify",category:"derivatives",titles:{pl:"Hessian i klasyfikacja punktu krytycznego",en:"Hessian test at a critical point"},supportedDifficulties:["easy","medium","hard"],create:(v,d)=>create(v,d,"multivar-hessian-classify")}
];
export function determinantHessian(p:HessianProblem):Rational{
 return sub(mul(mul(r(4),p.a),p.c),mul(p.b,p.b));
}
export function stationaryCoordinates(p:HessianProblem):readonly [Rational,Rational]{
 const D=determinantHessian(p);
 if(D.numerator===0n)throw Error("Non-unique stationary point: singular Hessian");
 return [div(add(mul(neg(mul(r(2),p.c)),p.d),mul(p.b,p.e)),D),
         div(add(mul(p.b,p.d),mul(neg(mul(r(2),p.a)),p.e)),D)];
}
export function hessianClassification(p:HessianProblem):"minimum"|"maximum"|"saddle"|"inconclusive"{
 const D=determinantHessian(p);
 if(D.numerator<0n)return "saddle";
 if(D.numerator===0n)return "inconclusive";
 return p.a.numerator>0n?"minimum":"maximum";
}
const standard=(p:HessianProblem)=>"("+f(p.a)+")x²+("+f(p.b)+")xy+("+f(p.c)+")y²+("+f(p.d)+")x+("+f(p.e)+")y+("+f(p.offset)+")";
const centered=(p:HessianProblem)=>{
 const x="(x−("+f(p.h)+"))",y="(y−("+f(p.k)+"))";
 return "("+f(p.a)+")"+x+"²+("+f(p.b)+")"+x+y+"+("+f(p.c)+")"+y+"²"+(p.degenerate?"+"+y+"⁴":"")+"+("+f(p.offset)+")";
};
const options=(locale:Locale)=>locale==="pl"?[
 {value:"minimum",label:"minimum lokalne"},{value:"maximum",label:"maksimum lokalne"},
 {value:"saddle",label:"punkt siodłowy"},{value:"inconclusive",label:"test Hessiana nie rozstrzyga"}]:[
 {value:"minimum",label:"local minimum"},{value:"maximum",label:"local maximum"},
 {value:"saddle",label:"saddle point"},{value:"inconclusive",label:"Hessian test is inconclusive"}];
export function presentHessian(p:HessianProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const D=determinantHessian(p);
 if(p.kind==="multivar-stationary-point"){
  const [x,y]=stationaryCoordinates(p);
  lesson.work("f_x=2("+f(p.a)+")x+("+f(p.b)+")y+("+f(p.d)+")",
    t("W punkcie wewnętrznym gładkie ekstremum wymaga ∇f(P)=(f_x(P),f_y(P))=(0,0). To tylko warunek konieczny, nie wystarczający; brakujące pochodne bada się oddzielnie.",
      "A smooth interior extremum requires ∇f(P)=(f_x(P),f_y(P))=(0,0). This is necessary, not sufficient; points without an existing partial derivative need separate analysis."));
  lesson.work("f_y=("+f(p.b)+")x+2("+f(p.c)+")y+("+f(p.e)+")",
    t("Pochodna po y daje drugie równanie układu liniowego.",
      "The y partial derivative gives the second linear equation."));
  lesson.work("f_x=0; f_y=0; det=4ac−b²="+f(D)+" ≠ 0",
    t("Niezerowy wyznacznik oznacza dokładnie jedno rozwiązanie układu.",
      "A nonzero determinant gives exactly one solution."));
  lesson.work(t("Współrzędne: ","Coordinates: ")+"x="+f(x)+"; y="+f(y),
    t("Rozwiąż układ Cramera bez zaokrąglania współczynników.",
      "Solve the 2×2 system by Cramer's rule without rounding."));
  const classification=hessianClassification(p);
  const value=add(add(add(mul(p.a,mul(x,x)),mul(p.b,mul(x,y))),mul(p.c,mul(y,y))),add(add(mul(p.d,x),mul(p.e,y)),p.offset));
  lesson.work("H=[["+f(mul(r(2),p.a))+","+f(p.b)+"],["+f(p.b)+","+f(mul(r(2),p.c))+"]]; D="+f(D),
    t("Hessian jest stały. Niezerowy wyznacznik układu dowodzi kompletności: znaleziono jedyny punkt stacjonarny.","The Hessian is constant. The nonzero system determinant proves completeness: this is the only stationary point."));
  lesson.work("D="+f(D)+", f_xx="+f(mul(r(2),p.a))+" ⇒ "+classification,
    t("D>0 i f_xx>0 daje minimum; D>0 i f_xx<0 maksimum; D<0 oznacza siodło i brak ekstremów lokalnych.","D>0 and f_xx>0 gives a minimum; D>0 and f_xx<0 a maximum; D<0 means a saddle and no local extrema."));
  lesson.work("f_* = f("+f(x)+","+f(y)+")="+f(value),
    t("Podstaw punkt do oryginalnej funkcji. Dla minimum lub maksimum jest to wartość ekstremum, dla siodła tylko wartość funkcji.","Substitute into the original function. This is an extremum value for a minimum or maximum, but only a function value for a saddle."));
  return lesson.finish((p.completeMinimum?t("Wyznacz jedyne minimum lokalne; podaj x_min, y_min, f_min funkcji","Find the unique local minimum; enter x_min, y_min, f_min of"):t("Wyznacz punkt stacjonarny (x,y) funkcji","Find the stationary point (x,y) of"))+
    " f(x,y)="+standard(p),{kind:"list",labels:p.completeMinimum?["x_min","y_min","f_min"]:["x","y"],values:p.completeMinimum?[x,y,value]:[x,y]},
    t("Wyznacz pochodne f_x, f_y i przyrównaj je do zera.",
      "Find f_x and f_y, then set both to zero."),
    t("Rozwiąż układ dwóch równań liniowych; sprawdź wyznacznik.",
      "Solve the two linear equations and check the determinant."));
 }
 const x=f(p.h),y=f(p.k),classification=hessianClassification(p);
 lesson.work("f_x("+x+","+y+")=0; f_y("+x+","+y+")=0",
   t("Dla gładkiej funkcji ekstremum wewnętrzne wymaga ∇f(P)=(f_x(P),f_y(P))=(0,0). To warunek konieczny, nie wystarczający; tu punkt stacjonarny można zbadać Hessianem.",
     "For a smooth function, an interior extremum requires ∇f(P)=(f_x(P),f_y(P))=(0,0). This is necessary, not sufficient; the Hessian can now test the stationary point."));
 lesson.work("f_xx="+f(mul(r(2),p.a))+"; f_xy="+f(p.b)+"; f_yy="+f(mul(r(2),p.c)),
   t("Oblicz Hessian w punkcie; składnik czwartego stopnia ma tam drugą pochodną równą zeru.",
     "Evaluate the Hessian at the point; the fourth-power term has zero second derivative there."));
 lesson.work("D=f_xx·f_yy−(f_xy)²="+f(D),
   t("Znak wyznacznika Hessiana decyduje o rodzaju testu.",
     "The sign of the Hessian determinant controls the test."));
 lesson.work("D="+f(D)+", f_xx="+f(mul(r(2),p.a))+" ⇒ "+classification,
   t("D>0 i f_xx>0: minimum; D>0 i f_xx<0: maksimum; D<0: siodło; D=0: test nierozstrzygający.",
     "D>0 with f_xx>0 gives a minimum; D>0 with f_xx<0 a maximum; D<0 a saddle; D=0 is inconclusive."));
 return lesson.finish(t("Sklasyfikuj wynik testu Hessiana w punkcie","Classify the Hessian test at the point")+
  " ("+x+", "+y+").\nf(x,y)="+centered(p),
  {kind:"choice",value:classification,options:options(locale)},
  t("Oblicz D=f_xx f_yy−f_xy².","Compute D=f_xx f_yy−f_xy²."),
  t("Gdy D=0, sam test nie określa charakteru ekstremum.",
    "When D=0, the Hessian test alone cannot classify the critical point."));
}