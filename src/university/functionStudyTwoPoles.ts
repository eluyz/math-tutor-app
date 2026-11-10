import {
  rational as r, addRational as add, subtractRational as sub,
  multiplyRational as mul, divideRational as div, equalRational as eq,
  type Rational,
} from "../rational";
import { formatRational as fmt, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import { teaching } from "./teaching";

/** One bounded D08 source-shaped method: two distinct real poles.
 * Even mode: central extremum and no inflections.
 * Odd mode: no stationary points and one genuine inflection.
 * This isolated stage deliberately does NOT register the family in the catalog.
 */
export type TwoPoleStudyProblem = Readonly<
  | {kind:"analysis-study-two-poles";mode:"even";a:Rational;q:Rational;s:Rational;k:Rational}
  | {kind:"analysis-study-two-poles";mode:"odd";a:Rational;q:Rational;c:Rational}
>;
const sq=(v:Rational)=>mul(v,v);
const sign=(v:Rational)=>v.numerator>0n?1:-1;
const inf=(s:number)=>s>0?"+∞":"−∞";
const polarity=(s:number)=>s>0?"+":"−";
function validate(p:TwoPoleStudyProblem){
  if(p.q.numerator<=0n)throw Error("q must be positive");
  if(p.mode==="even"){
    if(p.s.numerator<=0n||sub(p.q,p.s).numerator<=0n||p.k.numerator===0n)
      throw Error("even mode requires 0<s<q and k != 0");
  }else if(p.c.numerator===0n)throw Error("odd mode requires c != 0");
}
export function makeTwoPoleStudy(variant:number,level:Difficulty):TwoPoleStudyProblem{
  if(!Number.isInteger(variant)||variant<0||variant>=24||
     !["hard","advanced","expert"].includes(level))throw Error("Unsupported D08 two-pole variant/level");
  const den=level==="hard"?1:level==="advanced"?2:3;
  const a=r((variant*3)%11-5,den),q=r(3+variant%4,den);
  const amplitude=r((Math.floor(variant/2)%2===0?1:-1)*(1+variant%5),den);
  if(variant%2===0){
    const s=r(1+(Math.floor(variant/2)%2),den);
    return {kind:"analysis-study-two-poles",mode:"even",a,q,s,k:amplitude};
  }
  return {kind:"analysis-study-two-poles",mode:"odd",a,q,c:amplitude};
}
export const twoPoleStudyStage={
  id:"analysis-study-two-poles",category:"derivatives",
  titles:{pl:"Badanie funkcji z dwoma asymptotami pionowymi",en:"Study of a function with two vertical poles"},
  supportedDifficulties:["hard","advanced","expert"],variantCountPerLevel:24,
  create:makeTwoPoleStudy,
} as const;
export function twoPoleStudyPoles(p:TwoPoleStudyProblem):readonly [Rational,Rational]{
  validate(p);
  return [sub(p.a,p.q),add(p.a,p.q)];
}
export function twoPoleStudyValue(p:TwoPoleStudyProblem,x:Rational):Rational{
  validate(p);
  const t=sub(x,p.a),t2=sq(t),q2=sq(p.q);
  if(eq(t2,q2))throw Error("Excluded input at a pole");
  return p.mode==="even"
    ?div(mul(p.k,sub(t2,sq(p.s))),sub(t2,q2))
    :div(mul(p.c,t),sub(q2,t2));
}
export function twoPoleStudyPoint(p:TwoPoleStudyProblem):readonly [Rational,Rational]{
  validate(p);
  return [p.a,twoPoleStudyValue(p,p.a)];
}
export function presentTwoPoleStudy(p:TwoPoleStudyProblem,locale:Locale){
  validate(p);
  const lesson=teaching(locale),{t}=lesson;
  const a=fmt(p.a),q=fmt(p.q),t0="(x−("+a+"))";
  const [leftPole,rightPole]=twoPoleStudyPoles(p).map(fmt);
  const even=p.mode==="even";
  const k=even?fmt(p.k):"0";
  const c=even?mul(p.k,sub(sq(p.q),sq(p.s))):p.c;
  const ampSign=sign(c),plus=polarity(ampSign),minus=polarity(-ampSign);
  const expression=even
    ?"("+fmt(p.k)+")("+t0+"²−("+fmt(p.s)+")²)/("+t0+"²−("+q+")²)"
    :"("+fmt(p.c)+")"+t0+"/( ("+q+")²−"+t0+"²)";
  const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));
  work("t=x−("+a+"); f(x)="+expression,
    "Wprowadzamy przesunięcie t, aby uporządkować oba miejsca zerowe mianownika.",
    "Use the shift t to locate both denominator zeros.");
  work("D=ℝ\\{"+leftPole+", "+rightPole+"}; x≠"+leftPole+"; x≠"+rightPole,
    "Mianownik zeruje się przy t=−q oraz t=q. Oba punkty są wyłączone.",
    "The denominator vanishes at t=−q and t=q. Both inputs are excluded.");
  if(even){
    work("f(x)=("+k+")+ ("+fmt(c)+")/("+t0+"²−("+q+")²)",
      "Rozdzielamy część stałą od wymiernej, aby obliczyć poziomą asymptotę.",
      "Separate the constant part from the proper rational term to find the horizontal asymptote.");
    work("f(x)=0 ⇔ x="+fmt(sub(p.a,p.s))+" lub x="+fmt(add(p.a,p.s)),
      "Zerami licznika są t=−s i t=s; 0<s<q zapewnia, że nie leżą w biegunach.",
      "The numerator vanishes at t=−s and t=s. Since 0<s<q, neither is a pole.");
  }else{
    work("f(x)=0 ⇔ x="+a,
      "Jedynym zerem licznika jest t=0; q>0 gwarantuje, że punkt jest w dziedzinie.",
      "The numerator vanishes only at t=0, which belongs to the domain because q>0.");
  }
  if(twoPoleStudyPoles(p).some(v=>eq(v,r(0)))){
    work("0∉D; "+t("brak przecięcia z osią OY","no y-axis intercept"),
      "Argument x=0 jest jednym z wyłączonych biegunów, więc nie tworzy przecięcia.",
      "The input x=0 is an excluded pole and cannot be a y-axis intercept.");
  }else{
    work(t("Przecięcie z osią OY: ","Y-axis intercept: ")+"f(0)="+fmt(twoPoleStudyValue(p,r(0))),
      "Podstawiamy x=0 dopiero po sprawdzeniu dziedziny.",
      "Evaluate x=0 only after confirming it belongs to the domain.");
  }
  work("lim(x→±∞)f(x)="+k+"; y="+k,
    "W obu kierunkach iloraz dąży do wskazanej stałej: to asymptota pozioma.",
    "Both infinite-direction limits approach this constant: a horizontal asymptote.");
  if(even){
    work("x="+leftPole+": lim⁻="+inf(ampSign)+", lim⁺="+inf(-ampSign)+
         "; x="+rightPole+": lim⁻="+inf(-ampSign)+", lim⁺="+inf(ampSign),
      "Mianownik zmienia znak po obu stronach każdego prostego bieguna.",
      "The denominator changes sign across each simple pole.");
    work("f′(x)=−2("+fmt(c)+")"+t0+"/("+t0+"²−("+q+")²)²; f′=0 ⇔ x="+a,
      "Pochodna ma dokładnie jedno zero w dziedzinie: w środku między biegunami.",
      "The derivative has exactly one zero in the domain: midway between the poles.");
    work("f′: (−∞,"+leftPole+"): "+plus+"; ("+leftPole+","+a+"): "+plus+
         "; ("+a+","+rightPole+"): "+minus+"; ("+rightPole+",+∞): "+minus,
      "Skwadratowany mianownik jest dodatni, więc znak wyznacza −c·t.",
      "The squared denominator is positive; the sign follows −c·t.");
    work(t("Ekstremum lokalne w ","Local extremum at ")+"("+a+","+fmt(twoPoleStudyPoint(p)[1])+") " +
           t(ampSign>0?"maksimum":"minimum",ampSign>0?"maximum":"minimum"),
      "Znak pochodnej zmienia się w środku; punkt należy do dziedziny.",
      "The derivative changes sign at the center, which belongs to the domain.");
    work("f″(x)=2("+fmt(c)+")(3"+t0+"²+("+q+")²)/("+t0+"²−("+q+")²)³",
      "Licznik poza stałą c ma stały znak: 3t²+q² jest zawsze dodatnie.",
      "Apart from c, the numerator keeps its sign because 3t²+q² is positive.");
    work("f″: (−∞,"+leftPole+") "+plus+"; ("+leftPole+","+rightPole+") "+minus+
         "; ("+rightPole+",+∞) "+plus,
      "Wypukłość zmienia się tylko przez wyłączone bieguny, a nie przez punkty przegięcia.",
      "Concavity changes only across the excluded poles, not at an inflection point.");
    work(t("Punkty przegięcia: brak.","Inflection points: none."),
      "Funkcja nie ma żadnego punktu w dziedzinie, w którym zmieniałby się znak f″.",
      "No point in the domain changes the sign of the second derivative.");
  }else{
    work("x="+leftPole+" i x="+rightPole+": lim⁻="+inf(ampSign)+", lim⁺="+inf(-ampSign),
      "W pobliżu każdego bieguna licznik zachowuje niezerową granicę.",
      "The numerator approaches a nonzero limit at each pole.");
    work("f′(x)=("+fmt(c)+")(("+q+")²+"+t0+"²)/(("+q+")²−"+t0+"²)²",
      "Licznik pochodnej ma stały znak c, a mianownik jest dodatnim kwadratem.",
      "The derivative has the constant sign of c and a positive square denominator.");
    work("f′: (−∞,"+leftPole+"), ("+leftPole+","+rightPole+"), ("+rightPole+",+∞): "+plus,
      "Funkcja jest ściśle monotoniczna na każdym z trzech przedziałów dziedziny.",
      "The function is strictly monotone on each of the three domain intervals.");
    work(t("Ekstrema lokalne: brak.","Local extrema: none."),
      "Nigdzie w dziedzinie pochodna nie zeruje się ani nie zmienia znaku.",
      "The derivative neither vanishes nor changes sign within the domain.");
    work("f″(x)=2("+fmt(c)+")"+t0+"(3("+q+")²+"+t0+"²)/(("+q+")²−"+t0+"²)³",
      "Jedynym rzeczywistym zerem drugiej pochodnej w dziedzinie jest t=0.",
      "The only real zero of the second derivative in the domain is t=0.");
    work("f″: (−∞,"+leftPole+") "+plus+"; ("+leftPole+","+a+") "+minus+
         "; ("+a+","+rightPole+") "+plus+"; ("+rightPole+",+∞) "+minus,
      "Znak f″ zmienia się w x=a; wyłączone bieguny nie tworzą punktów przegięcia.",
      "The sign of f″ changes at x=a; excluded poles are not inflection points.");
    work(t("Punkt przegięcia: ","Inflection point: ")+"("+a+",0)",
      "W x=a funkcja jest ciągła i druga pochodna zmienia znak.",
      "The function is continuous at x=a and the second derivative changes sign.");
  }
  work(t("Szkic na kartce: trzy gałęzie rozdzielone dwoma biegunami.",
         "Sketch on paper: three branches separated by two poles."),
    even
      ? "Zaznacz asymptoty i ekstremum lokalne; szkic porównaj samodzielnie z krokami."
      : "Zaznacz asymptoty i punkt przegięcia; szkic porównaj samodzielnie z krokami.",
    even
      ? "Mark both asymptotes and the local extremum; compare your sketch against the steps."
      : "Mark both asymptotes and the inflection point; compare your sketch against the steps.");
  const [xp,yp]=twoPoleStudyPoint(p);
  const answer:AnswerSpec={kind:"list",labels:["x₁","x₂","y₀","x₃","y₃"],
    values:[...twoPoleStudyPoles(p),even?p.k:r(0),xp,yp]};
  const name=t(even?"ekstremum":"punkt przegięcia",even?"extremum":"inflection point");
  return lesson.finish(
    t("Zbadaj f(x)="+expression+": dziedzinę, zera, przecięcia osi, granice, asymptoty, f′, f″, monotoniczność, ekstrema i przegięcia. Narysuj szkic na kartce. Podaj x₁,x₂ biegunów, y₀ asymptoty poziomej oraz (x₃,y₃) "+name+".",
      "Fully study f(x)="+expression+": domain, zeros, intercepts, limits, asymptotes, f′, f″, monotonicity, extrema and inflections. Sketch on paper. Give vertical poles x₁,x₂, horizontal asymptote y₀, and (x₃,y₃) of the "+name+"."),
    answer,
    t("Zacznij od t=x−a oraz pierwiastków mianownika; nie traktuj biegunów jak przegięć.",
      "Start with t=x−a and the denominator roots; do not mistake poles for inflections."),
    t("Dla obu biegunów zbadaj granice jednostronne, potem znaki pochodnych w przedziałach dziedziny.",
      "Check one-sided limits at both poles, then derivative signs on the domain intervals."),
  );
}