import {rational as r,addRational as add,divideRational as div,multiplyRational as mul,type Rational} from "../rational";
import {formatRational as f,type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

/** C03 source-shape proxies only. Not registered in the public catalog by this PR. */
export type C03ConjugateGap =
  | Readonly<{mode:"linear-root-pair";left:Rational;right:Rational}>
  | Readonly<{mode:"reverse-quadratic"|"positive-quadratic-sum";a:Rational;b:Rational}>
  | Readonly<{mode:"negative-constant-quadratic";k:Rational;a:Rational;b:Rational;nStart:number}>;

const levels=["medium","hard","advanced","expert"] as const;

/** 96 original synthetic examples (4 levels x 24), equally split among four missing forms. */
export function createC03ConjugateGap(variant:number,level:Difficulty):C03ConjugateGap {
  if(!Number.isInteger(variant)||variant<0||variant>=24||!levels.includes(level as typeof levels[number]))
    throw Error("C03 variant must be integer 0..23 and difficulty must be supported");
  const tier=levels.indexOf(level as typeof levels[number])+1;
  const i=Math.floor(variant/4);
  if(variant%4===0) {
    const left=r(2+i+10*(tier-1)), right=add(left,r(1+i%3));
    return {mode:"linear-root-pair",left,right};
  }
  if(variant%4===1)
    return {mode:"reverse-quadratic",a:r(1+i+6*(tier-1),tier),b:r(1+(2*i)%5+8*(tier-1),tier)};
  if(variant%4===2)
    return {mode:"positive-quadratic-sum",a:r(1+i%3+5*(tier-1),tier),b:r(2+i+8*(tier-1),tier)};
  const b=r(1+i+7*(tier-1));
  return {mode:"negative-constant-quadratic",k:r(1+i%3),a:r(i%4),b,nStart:Number(b.numerator)+1};
}

export function c03ConjugateGapLimit(p:C03ConjugateGap):LimitValue {
  if(p.mode==="linear-root-pair"){
    if(p.left.numerator<0n||p.right.numerator<0n||
       p.left.numerator*p.right.denominator===p.right.numerator*p.left.denominator)
      throw Error("Require distinct nonnegative shifts for linear-root pair");
    return {kind:"finite",value:r(0)};
  }
  if(p.mode==="reverse-quadratic"||p.mode==="positive-quadratic-sum"){
    if(p.a.numerator<=0n||p.b.numerator<0n)throw Error("Unsafe quadratic-root domain");
    return p.mode==="positive-quadratic-sum"
      ? {kind:"positive-infinity"}
      : {kind:"finite",value:div(mul(r(-1),p.a),r(2))};
  }
  if(p.k.numerator<=0n||p.a.numerator<0n||p.b.numerator<=0n||
     !Number.isInteger(p.nStart)||p.nStart<1)
    throw Error("Unsafe negative-constant quadratic domain");
  const n=p.nStart;
  const k=Number(p.k.numerator)/Number(p.k.denominator),
    a=Number(p.a.numerator)/Number(p.a.denominator),
    b=Number(p.b.numerator)/Number(p.b.denominator);
  if(k*k*n*n+a*n-b<=0)throw Error("Negative radicand at promised starting index");
  return {kind:"finite",value:div(p.a,mul(r(2),p.k))};
}

export function presentC03ConjugateGap(p:C03ConjugateGap,locale:Locale) {
  const value=c03ConjugateGapLimit(p);
  const lesson=teaching(locale), {t}=lesson;
  let expression="";
  if(p.mode==="linear-root-pair"){
    const a=f(p.left),b=f(p.right);
    expression="√(n+("+a+")) − √(n+("+b+"))";
    lesson.work("n≥1; n+("+a+")>0; n+("+b+")>0",
      t("Oba pierwiastki są określone; sprawdzamy najpierw dziedzinę.",
        "Both roots are defined; check the domain first."));
    lesson.work("aₙ = (("+a+")−("+b+"))/(√(n+("+a+"))+√(n+("+b+")))",
      t("Mnożymy przez sprzężenie: różnica kwadratów usuwa n z licznika.",
        "Multiply by the conjugate: the difference of squares eliminates n in the numerator."));
    lesson.work("lim aₙ = 0, bo mianownik → +∞",
      t("Licznik jest stały, a suma dodatnich pierwiastków rośnie bez ograniczeń.",
        "The numerator is constant while the sum of positive roots grows without bound."));
  }else if(p.mode==="negative-constant-quadratic"){
    const k=f(p.k),a=f(p.a),b=f(p.b);
    expression="√(("+k+")²·n²+("+a+")·n−("+b+")) − ("+k+")·n";
    lesson.work("n≥"+p.nStart+"; ("+k+")²·n²+("+a+")·n−("+b+")>0",
      t("Ze względu na ujemną stałą zadanie rozpatrujemy od podanego indeksu, a nie automatycznie dla każdego n≥1.",
        "Because of the negative constant, the expression is considered from the stated index, not automatically for every n≥1."));
    lesson.work("aₙ = (("+a+")·n−("+b+"))/(√(("+k+")²·n²+("+a+")·n−("+b+"))+("+k+")·n)",
      t("Sprzężenie usuwa najwyższy składnik kwadratowy pod pierwiastkiem.",
        "The conjugate cancels the leading quadratic term inside the radical."));
    lesson.work("aₙ = (("+a+")−("+b+")/n)/(√(("+k+")²+("+a+")/n−("+b+")/n²)+("+k+"))",
      t("Dzielimy przez dodatnie n; pamiętamy o √(n²)=n.",
        "Divide by positive n, using √(n²)=n."));
    lesson.work("lim aₙ = ("+a+")/(2·("+k+")) = "+(value.kind==="finite"?f(value.value):"?"),
      t("Składniki z 1/n i 1/n² znikają w granicy.",
        "The 1/n and 1/n² terms vanish in the limit."));
  }else{
    const a=f(p.a),b=f(p.b);
    const root="√(n²+("+a+")·n+("+b+"))";
    const reverse=p.mode==="reverse-quadratic";
    expression=reverse?"n − "+root:"n + "+root;
    lesson.work("n≥1; n²+("+a+")·n+("+b+")>0",
      t("Dodatniość wyrażenia pod pierwiastkiem jest gwarantowana dla n≥1.",
        "The radicand is positive for n≥1."));
    if(reverse){
      lesson.work("aₙ = (−("+a+")·n−("+b+"))/(n+"+root+")",
        t("Przy n−√(...) znak w liczniku sprzężenia jest ujemny.",
          "For n−√(...), the conjugate numerator carries the minus sign."));
      lesson.work("aₙ = (−("+a+")−("+b+")/n)/(1+√(1+("+a+")/n+("+b+")/n²))",
        t("Dzielimy licznik i mianownik przez n.",
          "Divide numerator and denominator by n."));
      lesson.work("lim aₙ = −("+a+")/2 = "+(value.kind==="finite"?f(value.value):"?"),
        t("Graniczny mianownik wynosi 2; minus pozostaje.",
          "The limiting denominator equals 2; preserve the negative sign."));
    }else{
      lesson.work("aₙ = n·(1+√(1+("+a+")/n+("+b+")/n²))",
        t("Wyłączamy n i korzystamy z √(n²)=n, bo n>0.",
          "Factor out n and use √(n²)=n because n>0."));
      lesson.work("1+√(1+("+a+")/n+("+b+")/n²) → 2 > 0",
        t("Nawias ma dodatnią granicę 2, więc całość rośnie do +∞.",
          "The parenthesized factor tends to positive 2, so the sequence grows to +∞."));
      lesson.work("lim aₙ = +∞",
        t("To suma, nie różnica. Nie stosujemy fałszywego skracania przez sprzężenie.",
          "This is a sum, not a difference. Do not use an invalid conjugate cancellation."));
    }
  }
  const bound=p.mode==="negative-constant-quadratic"?"n≥"+p.nStart:"n≥1";
  return lesson.finish(
    t("Wyznacz granicę przy n→+∞, "+bound+".\naₙ = "+expression,
      "Find the limit as n→+∞, "+bound+".\naₙ = "+expression),
    {kind:"limit",value},
    t("Najpierw rozpoznaj, czy jest to różnica dwóch pierwiastków, odwrócona różnica, czy suma.",
      "First identify whether it is a difference of two roots, a reversed difference, or a sum."),
    t("Przy różnicy użyj sprzężenia; przy sumie wyłącz n. Zawsze sprawdź znak i dziedzinę.",
      "Conjugate a difference; factor n from a sum. Always check signs and domain.")
  );
}
