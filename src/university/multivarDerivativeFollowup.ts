import {rational as r,addRational as add,multiplyRational as mul,type Rational} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";
export type MultivarDerivativeFollowupProblem=
 | Readonly<{kind:"multivar-cubic-partial";a:Rational;b:Rational;c:Rational;d:Rational;e:Rational;g:Rational;h:Rational;x:Rational;y:Rational;target:"x"|"y"|"xx"|"xy"|"yy"}>
 | Readonly<{kind:"multivar-chain-gradient";a:Rational;b:Rational;c:Rational;k:Rational;d:Rational;x:Rational;y:Rational}>;
const signed=(v:number)=>v%2===0?1:-1;
const den=(level:Difficulty)=>level==="hard"?1:level==="advanced"?2:3;
const twice=(v:Rational)=>mul(r(2),v);
const triple=(v:Rational)=>mul(r(3),v);
const sq=(v:Rational)=>mul(v,v);
function cubic(v:number,level:Difficulty):MultivarDerivativeFollowupProblem{
 const q=den(level);
 return {kind:"multivar-cubic-partial",a:r(signed(v)*(1+v%3),q),b:r(v%5-2,q),
  c:r(v%7-3,q),d:r(1+Math.floor(v/3)%4,q),e:r(v%11-5,q),g:r(1+v%4,q),
  h:r(v%13-6,q),x:r(v%7-3,q),y:r(Math.floor(v/5)-2,q),
  target:(["x","y","xx","xy","yy"] as const)[v%5]};
}
function chain(v:number,level:Difficulty):MultivarDerivativeFollowupProblem{
 const q=den(level);
 return {kind:"multivar-chain-gradient",a:r(signed(v)*(1+v%3),q),
  b:r(signed(Math.floor(v/3))*(1+v%4),q),c:r(v%7-3,q),
  k:r(1+Math.floor(v/6)%4,q),d:r(signed(Math.floor(v/2))*(1+v%5),q),
  x:r(v%6-2,q),y:r(Math.floor(v/6)-2,q)};
}
export const multivarDerivativeFollowupFamilies:readonly UniversityFamily[]=[
 {id:"multivar-cubic-partial",category:"derivatives",titles:{pl:"Pochodne cząstkowe wielomianu trzeciego stopnia",en:"Partial derivatives of a cubic polynomial"},supportedDifficulties:["hard","advanced","expert"],create:cubic},
 {id:"multivar-chain-gradient",category:"derivatives",titles:{pl:"Gradient z regułą łańcuchową",en:"Gradient using the chain rule"},supportedDifficulties:["hard","advanced","expert"],create:chain}
];
type Cubic=Extract<MultivarDerivativeFollowupProblem,{kind:"multivar-cubic-partial"}>;
type Chain=Extract<MultivarDerivativeFollowupProblem,{kind:"multivar-chain-gradient"}>;
export function cubicPartials(p:Cubic):Readonly<{x:Rational;y:Rational;xx:Rational;xy:Rational;yy:Rational}>{
 if(p.a.numerator===0n||p.d.numerator===0n)throw Error("Expected genuine cubic terms");
 const x=p.x,y=p.y;
 return {
  x:add(add(add(add(mul(triple(p.a),sq(x)),mul(twice(p.b),mul(x,y))),mul(p.c,sq(y))),mul(p.e,y)),p.g),
  y:add(add(add(add(mul(p.b,sq(x)),mul(twice(p.c),mul(x,y))),mul(triple(p.d),sq(y))),mul(p.e,x)),p.h),
  xx:add(mul(mul(r(6),p.a),x),mul(twice(p.b),y)),
  xy:add(add(mul(twice(p.b),x),mul(twice(p.c),y)),p.e),
  yy:add(mul(twice(p.c),x),mul(mul(r(6),p.d),y))
 };
}
export function chainGradient(p:Chain):readonly [Rational,Rational]{
 if(p.a.numerator===0n||p.b.numerator===0n||p.k.numerator===0n)throw Error("Nonzero a,b,k required");
 const u=add(add(mul(p.a,p.x),mul(p.b,p.y)),p.c),factor=mul(triple(p.k),sq(u));
 return [add(mul(factor,p.a),mul(p.d,p.y)),add(mul(factor,p.b),mul(p.d,p.x))];
}
const poly=(p:Cubic)=>"("+f(p.a)+")x³+("+f(p.b)+")x²y+("+f(p.c)+")xy²+("+f(p.d)+")y³+("+f(p.e)+")xy+("+f(p.g)+")x+("+f(p.h)+")y";
const composite=(p:Chain)=>"("+f(p.k)+")("+f(p.a)+"x+("+f(p.b)+")y+("+f(p.c)+"))³+("+f(p.d)+")xy";
export function presentMultivarDerivativeFollowup(p:MultivarDerivativeFollowupProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const work=(act:string,pl:string,en:string)=>lesson.work(act,t(pl,en));
 const at="("+f(p.x)+", "+f(p.y)+")";
 if(p.kind==="multivar-cubic-partial"){
  const values=cubicPartials(p),label="f_"+p.target;
  work("f(x,y)="+poly(p),
    "Rozdziel wyrazy sześcienne, mieszane i liniowe, a drugą zmienną traktuj jako stałą.",
    "Identify cubic, mixed and linear terms, holding the other variable constant.");
  work("f_x=3("+f(p.a)+")x²+2("+f(p.b)+")xy+("+f(p.c)+")y²+("+f(p.e)+")y+("+f(p.g)+")",
    "Przy różniczkowaniu po x wyrazy zawierające jedynie y znikają.",
    "For the x partial, terms involving only y vanish.");
  work("f_y=("+f(p.b)+")x²+2("+f(p.c)+")xy+3("+f(p.d)+")y²+("+f(p.e)+")x+("+f(p.h)+")",
    "Przy różniczkowaniu po y wyrazy zawierające jedynie x znikają.",
    "For the y partial, terms involving only x vanish.");
  work("f_xx=6("+f(p.a)+")x+2("+f(p.b)+")y; f_xy=2("+f(p.b)+")x+2("+f(p.c)+")y+("+f(p.e)+"); f_yy=2("+f(p.c)+")x+6("+f(p.d)+")y",
    "Pochodne drugiego rzędu otrzymujemy różniczkując ponownie; dla wielomianu f_xy=f_yx.",
    "Take another partial derivative; for a polynomial the mixed partials f_xy and f_yx agree.");
  work(label+at+"="+f(values[p.target]),
    "Podstaw współrzędne do wybranej pochodnej; zachowaj dokładne ułamki i znaki.",
    "Substitute the point into the selected derivative; preserve exact fractions and signs.");
  return lesson.finish(t("Oblicz ","Compute ")+label+t(" w punkcie "," at ")+at+".\nf(x,y)="+poly(p),
    {kind:"scalar",value:values[p.target]},
    t("Różniczkuj po jednej zmiennej, drugą uznając za stałą.","Differentiate in one variable, holding the other constant."),
    t("Oblicz odpowiednią pochodną drugiego rzędu i podstaw punkt.","Find the required second partial, if needed, and substitute the point."));
 }
 const ans=chainGradient(p),inside="("+f(p.a)+")x+("+f(p.b)+")y+("+f(p.c)+")";
 const u=add(add(mul(p.a,p.x),mul(p.b,p.y)),p.c);
 work("f(x,y)="+composite(p),
   "Rozpoznaj potęgę wyrażenia liniowego oraz dodatkowy składnik mieszany dxy.",
   "Identify the power of a linear expression and the additional mixed product dxy.");
 work("u="+inside+"; u_x="+f(p.a)+"; u_y="+f(p.b),
   "Reguła łańcuchowa wymaga osobnych pochodnych argumentu względem x i y.",
   "The chain rule uses the two partial derivatives of the inner expression.");
 work("f_x=3("+f(p.k)+")u²("+f(p.a)+")+("+f(p.d)+")y",
   "Różniczkuj u³ regułą łańcuchową; pochodna dxy względem x to dy.",
   "Differentiate u³ with the chain rule; the x partial of dxy is dy.");
 work("f_y=3("+f(p.k)+")u²("+f(p.b)+")+("+f(p.d)+")x",
   "Dla y wykorzystaj u_y; pochodna dxy względem y to dx.",
   "For y, use u_y; the y partial of dxy is dx.");
 work("u"+at+"="+f(u)+"; ∇f"+at+"=("+f(ans[0])+", "+f(ans[1])+")",
   "Podstaw wspólną wartość u do obu pochodnych, w kolejności (f_x, f_y).",
   "Substitute the same u into both partials in the order (f_x, f_y).");
 return lesson.finish(t("Oblicz gradient w punkcie ","Compute the gradient at ")+at+".\nf(x,y)="+composite(p),
   {kind:"list",labels:["∂f/∂x","∂f/∂y"],values:ans},
   t("Dla u=ax+by+c stosuj 3ku²u_x i 3ku²u_y.","For u=ax+by+c use 3ku²u_x and 3ku²u_y."),
   t("Nie zapomnij pochodnej składnika dxy i właściwej kolejności współrzędnych.","Include the derivative of dxy and preserve the component order."));
}
