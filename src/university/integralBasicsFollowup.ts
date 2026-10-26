import {rational as r, addRational as add, multiplyRational as mul, divideRational as div, type Rational} from "../rational";
import {formatRational as fmt} from "../answers";
import {polynomialProduct, polynomialText, type Polynomial} from "./polynomial";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type IntegralBasicsFollowupProblem =
  | Readonly<{kind:"integral-direct-product"; linear:readonly [Rational,Rational]; quadratic:readonly [Rational,Rational,Rational]}>
  | Readonly<{kind:"integral-table-arctan"; a:Rational; b:Rational; k:Rational}>;

const signed=(v:number)=>v%2===0?1:-1;
function createProduct(v:number,level:Difficulty):IntegralBasicsFollowupProblem{
  const den=level==="hard"?1:level==="advanced"?2:3;
  const linear:readonly [Rational,Rational]=[
    r(v%7-3,den),r(signed(v)*(1+v%4),den),
  ];
  const quadratic:readonly [Rational,Rational,Rational]=[
    r(Math.floor(v/6)%5-2,den),
    r(v%5-2,den),
    r(1+Math.floor(v/4)%3,den),
  ];
  return {kind:"integral-direct-product",linear,quadratic};
}
function createArctan(v:number,level:Difficulty):IntegralBasicsFollowupProblem{
  const den=level==="hard"?1:level==="advanced"?2:3;
  return {kind:"integral-table-arctan",
    a:r(signed(Math.floor(v/4))*(1+v%4),den),
    b:r(v%7-3,den),
    k:r(signed(v)*(1+Math.floor(v/4)%4),den)};
}
export const integralBasicsFollowupFamilies:readonly UniversityFamily[]=[
 {id:"integral-direct-product",category:"integrals",
  titles:{pl:"Całka z iloczynu wielomianów",en:"Integral of a polynomial product"},
  supportedDifficulties:["hard","advanced","expert"],create:createProduct},
 {id:"integral-table-arctan",category:"integrals",
  titles:{pl:"Całka tablicowa — arctan",en:"Table integral — arctangent"},
  supportedDifficulties:["hard","advanced","expert"],create:createArctan},
];
export function expandedProduct(p:Extract<IntegralBasicsFollowupProblem,{kind:"integral-direct-product"}>):Polynomial{
  if(p.linear[1].numerator===0n||p.quadratic[2].numerator===0n)
    throw Error("Expected nonzero highest-degree coefficients");
  return polynomialProduct(p.linear,p.quadratic);
}
export function arctanScale(p:Extract<IntegralBasicsFollowupProblem,{kind:"integral-table-arctan"}>):Rational{
  if(p.a.numerator===0n||p.k.numerator===0n)throw Error("Expected nonzero coefficients");
  return div(p.k,p.a);
}
export function presentIntegralBasicsFollowup(p:IntegralBasicsFollowupProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson;
  const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));
  if(p.kind==="integral-direct-product"){
    const expression="("+polynomialText(p.linear)+")("+polynomialText(p.quadratic)+")";
    const coefficients=expandedProduct(p);
    const terms=coefficients.map((coefficient,i)=>({
      basis:"x^"+(i+1),coefficient:div(coefficient,r(i+1)),
    }));
    work("("+polynomialText(p.linear)+") · ("+polynomialText(p.quadratic)+") = "+polynomialText(coefficients),
      "Rozmnażamy wszystkie składniki obu nawiasów, a następnie redukujemy wyrazy o tych samych potęgach x.",
      "Multiply every term across both factors, then collect matching powers of x.");
    work("∫("+polynomialText(coefficients)+") dx = "+
      terms.map(term=>"("+fmt(term.coefficient)+")"+term.basis).join(" + ")+" + C",
      "Stosujemy osobno regułę potęgową: całka z c·x^j to (c/(j+1))·x^(j+1), gdy j≥0.",
      "Integrate term by term: c·x^j gives (c/(j+1))·x^(j+1) for j≥0.");
    work("F′(x)="+polynomialText(coefficients),
      "Kontrolujemy wynik przez różniczkowanie, które odtwarza rozwinięty iloczyn.",
      "Differentiate the answer to recover the expanded product.");
    return lesson.finish(
      t("Rozwiń nawiasy i oblicz ∫","Expand the brackets and find ∫")+
      " "+expression+" dx. "+t("Podaj współczynniki F(x) i uwzględnij +C.","Enter the coefficients of F(x) and include +C."),
      {kind:"primitive",terms},
      t("Najpierw rozwiń iloczyn wielomianów.","Expand the polynomial product before integrating."),
      t("Po zsumowaniu współczynników całkuj osobno kolejne potęgi x.",
        "After collecting coefficients, integrate each power of x separately."));
  }
  const coefficient=arctanScale(p);
  const inside="("+fmt(p.a)+")x+("+fmt(p.b)+")";
  const basis="arctan("+inside+")";
  const integrand="("+fmt(p.k)+")/[1+("+inside+")²]";
  work("u="+inside+"; u′="+fmt(p.a),
    "Sprawdzamy pochodną argumentu i dzielimy przez niezerowy współczynnik przy x.",
    "Find the derivative of the inner argument and divide by the nonzero coefficient of x.");
  work("∫ du/(1+u²)=arctan(u)+C",
    "To wzór tablicowy ważny dla każdej rzeczywistej wartości u.",
    "This standard integral holds for every real value of u.");
  work("F(x)=("+fmt(coefficient)+")"+basis+"+C",
    "Współczynnik funkcji pierwotnej jest równy k/a; znak a trzeba zachować.",
    "The antiderivative coefficient is k/a, including the sign of a.");
  work("F′(x)=("+fmt(coefficient)+")·("+fmt(p.a)+")/[1+("+inside+")²]="+integrand,
    "Pochodna arctan(u) to u′/(1+u²); mianownik jest zawsze dodatni.",
    "The derivative of arctan(u) is u′/(1+u²); the denominator is always positive.");
  return lesson.finish(
    t("Oblicz całkę tablicową ∫ ","Find the table integral ∫ ")+integrand+" dx. "+
    t("Dziedzina: wszystkie liczby rzeczywiste. Wpisz współczynnik przy arctan i +C.",
      "Domain: all real numbers. Enter the coefficient of arctan and +C."),
    {kind:"primitive",terms:[{basis,coefficient}]},
    t("Rozpoznaj wzór ∫du/(1+u²)=arctan(u)+C.",
      "Recognize the formula ∫du/(1+u²)=arctan(u)+C."),
    t("Podziel k przez pochodną argumentu ax+b, czyli przez a.",
      "Divide k by the derivative of ax+b, namely a."));
}
