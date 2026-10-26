import {rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational} from "../rational";
import {formatRational as fmt} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type IntegralMethodsFollowupProblem =
  | Readonly<{kind:"integral-log-substitution";a:Rational;b:Rational;c:Rational;k:Rational}>
  | Readonly<{kind:"integral-parts-trig-linear";mode:"sin"|"cos";a:Rational;b:Rational;k:Rational}>;

const signed=(v:number)=>v%2===0?1:-1;
const square=(v:Rational)=>mul(v,v);
const denominatorFor=(level:Difficulty)=>level==="hard"?1:level==="advanced"?2:3;

function createLog(v:number,level:Difficulty):IntegralMethodsFollowupProblem{
  const den=denominatorFor(level);
  return {kind:"integral-log-substitution",
    a:r(signed(v)*(1+v%4),den),
    b:r(v%7-3,den),
    c:r(1+Math.floor(v/6)%4,den),
    k:r(signed(Math.floor(v/4))*(1+Math.floor(v/4)%4),den)};
}
function createTrig(v:number,level:Difficulty):IntegralMethodsFollowupProblem{
  const den=denominatorFor(level);
  return {kind:"integral-parts-trig-linear",
    mode:v%2===0?"sin":"cos",
    a:r(signed(Math.floor(v/2))*(1+v%4),den),
    b:r(v%7-3,den),
    k:r(signed(v)*(1+Math.floor(v/4)%4),den)};
}
export const integralMethodsFollowupFamilies:readonly UniversityFamily[]=[
  {id:"integral-log-substitution",category:"integrals",
    titles:{pl:"Podstawienie logarytmiczne w całce",en:"Logarithmic substitution in an integral"},
    supportedDifficulties:["hard","advanced","expert"],create:createLog},
  {id:"integral-parts-trig-linear",category:"integrals",
    titles:{pl:"Całkowanie przez części — sinus i cosinus",en:"Integration by parts — sine and cosine"},
    supportedDifficulties:["hard","advanced","expert"],create:createTrig},
];

type LogProblem=Extract<IntegralMethodsFollowupProblem,{kind:"integral-log-substitution"}>;
type TrigProblem=Extract<IntegralMethodsFollowupProblem,{kind:"integral-parts-trig-linear"}>;
export function logDenominator(p:LogProblem,x:Rational):Rational{
  if(p.a.numerator===0n||p.k.numerator===0n||p.c.numerator<=0n)
    throw Error("Expected a,k nonzero and c positive");
  const u=add(mul(p.a,x),p.b);
  return add(square(u),p.c);
}
export function logNumerator(p:LogProblem,x:Rational):Rational{
  if(p.a.numerator===0n||p.k.numerator===0n)throw Error("Expected nonzero coefficients");
  return mul(mul(mul(r(2),p.k),p.a),add(mul(p.a,x),p.b));
}
export function trigPartsCoefficients(p:TrigProblem):{first:Rational;second:Rational}{
  if(p.a.numerator===0n||p.k.numerator===0n)throw Error("Expected nonzero coefficients");
  const ratio=div(p.k,p.a),correction=div(ratio,p.a);
  return {first:p.mode==="sin"?sub(r(0),ratio):ratio,second:correction};
}
export function presentIntegralMethodsFollowup(p:IntegralMethodsFollowupProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));
  const a=fmt(p.a),b=fmt(p.b),k=fmt(p.k),inside="("+a+")x+("+b+")";
  if(p.kind==="integral-log-substitution"){
    logDenominator(p,r(0));
    const c=fmt(p.c),quadratic="("+inside+")²+("+c+")";
    const factor=fmt(mul(mul(r(2),p.k),p.a));
    const numerator="("+factor+")("+inside+")";
    const integrand=numerator+"/("+quadratic+")";
    const basis="ln("+quadratic+")";
    work("u="+quadratic+"; du/dx=2("+a+")("+inside+")",
      "W mianowniku wybieramy całe u, a w liczniku rozpoznajemy jego pochodną pomnożoną przez k.",
      "Take the full denominator as u; its derivative is present in the numerator with factor k.");
    work("u=(("+a+")x+("+b+"))²+("+c+") > 0",
      "Kwadrat jest nieujemny, a c jest dodatnie. Funkcja ln(u) jest więc określona dla każdego x∈R.",
      "A square is nonnegative and c is positive, so ln(u) is defined for all real x.");
    work("∫ ("+k+")u′/u dx = ("+k+")ln(u)+C",
      "Stosujemy wzór ∫du/u=ln|u|+C; tu u>0, więc ln|u|=ln(u).",
      "Apply ∫du/u=ln|u|+C; since u>0, the absolute-value bars can be removed.");
    work("F(x)=("+k+")"+basis+"+C",
      "Współczynnik k pozostaje przed logarytmem; nie dzielimy go ponownie przez a.",
      "Keep k in front of the logarithm; do not divide it by a a second time.");
    work("F′(x)=("+k+")·2("+a+")("+inside+")/("+quadratic+")="+integrand,
      "Sprawdzenie regułą łańcuchową odtwarza licznik i mianownik funkcji podcałkowej.",
      "The chain rule recovers the original numerator and denominator.");
    return lesson.finish(
      t("Oblicz całkę przez podstawienie: ∫ ","Evaluate by substitution: ∫ ")+integrand+" dx. "+
      t("Podaj współczynnik przy ln i dodaj +C.","Enter the ln coefficient and include +C."),
      {kind:"primitive",terms:[{basis,coefficient:p.k}]},
      t("Wybierz mianownik jako u i policz u′.","Set u equal to the denominator and find u′."),
      t("Sprawdź, że u>0 i skorzystaj z ∫du/u=ln|u|+C.",
        "Check that u>0 and apply ∫du/u=ln|u|+C."));
  }
  const {first,second}=trigPartsCoefficients(p);
  const trig=p.mode==="sin"?"sin":"cos",other=p.mode==="sin"?"cos":"sin";
  const integrand="("+k+")x "+trig+"("+inside+")";
  const firstBasis="x "+other+"("+inside+")",secondBasis=trig+"("+inside+")";
  const v=p.mode==="sin"?"−("+fmt(div(p.k,p.a))+")cos("+inside+")":
    "("+fmt(div(p.k,p.a))+")sin("+inside+")";
  work("u=x; dv=("+k+")"+trig+"("+inside+")dx; du=dx; v="+v,
    "Wybieramy x jako u; po zróżniczkowaniu staje się stałą, a funkcję trygonometryczną całkujemy z poprawnym znakiem.",
    "Choose u=x, whose derivative is 1, and integrate the trigonometric factor with its correct sign.");
  work("∫u dv = uv − ∫v du",
    "Po pierwszym kroku pozostała całka dotyczy samego sinusa lub cosinusa.",
    "After the first step, the remaining integral involves only a sine or cosine.");
  work("∫ sin("+inside+")dx=−cos("+inside+")/("+a+") ; ∫ cos("+inside+")dx=sin("+inside+")/("+a+")",
    "W obu wzorach dzielimy przez niezerową pochodną argumentu, czyli a.",
    "Divide by the nonzero inner derivative a in both formulas.");
  work("F(x)=("+fmt(first)+")"+firstBasis+" + ("+fmt(second)+")"+secondBasis+" + C",
    "Drugi składnik usuwa dodatkową funkcję trygonometryczną powstałą przy różniczkowaniu x·sin lub x·cos.",
    "The second term cancels the extra trigonometric term produced when differentiating x times sine or cosine.");
  work("F′(x)="+integrand,
    "Weryfikujemy znak obu składników przez regułę iloczynu i regułę łańcuchową.",
    "Verify both signs using the product rule and chain rule.");
  return lesson.finish(
    t("Oblicz przez części ∫ ","Integrate by parts ∫ ")+integrand+" dx. "+
    t("Podaj oba współczynniki funkcji pierwotnej i dodaj +C.",
      "Enter both antiderivative coefficients and include +C."),
    {kind:"primitive",terms:[{basis:firstBasis,coefficient:first},{basis:secondBasis,coefficient:second}]},
    t("Weź u=x oraz dv jako funkcję trygonometryczną razy dx.",
      "Choose u=x and dv as the trigonometric factor times dx."),
    t("Użyj uv−∫vdu, zwracając uwagę na znaki przy całkach sin oraz cos.",
      "Use uv−∫vdu, keeping track of signs in the sine and cosine antiderivatives."));
}
