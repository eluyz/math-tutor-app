import {rational as r,addRational as add,multiplyRational as mul,type Rational} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

type PartialGradientProblemData=Readonly<{
 kind:"multivar-partial-point"|"multivar-gradient-point";
 a:Rational;b:Rational;c:Rational;d:Rational;e:Rational;constant:Rational;
 x:Rational;y:Rational; target:"x"|"y"|"xx"|"xy"|"yy";
}>;
export type PartialGradientProblem = PartialGradientProblemData & (Readonly<{kind:"multivar-partial-point"}> | Readonly<{kind:"multivar-gradient-point"}>);
const index=(d:Difficulty)=>d==="easy"?0:d==="medium"?1:2;
function create(v:number,d:Difficulty,kind:PartialGradientProblem["kind"]):PartialGradientProblem{
 const n=index(d),den=n===0?1:n===1?2:3;
 return {kind,a:r(1+v%3,den),b:r(v%5-2,den),c:r(1+(v+1)%3,den),
   d:r(v%7-3,den),e:r(v%11-5,den),constant:r(v%13-6,den),
   x:r(v-11,den),y:r(v%6-2,den),
   target:(["x","y","xx","xy","yy"] as const)[v%5]};
}
export const partialGradientFamilies:readonly UniversityFamily[]=[
 {id:"multivar-partial-point",category:"derivatives",
 titles:{pl:"Pochodne cząstkowe pierwszego i drugiego rzędu",en:"First and second partial derivatives"},
 supportedDifficulties:["easy","medium","hard"],create:(v,d)=>create(v,d,"multivar-partial-point")},
 {id:"multivar-gradient-point",category:"derivatives",
 titles:{pl:"Gradient funkcji dwóch zmiennych",en:"Gradient of a two-variable function"},
 supportedDifficulties:["easy","medium","hard"],create:(v,d)=>create(v,d,"multivar-gradient-point")}
];
export function gradient(p:PartialGradientProblem):readonly [Rational,Rational]{
 return [add(add(mul(mul(r(2),p.a),p.x),mul(p.b,p.y)),p.d),
         add(add(mul(p.b,p.x),mul(mul(r(2),p.c),p.y)),p.e)];
}
export function partial(p:PartialGradientProblem):Rational{
 const [px,py]=gradient(p);
 if(p.target==="x")return px;
 if(p.target==="y")return py;
 if(p.target==="xx")return mul(r(2),p.a);
 if(p.target==="xy")return p.b;
 return mul(r(2),p.c);
}
const expression=(p:PartialGradientProblem)=>
 "("+f(p.a)+")x²+("+f(p.b)+")xy+("+f(p.c)+")y²+("+f(p.d)+")x+("+f(p.e)+")y+("+f(p.constant)+")";
export function presentPartialGradient(p:PartialGradientProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const [px,py]=gradient(p),point="("+f(p.x)+", "+f(p.y)+")";
 lesson.work("f(x,y)="+expression(p),
   t("Traktuj drugą zmienną jako stałą, różniczkując po wybranej zmiennej.",
     "Treat the other variable as constant when taking each partial derivative."));
 lesson.work("∂f/∂x=2("+f(p.a)+")x+("+f(p.b)+")y+("+f(p.d)+")",
   t("Dla ∂/∂x wyrazy zawierające tylko y mają pochodną 0.",
     "For ∂/∂x, terms involving only y have derivative 0."));
 lesson.work("∂f/∂y=("+f(p.b)+")x+2("+f(p.c)+")y+("+f(p.e)+")",
   t("Dla ∂/∂y wyrazy zawierające tylko x mają pochodną 0.",
     "For ∂/∂y, terms involving only x have derivative 0."));
 if(p.kind==="multivar-gradient-point"){
   lesson.work("∇f"+point+"=("+f(px)+", "+f(py)+")",
     t("Gradient składa się z dwóch pochodnych cząstkowych I rzędu w punkcie.",
       "The gradient contains both first partial derivatives evaluated at the point."));
   return lesson.finish(t("Oblicz gradient w punkcie ","Find the gradient at ")+point+".\nf(x,y)="+expression(p),
      {kind:"list",labels:["∂f/∂x","∂f/∂y"],values:[px,py]},
      t("Gradient to (f_x, f_y).","The gradient is (f_x, f_y)."),
      t("Zróżniczkuj osobno po x i y, a następnie podstaw współrzędne.",
        "Differentiate separately with respect to x and y, then substitute the coordinates."));
 }
 const answer=partial(p);
 const target=p.target==="x"?"f_x":p.target==="y"?"f_y":p.target==="xx"?"f_xx":p.target==="xy"?"f_xy":"f_yy";
 lesson.work("f_xx=2("+f(p.a)+"); f_xy="+f(p.b)+"; f_yy=2("+f(p.c)+")",
   t("Pochodne II rzędu otrzymujemy, różniczkując pochodne I rzędu; f_xy=f_yx dla wielomianów.",
     "Second partials come from differentiating first partials; f_xy=f_yx for polynomials."));
 lesson.work(target+point+"="+f(answer),
   t("Podstaw współrzędne tylko tam, gdzie w pochodnej pozostają zmienne.",
     "Substitute the point only where variables remain in the derivative."));
 return lesson.finish(t("Oblicz ","Calculate ")+target+t(" w punkcie "," at ")+point+".\nf(x,y)="+expression(p),
   {kind:"scalar",value:answer},
   t("Różniczkuj jedną zmienną, uznając drugą za stałą.",
     "Differentiate with respect to one variable, holding the other constant."),
   t("Dla f_xx, f_xy i f_yy różniczkuj jeszcze raz odpowiednią pochodną.",
     "For f_xx, f_xy and f_yy, differentiate a first partial once more."));
}