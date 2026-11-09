import {
  rational as r, multiplyRational as mul, divideRational as div,
  subtractRational as sub, type Rational,
} from "../rational";
import {formatRational as fmt, type AnswerSpec} from "../answers";
import type {Locale} from "../locales/types";
import {teaching} from "./teaching";

/**
 * Source-shaped I02 practice, deliberately NOT registered in the shared catalog.
 * Integration needs a separately coordinated schema/catalog/CI change.
 * Only synthetic parameter families: no private source questions or answer keys.
 */
export type I02TableMode = "tan-square" | "cot-square" | "arcsin" | "radical-x";
export type I02TableStageProblem = Readonly<{
  kind:"integral-table-i02-stage";
  mode:I02TableMode;
  a:Rational;
  b:Rational;
  k:Rational;
}>;

const modes:readonly I02TableMode[]=["tan-square","cot-square","arcsin","radical-x"];

export function makeI02TableStage(variant:number):I02TableStageProblem{
  if(!Number.isInteger(variant)||variant<0||variant>=24)
    throw Error("I02 stage accepts integer variants 0..23 only");
  const j=Math.floor(variant/4),den=j%3===1?2:1;
  return {
    kind:"integral-table-i02-stage",mode:modes[variant%4],
    a:r((j%2?-1:1)*(2+j%3),den),
    b:r((j%5)-2,j%2?2:1),
    k:r((j%2?-1:1)*(1+Math.floor(j/2)),j%3===2?2:1),
  };
}

export function i02TableStageCoefficients(p:I02TableStageProblem):readonly Rational[]{
  if(p.a.numerator===0n||p.k.numerator===0n)
    throw Error("Nonzero inner derivative and integrand coefficient required");
  const ratio=div(p.k,p.a);
  if(p.mode==="tan-square")return [ratio,sub(r(0),p.k)];
  if(p.mode==="cot-square")return [sub(r(0),ratio),sub(r(0),p.k)];
  if(p.mode==="arcsin")return [ratio];
  if(p.mode==="radical-x")return [div(sub(r(0),p.k),mul(p.a,p.a))];
  throw Error("Unsupported I02 table method");
}

export function presentI02TableStage(p:I02TableStageProblem,locale:Locale){
  const lesson=teaching(locale),{t}=lesson,coef=i02TableStageCoefficients(p);
  const a=fmt(p.a),b=fmt(p.b),k=fmt(p.k);
  const u="("+a+")x+("+b+")";
  const kText="("+k+")";
  const plusC=t("Dodaj stałą +C.","Include the integration constant +C.");
  const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));
  const primitive=(terms:readonly {basis:string;coefficient:Rational}[]):AnswerSpec=>({kind:"primitive",terms});

  if(p.mode==="tan-square"||p.mode==="cot-square"){
    const isTan=p.mode==="tan-square";
    const trig=isTan?t("tg","tan"):t("ctg","cot");
    const basis=isTan?"tan("+u+")":"cot("+u+")";
    const integrand=kText+trig+"²("+u+")";
    const identity=isTan?"tan²(u)=1/cos²(u)−1":"cot²(u)=1/sin²(u)−1";
    const antiderivative=isTan?"tan(u)":"−cot(u)";
    const terms=[{basis,coefficient:coef[0]},{basis:"x",coefficient:coef[1]}];
    work("u="+u+"; du/dx="+a,
      "Sprawdź pochodną argumentu i przedział ciągłości funkcji trygonometrycznej.",
      "Check the inner derivative and work on a connected domain interval.");
    work(identity,
      "Zastosuj tożsamość, by rozdzielić kwadrat na funkcję z prostą pierwotną i stałą.",
      "Use the identity to split the squared function into an integrable term and a constant.");
    work("∫"+(isTan?"tan²":"cot²")+"(u)du="+antiderivative+"−u+C",
      "Współczynnik przy funkcji trygonometrycznej podziel przez a, a składnik stały zachowaj.",
      "Divide the trigonometric coefficient by a, preserving the constant term.");
    work("F(x)=("+fmt(coef[0])+")"+basis+"+("+fmt(coef[1])+")x+C",
      "Pochodna daje dokładnie k razy kwadrat funkcji; znak przy x jest ujemny.",
      "Differentiation restores k times the squared function; the x term has a minus sign.");
    return lesson.finish(
      t("Oblicz całkę tablicową ∫ ","Find the table integral ∫ ")+integrand+" dx. "+
      t("Pracuj na dowolnym spójnym przedziale dziedziny. ","Work on any connected domain interval. ")+plusC,
      primitive(terms),
      t("Zamień kwadrat funkcji na wyrażenie z 1/cos² lub 1/sin².",
        "Rewrite the square using 1/cos² or 1/sin²."),
      t("Całkuj po podstawieniu u=ax+b i nie zgub składnika −kx.",
        "Use u=ax+b and retain the −kx term."));
  }

  if(p.mode==="arcsin"){
    const root="√(1−("+u+")²)";
    const basis="arcsin("+u+")";
    work("u="+u+"; du="+a+"dx; |u|<1",
      "Rozpoznaj pochodną arcsin(u) i jej rzeczywistą dziedzinę różniczkowania.",
      "Recognize the derivative of arcsin(u) and its real differentiability domain.");
    work("∫du/√(1−u²)=arcsin(u)+C",
      "Pochodna arcsin(u) wynosi 1/√(1−u²), gdy |u|<1.",
      "The derivative of arcsin(u) is 1/√(1−u²) for |u|<1.");
    work("F(x)=("+fmt(coef[0])+")"+basis+"+C",
      "Podziel k przez a i sprawdź pochodną całej funkcji złożonej.",
      "Divide k by a and check the derivative of the composition.");
    return lesson.finish(
      t("Oblicz całkę ∫ ","Evaluate ∫ ")+kText+"/"+root+" dx, |"+u+"|<1. "+plusC,
      primitive([{basis,coefficient:coef[0]}]),
      t("Zauważ wzór z arcsin; to nie jest wzór na arctan.",
        "Use the arcsin formula, not the arctan formula."),
      t("Podstaw u=ax+b, uwzględnij znak a oraz dziedzinę |u|<1.",
        "Set u=ax+b, accounting for the sign of a and |u|<1."));
  }

  const ax="("+a+")x",root="√(1−("+ax+")²)";
  work("u=1−("+ax+")²; du/dx=−2("+a+")²x",
    "Pochodna wyrażenia pod pierwiastkiem zawiera x i znak ujemny.",
    "The derivative of the expression under the radical contains x and a negative sign.");
  work("∫u^(−1/2)du=2√u+C",
    "Podstawiamy wyrażenie pod pierwiastkiem, nie używamy wzoru z arcsin bez licznika.",
    "Substitute the radicand; do not use the arcsin formula with an x numerator.");
  work("F(x)=("+fmt(coef[0])+")"+root+"+C",
    "Pochodna odtwarza kx/√(1−a²x²) wraz z poprawnym znakiem.",
    "Differentiation restores kx/√(1−a²x²) with the correct sign.");
  return lesson.finish(
    t("Oblicz całkę ∫ ","Evaluate ∫ ")+kText+"x/"+root+" dx, |"+ax+"|<1. "+plusC,
    primitive([{basis:root,coefficient:coef[0]}]),
    t("W liczniku jest x: pochodna 1−a²x² jest proporcjonalna do x.",
      "The numerator contains x: the derivative of 1−a²x² is proportional to x."),
    t("Podstaw u=1−a²x²; współczynnik będzie ujemny.",
      "Set u=1−a²x²; the resulting coefficient is negative."));
}
