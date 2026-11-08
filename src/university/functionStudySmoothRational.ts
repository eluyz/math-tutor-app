import { rational as r, addRational as add, multiplyRational as mul, divideRational as div, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import { teaching } from "./teaching";

/** D08 candidate staged in isolation; no global catalog changes in this PR. */
export type SmoothRationalStudyProblem = Readonly<{
  kind: "analysis-study-smooth-rational";
  a: Rational; m: Rational; q: Rational; k: Rational;
  target: "critical" | "global";
}>;
const sq=(x:Rational)=>mul(x,x);
const positive=(p:SmoothRationalStudyProblem)=>p.m.numerator>0n;
const sign=(value:boolean)=>value?"+":"−";
const validate=(p:SmoothRationalStudyProblem)=>{
  if(p.q.numerator<=0n||p.m.numerator===0n)throw Error("Requires q>0 and m!=0");
};

export function makeSmoothRationalStudy(v:number,d:Difficulty):SmoothRationalStudyProblem {
  if(!Number.isInteger(v)||v<0||v>=24||!["hard","advanced","expert"].includes(d))
    throw Error("Unsupported variant/difficulty");
  const den=d==="hard"?1:d==="advanced"?2:3;
  return {kind:"analysis-study-smooth-rational",a:r(v-11,den),
    m:r((v%2===0?1:-1)*(1+v%5),den),q:r(1+v%4,den),
    k:r(v%7-3,den),target:d==="expert"?"global":"critical"};
}

export const smoothRationalStudyStage={
  id:"analysis-study-smooth-rational",category:"derivatives",
  titles:{pl:"Badanie funkcji wymiernej bez biegunów",en:"Study of a smooth rational function"},
  supportedDifficulties:["hard","advanced","expert"],variantCountPerLevel:24,
  create:makeSmoothRationalStudy,
} as const;

export function smoothRationalValue(p:SmoothRationalStudyProblem,t:Rational):Rational {
  validate(p);
  const q2=sq(p.q);
  return add(p.k,div(mul(p.m,q2),add(sq(t),q2)));
}
export function smoothRationalCritical(p:SmoothRationalStudyProblem):readonly [Rational,Rational] {
  validate(p);
  return [p.a,add(p.k,p.m)];
}
export function smoothRationalIntervalExtrema(p:SmoothRationalStudyProblem):readonly [Rational,Rational] {
  validate(p);
  const center=add(p.k,p.m),edge=add(p.k,div(p.m,r(5)));
  return positive(p)?[center,edge]:[edge,center];
}

export function presentSmoothRationalStudy(p:SmoothRationalStudyProblem,locale:Locale) {
  validate(p);
  const lesson=teaching(locale),{t}=lesson;
  const a=f(p.a),q=f(p.q),m=f(p.m),k=f(p.k),h="(x−("+a+"))";
  const up=sign(positive(p)),down=sign(!positive(p));
  const expr="("+k+")+("+m+")("+q+")²/("+h+"²+("+q+")²)";
  const work=(action:string,pl:string,en:string)=>lesson.work(action,t(pl,en));
  work("t=x−("+a+"); f(x)="+expr+"; D=ℝ",
    "Mianownik t²+q² jest dodatni w całej dziedzinie. Funkcja nie ma biegunów rzeczywistych.",
    "The denominator t²+q² is positive everywhere. There are no real poles.");
  work("f(("+a+")+t)=f(("+a+")−t); f("+a+")="+f(add(p.k,p.m)),
    "Wykres ma oś symetrii x=a i jeden centralny punkt stacjonarny.",
    "The graph has a symmetry axis x=a and one central stationary point.");
  if(p.k.numerator===0n){
    work(t("Miejsca zerowe: brak (m≠0).","Zeros: none (m≠0)."),
      "Gdy k=0, licznik pozostaje niezerowy.",
      "When k=0, the numerator never vanishes.");
  }else{
    const ratio=div(mul(r(-1),add(p.k,p.m)),p.k);
    const zeros=ratio.numerator>0n?
      "x=("+a+")±("+q+")√("+f(ratio)+")":
      ratio.numerator===0n?"x="+a:t("brak zer rzeczywistych","no real zeros");
    work("f=0 ⇔ t²=("+q+")²·("+f(ratio)+"); "+zeros,
      "Dodatnia wartość t² daje dwa zera, zero jedno, a ujemna żadnego.",
      "A positive squared value gives two zeros, zero gives one, and a negative value gives none.");
  }
  work("lim(x→±∞) f(x)="+k+"; y="+k,
    "Jedna asymptota pozioma. Brak asymptot pionowych i ukośnych.",
    "There is one horizontal asymptote and no vertical or oblique asymptotes.");
  work("f′(x)=−2("+m+")("+q+")²"+h+"/("+h+"²+("+q+")²)²; f′=0 ⇔ x="+a,
    "Reguła ilorazu: znak pochodnej zależy od −m(x−a).",
    "The quotient rule gives a derivative with sign determined by −m(x−a).");
  work("f′: (−∞,"+a+"): "+up+"; ("+a+",+∞): "+down,
    "Dla m>0 funkcja rośnie, potem maleje; dla m<0 odwrotnie.",
    "For m>0 the function increases then decreases; for m<0 it is reversed.");
  work("("+a+", "+f(add(p.k,p.m))+"): "+
      t(positive(p)?"maksimum lokalne":"minimum lokalne",
        positive(p)?"local maximum":"local minimum"),
    "Zmiana znaku f′ jednoznacznie klasyfikuje ekstremum.",
    "The change in the sign of f′ classifies the extremum.");
  work("f″(x)=2("+m+")("+q+")²(3"+h+"²−("+q+")²)/("+h+"²+("+q+")²)³",
    "W całej dziedzinie mianownik jest dodatni.",
    "The denominator stays positive throughout the domain.");
  work("f″=0 ⇔ x=("+a+")±("+q+")/√3; y="+
      f(add(p.k,div(mul(r(3),p.m),r(4)))),
    "Dwa różne zera f″ ze zmianą znaku dają dokładnie dwa punkty przegięcia.",
    "Two distinct sign-changing zeros of f″ give exactly two inflection points.");
  work("f″: |x−("+a+")|>"+q+"/√3: "+up+"; |x−("+a+")|<"+q+"/√3: "+down,
    "Znaki f″ wskazują wklęsłość i wypukłość, także dla ujemnego m.",
    "Signs of f″ determine concavity, also for negative m.");
  work(t("Szkic: wykres ciągły, jedno ekstremum, dwa przegięcia, asymptota pozioma.",
         "Sketch: continuous curve, one extremum, two inflections, horizontal asymptote."),
    "Narysuj szkic na kartce. Rysunek nie jest oceniany automatycznie.",
    "Draw on paper; the sketch is not automatically graded.");

  const [cx,cy]=smoothRationalCritical(p);
  if(p.target==="critical"){
    const answer:AnswerSpec={kind:"list",labels:["x₀","y₀"],values:[cx,cy]};
    return lesson.finish(t(
      "Zbadaj f(x)="+expr+": dziedzinę, zera, symetrię, granice, asymptoty, znaki f′ i f″, ekstrema i przegięcia. Szkic wykonaj na kartce. Wpisz punkt stacjonarny (x₀,y₀).",
      "Study f(x)="+expr+": domain, zeros, symmetry, limits, asymptotes, signs of f′ and f″, extrema and inflections. Sketch on paper. Enter the stationary point (x₀,y₀)."),
      answer,
      t("Oblicz f′ i f″, korzystając z t=x−a.","Differentiate using t=x−a."),
      t("Punkt stacjonarny ma t=0; przegięcia mają t=±q/√3.",
        "The stationary point has t=0; inflections have t=±q/√3."));
  }
  const start=add(p.a,mul(r(-2),p.q));
  const end=add(p.a,mul(r(2),p.q));
  const edge=add(p.k,div(p.m,r(5)));
  const [maximum,minimum]=smoothRationalIntervalExtrema(p);
  work("f("+f(start)+")=f("+f(end)+")="+f(edge)+
       "; f("+a+")="+f(cy)+"; max="+f(maximum)+"; min="+f(minimum),
    "Na domkniętym przedziale sprawdzamy obie wartości brzegowe i jedyny punkt stacjonarny.",
    "On the closed interval check both endpoints and the only stationary point.");
  return lesson.finish(t(
    "Zbadaj f(x)="+expr+" i naszkicuj wykres na kartce. Znajdź globalne max f oraz min f na ["+f(start)+", "+f(end)+"], uwzględniając znaki f′ i f″, ekstrema i przegięcia.",
    "Study f(x)="+expr+" and sketch on paper. Find global max f and min f on ["+f(start)+", "+f(end)+"], including signs of f′ and f″, extrema and inflections."),
    {kind:"list",labels:["max f","min f"],values:[maximum,minimum]},
    t("Porównaj f w punktach końcowych z f(a).","Compare endpoint values with f(a)."),
    t("Końce odpowiadają t=±2q, punkt stacjonarny t=0.",
      "Endpoints occur at t=±2q, and the stationary point at t=0."));
}
