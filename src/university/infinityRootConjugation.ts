import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational } from "../rational";
import { formatRational as f } from "../answers";
import type { Locale } from "../locales/types";
import type { UniversityFamily } from "./schema";
import { teaching, calculate } from "./teaching";

/** Synthetic ±infinity conjugation methods; no private source coefficients. */
export type InfinityRootConjugationProblem = Readonly<{
  kind:"limit-root-infinity-conjugates";
  mode:"quadratic-pair"|"quadratic-linear"|"linear-pair";
  s:Rational;b:Rational;c:Rational;d:Rational;e:Rational;
  direction:"positive"|"negative";
}>;
const neg=(x:Rational)=>mul(r(-1),x);
const square=(x:Rational)=>mul(x,x);
function task(v:number):InfinityRootConjugationProblem{
  const mode=v%3===0?"quadratic-pair":v%3===1?"quadratic-linear":"linear-pair";
  const s=r(1+Math.floor(v/3)%3),b=r((v%7)-3||1),c=r(2+v%5);
  const d=mode==="linear-pair"?r(2+v%4):add(b,r((Math.floor(v/3)%2?-1:1)*(1+v%3)));
  const e=mode==="linear-pair"?add(mul(square(s),d),r(1+v%5)):r(3+v%7);
  return {kind:"limit-root-infinity-conjugates",mode,s,b,c,d,e,
    direction:mode==="linear-pair"?"positive":v%2?"negative":"positive"};
}
export const infinityRootConjugationFamilies:readonly UniversityFamily[]=[{
  id:"limit-root-infinity-conjugates",category:"function-limits",
  titles:{pl:"Sprzężenie pierwiastków przy ±∞: dwa pierwiastki i składnik liniowy",
    en:"Conjugating radical limits at ±∞: two roots or a linear term"},
  supportedDifficulties:["advanced"],create:(v)=>task(v),
}];
export function infinityRootConjugationLimit(p:InfinityRootConjugationProblem):Rational{
  if(p.s.numerator<=0n)throw Error("Expected positive leading root");
  if(p.mode==="linear-pair"){
    if(p.direction!=="positive")throw Error("Linear-radicand limit requires +infinity");
    return r(0);
  }
  const leading=p.mode==="quadratic-pair"?sub(p.b,p.d):p.b;
  return div(p.direction==="negative"?neg(leading):leading,mul(r(2),p.s));
}
export function presentInfinityRootConjugation(p:InfinityRootConjugationProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson,sign=p.direction==="positive"?"+∞":"−∞";
  const A=square(p.s),s=f(p.s);
  const root=(b:Rational,c:Rational)=>"√(("+f(A)+")·x² + ("+f(b)+")·x + ("+f(c)+"))";
  const qRoot=root(p.b,p.c);
  let expr:string;
  lesson.work("x→"+sign+"; "+t("analiza wyrazów dominujących","dominant-term analysis"),
    t("Dla dostatecznie dużego |x| składnik s²x² dominuje: pierwiastek jest określony i √(s²x²)=s|x|, s>0.",
      "For sufficiently large |x| the s²x² term dominates: roots are defined and √(s²x²)=s|x|, s>0."));
  if(p.mode==="quadratic-pair"){
    const other=root(p.d,p.e),linear=calculate("difference",p.b,p.d),constant=calculate("difference",p.c,p.e);
    expr=qRoot+" − "+other;
    lesson.work("("+qRoot+" − "+other+")("+qRoot+" + "+other+") = ("+f(linear.result)+")·x + ("+f(constant.result)+")",
      t("Mnożymy przez sumę pierwiastków. Składniki s²x² redukują się; różnica podpierwiastkowych wielomianów jest liniowa.",
        "Multiply by the sum of the roots. The s²x² terms cancel, leaving a linear numerator."),linear,constant);
    const denom=calculate("product",r(2),p.s), quotient=calculate("quotient",linear.result,denom.result);
    lesson.work("x/|x|→"+(p.direction==="positive"?"1":"−1")+"; (√(…)+√(…))/|x|→"+f(denom.result),
      t("Dzielimy licznik i mianownik przez |x|, nigdy automatycznie przez x. Przy −∞ znak x/|x| jest ujemny.",
        "Divide numerator and denominator by |x|, never automatically by x. At −∞, x/|x| is negative."),denom,quotient);
  }else if(p.mode==="quadratic-linear"){
    expr=qRoot+(p.direction==="positive"?" − ":" + ")+"("+s+")·x";
    const denominator=p.direction==="positive"?qRoot+" + ("+s+")·x":qRoot+" − ("+s+")·x";
    lesson.work("f(x) = (("+f(p.b)+")·x + ("+f(p.c)+"))/("+denominator+")",
      t("Stosujemy różnicę kwadratów. Dodany lub odjęty składnik liniowy ma dokładnie s|x| odpowiednio do kierunku.",
        "Use the difference of squares. The added/subtracted linear term cancels s|x| in the specified direction."));
    const twice=calculate("product",r(2),p.s),ratio=calculate("quotient",p.b,twice.result);
    lesson.work("("+denominator+")/|x|→"+f(twice.result)+"; x/|x|→"+(p.direction==="positive"?"1":"−1"),
      t("Pierwiastek zachowuje wartość nieujemną. Po podzieleniu przez |x| pozostaje znak kierunku i współczynnik liniowy.",
        "The square root is nonnegative. Dividing by |x| retains the direction sign and linear coefficient."),twice,ratio);
  }else{
    expr="√(("+f(A)+")·x + ("+f(p.e)+")) − ("+s+")·√(x + ("+f(p.d)+"))";
    const diff=calculate("difference",p.e,mul(A,p.d));
    lesson.work("f(x) = ("+f(diff.result)+")/(√(("+f(A)+")·x + ("+f(p.e)+")) + ("+s+")·√(x + ("+f(p.d)+")))",
      t("Po pomnożeniu przez sprzężenie wyrazy liniowe skracają się, pozostawiając stały licznik.",
        "Conjugation cancels both linear terms and leaves a constant numerator."),diff);
    lesson.work("x→+∞: "+t("mianownik rośnie do +∞, licznik jest stały","denominator tends to +∞, numerator is constant"),
      t("Oba pierwiastki rosną jak √x, więc stała podzielona przez ich dodatnią sumę dąży do zera.",
        "Both roots grow like √x, so a constant divided by their positive sum tends to zero."));
  }
  const result=infinityRootConjugationLimit(p);
  lesson.work("lim f(x) = "+f(result),
    t("Po sprzężeniu i prawidłowym ustaleniu znaku |x| otrzymujemy granicę skończoną.",
      "Conjugation and the correct sign of |x| yield the finite limit."));
  return lesson.finish(
    t("Wyznacz granicę przy x→","Find the limit as x→")+sign+".\nf(x) = "+expr,
    {kind:"limit",value:{kind:"finite",value:result}},
    t("Pomnóż przez wyrażenie sprzężone. Pamiętaj, że √(x²)=|x|.",
      "Multiply by the conjugate. Remember that √(x²)=|x|."),
    t("Po odjęciu kwadratów podziel przez |x| lub przez √x, zgodnie ze stopniem podpierwiastkowych wielomianów.",
      "After subtracting squares, divide by |x| or √x according to the radicand degree.")
  );
}
