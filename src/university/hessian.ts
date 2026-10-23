import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div,type Rational} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type HessianProblem=Readonly<{
 kind:"multivar-stationary-point"|"multivar-hessian-classify";
 a:Rational;b:Rational;c:Rational;d:Rational;e:Rational;offset:Rational;
 h:Rational;k:Rational;degenerate:boolean;
}>;
const neg=(x:Rational)=>sub(r(0),x);
const index=(d:Difficulty)=>d==="easy"?0:d==="medium"?1:2;
function create(v:number,level:Difficulty,kind:HessianProblem["kind"]):HessianProblem{
 const n=index(level),den=n===0?1:n===1?2:3;
 const mode=kind==="multivar-stationary-point"&&v%4===3?0:v%4;
 const lead=r(1+v%3,den),other=r(1+(v+1)%3,den);
 const a=mode===1?neg(lead):lead;
 const c=mode===1?neg(other):mode===2?neg(other):mode===3?r(0):other;
 const b=mode===3?r(0):r(v%2,den);
 const h=r(v-11,den),k=r(v%7-3,den);
 const d=neg(add(mul(mul(r(2),a),h),mul(b,k)));
 const e=neg(add(mul(b,h),mul(mul(r(2),c),k)));
 return {kind,a,b,c,d,e,offset:r(v%5-2,den),h,k,degenerate:mode===3};
}
export const hessianFamilies:readonly UniversityFamily[]=[
 {id:"multivar-stationary-point",category:"derivatives",titles:{pl:"Punkty stacjonarne funkcji dwóch zmiennych",en:"Stationary points of a two-variable function"},supportedDifficulties:["easy","medium","hard"],create:(v,d)=>create(v,d,"multivar-stationary-point")},
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
    t("Pochodna po x jest pierwszym równaniem warunku stacjonarności.",
      "The x partial derivative is the first stationarity equation."));
  lesson.work("f_y=("+f(p.b)+")x+2("+f(p.c)+")y+("+f(p.e)+")",
    t("Pochodna po y daje drugie równanie układu liniowego.",
      "The y partial derivative gives the second linear equation."));
  lesson.work("f_x=0; f_y=0; det=4ac−b²="+f(D)+" ≠ 0",
    t("Niezerowy wyznacznik oznacza dokładnie jedno rozwiązanie układu.",
      "A nonzero determinant gives exactly one solution."));
  lesson.work("x="+f(x)+"; y="+f(y),
    t("Rozwiąż układ Cramera bez zaokrąglania współczynników.",
      "Solve the 2×2 system by Cramer's rule without rounding."));
  return lesson.finish(t("Wyznacz punkt stacjonarny (x,y) funkcji","Find the stationary point (x,y) of")+
    " f(x,y)="+standard(p),{kind:"list",labels:["x","y"],values:[x,y]},
    t("Wyznacz pochodne f_x, f_y i przyrównaj je do zera.",
      "Find f_x and f_y, then set both to zero."),
    t("Rozwiąż układ dwóch równań liniowych; sprawdź wyznacznik.",
      "Solve the two linear equations and check the determinant."));
 }
 const x=f(p.h),y=f(p.k),classification=hessianClassification(p);
 lesson.work("f_x("+x+","+y+")=0; f_y("+x+","+y+")=0",
   t("Wskazany punkt jest stacjonarny, więc można zastosować test drugich pochodnych.",
     "The given point is stationary, so the second-derivative test applies."));
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