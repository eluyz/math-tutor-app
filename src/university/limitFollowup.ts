import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,type Rational} from "../rational";
import {formatRational as f,type LimitValue} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type LimitFollowupProblem=
 | Readonly<{kind:"limit-radical-infinity";a:Rational;b:Rational;c:Rational;d:Rational;direction:"positive"|"negative"}>
 | Readonly<{kind:"limit-piecewise-heine";at:Rational;left:Rational;right:Rational;leftSlope:Rational;rightSlope:Rational;valueAt:Rational}>;
type Radical=Extract<LimitFollowupProblem,{kind:"limit-radical-infinity"}>;
type Heine=Extract<LimitFollowupProblem,{kind:"limit-piecewise-heine"}>;
const negative=(x:Rational)=>r(-x.numerator,x.denominator);
const positive=(x:Rational)=>x.numerator>0n;
const equal=(x:Rational,y:Rational)=>x.numerator*y.denominator===y.numerator*x.denominator;

function radical(v:number,level:Difficulty):Radical{
 const den=level==="hard"?1:level==="advanced"?2:3;
 const a=r(2*v+3,den),b=r(1+v%7,level==="expert"?2:1);
 const mode=v%6;
 const c=mode===0?negative(a):mode===1?a:mode===2||mode===3?r(0):mode===4?mul(r(-2),a):mul(r(2),a);
 const d=r(v-11,level==="expert"?3:level==="advanced"?2:1);
 return {kind:"limit-radical-infinity",a,b,c,d,direction:v%2?"negative":"positive"};
}
export function radicalInfinityLimit(p:Radical):LimitValue{
 if(!positive(p.a)||!positive(p.b)||!["positive","negative"].includes(p.direction))
  throw Error("Expected strictly positive a,b and supported direction");
 const coefficient=add(p.c,p.direction==="positive"?p.a:negative(p.a));
 if(coefficient.numerator===0n)return {kind:"finite",value:p.d};
 const infinitePositive=positive(coefficient)===(p.direction==="positive");
 return {kind:infinitePositive?"positive-infinity":"negative-infinity"};
}
function heine(v:number,level:Difficulty):Heine{
 const den=level==="medium"?1:level==="hard"?2:3;
 const at=r(v-11,den),left=r(2*v-15,level==="advanced"?2:1);
 const mode=v%3;
 const right=mode===2?add(left,r(1+(v%5),den)):left;
 const valueAt=mode===1?add(left,r(1+v%7,den)):left;
 const leftSlope=r(v%5+1,den),rightSlope=r(-(v%7+1),den);
 return {kind:"limit-piecewise-heine",at,left,right,leftSlope,rightSlope,valueAt};
}
export type HeineClass="continuous"|"removable"|"jump";
export function heineClassification(p:Heine):HeineClass{
 if(p.leftSlope.numerator===0n||p.rightSlope.numerator===0n)throw Error("Expected nonzero slopes");
 if(!equal(p.left,p.right))return "jump";
 return equal(p.left,p.valueAt)?"continuous":"removable";
}
const classLabels=(locale:Locale)=>[
 {value:"continuous",label:locale==="pl"?"Granica istnieje i funkcja jest ciągła":"The limit exists and the function is continuous"},
 {value:"removable",label:locale==="pl"?"Granica istnieje, ale funkcja nie jest ciągła":"The limit exists but the function is discontinuous"},
 {value:"jump",label:locale==="pl"?"Granica obustronna nie istnieje (skok)":"The two-sided limit does not exist (jump)"},
];
export const limitFollowupFamilies:readonly UniversityFamily[]=[
 {id:"limit-radical-infinity",category:"function-limits",
  titles:{pl:"Granice z pierwiastkiem przy ±∞",en:"Radical function limits at ±∞"},
  supportedDifficulties:["hard","advanced","expert"],create:radical},
 {id:"limit-piecewise-heine",category:"function-limits",
  titles:{pl:"Ciągłość przedziałami i kryterium Heinego",en:"Piecewise continuity and Heine criterion"},
  supportedDifficulties:["medium","hard","advanced"],create:heine},
];
export function presentLimitFollowup(p:LimitFollowupProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 if(p.kind==="limit-radical-infinity"){
  const L=radicalInfinityLimit(p),direction=p.direction==="positive"?"+∞":"−∞";
  const expr="√(("+f(p.a)+")²x²+("+f(p.b)+"))+("+f(p.c)+")x+("+f(p.d)+")";
  const effective=add(p.c,p.direction==="positive"?p.a:negative(p.a));
  lesson.work("a="+f(p.a)+">0, b="+f(p.b)+">0; x→"+direction,
    t("Pierwiastek jest określony na całej osi; a i b są ściśle dodatnie.",
      "The radical is defined on all real numbers; a and b are strictly positive."));
  lesson.work("√(a²x²+b)−a|x|=b/(√(a²x²+b)+a|x|)→0",
    t("Mnożymy przez sprzężenie: dodatni licznik jest stały, a mianownik rośnie bez ograniczeń.",
      "Conjugate the radical: the positive numerator is constant and the denominator grows without bound."));
  lesson.work("x→"+direction+": |x|="+(p.direction==="positive"?"x":"−x")+"; f(x)=("+f(effective)+")x+("+f(p.d)+")+o(1)",
    t("Przy +∞ wyciągamy x, przy −∞ wyciągamy −x. Zostaje liniowy wyraz dominujący i reszta dążąca do zera.",
      "At +∞ factor out x, at −∞ factor out −x. What remains is a dominating linear term and a vanishing remainder."));
  lesson.work("lim f(x) = "+(L.kind==="finite"?f(L.value):L.kind==="positive-infinity"?"+∞":"−∞"),
    t("Przy zerowym nachyleniu wynik jest równy wyrazowi stałemu; w pozostałych przypadkach znak iloczynu wyznacza nieskończoność.",
      "Zero slope leaves the constant term; otherwise the sign of the dominant linear term sets the infinity."));
  return lesson.finish(
    t("Oblicz granicę funkcji przy x→","Find the function limit as x→")+direction+".\nf(x)="+expr,
    {kind:"limit",value:L},
    t("Pierwiastek z a²x² daje a|x|, a nie zawsze ax.",
      "The square root of a²x² produces a|x|, not necessarily ax."),
    t("Zastosuj sprzężenie i uprość wyraz (c±a)x+d, dobierając znak do kierunku.",
      "Conjugate and simplify (c±a)x+d with the sign matching the direction."));
 }
 const kind=heineClassification(p);
 const [leftExpr,rightExpr]=[
  "("+f(p.left)+")+("+f(p.leftSlope)+")·(x−("+f(p.at)+"))",
  "("+f(p.right)+")+("+f(p.rightSlope)+")·(x−("+f(p.at)+"))",
 ];
 const expr="f(x) = { "+leftExpr+" dla x<"+f(p.at)+"; "+f(p.valueAt)+" dla x="+f(p.at)+"; "+
   rightExpr+" dla x>"+f(p.at)+" }";
 lesson.work("xₙ="+f(p.at)+"−1/n < "+f(p.at)+"; yₙ="+f(p.at)+"+1/n > "+f(p.at)+" (n≥1)",
  t("Oba ciągi argumentów zbieżne do tego samego punktu, ale z przeciwnych stron.",
    "Both argument sequences converge to the same point from opposite sides."));
 lesson.work("lim f(xₙ)="+f(p.left)+"; lim f(yₙ)="+f(p.right),
  t("Podstawiając ciągi do obu wzorów, wyrazy z 1/n zanikają. To kryterium Heinego dla granic jednostronnych.",
    "Substituting the sequences into each branch, the 1/n terms vanish. This applies Heine's sequential criterion."));
 lesson.work(equal(p.left,p.right)?"L₋=L₊="+f(p.left):"L₋="+f(p.left)+" ≠ L₊="+f(p.right),
  t("Granica obustronna istnieje dokładnie wtedy, gdy obie granice jednostronne są równe.",
    "The two-sided limit exists exactly when the two one-sided limits agree."));
 lesson.work("f("+f(p.at)+")="+f(p.valueAt)+"; "+(kind==="continuous"?"L=f(a)":
   kind==="removable"?"L≠f(a)":"L nie istnieje / L does not exist"),
  kind==="continuous"?t("Wartość w punkcie jest zgodna z granicą, więc funkcja jest ciągła.",
   "The value at the point agrees with the limit, so the function is continuous."):
   kind==="removable"?t("Granica istnieje, lecz wartość w punkcie jest inna: nieciągłość usuwalna.",
    "The limit exists but the point value differs: a removable discontinuity."):
   t("Dwa ciągi Heinego dają różne granice; granica obustronna nie istnieje, więc funkcja nie jest ciągła.",
    "Two Heine sequences yield different limits; no two-sided limit exists and the function is discontinuous."));
 return lesson.finish(
  t("Sklasyfikuj granicę i ciągłość funkcji w punkcie x=","Classify the limit and continuity at x=")+f(p.at)+".\n"+expr.replaceAll(" dla "," for "),
  {kind:"choice",value:kind,options:classLabels(locale)},
  t("Sprawdź osobno lim f(x) z lewej i prawej oraz wartość f(a).",
    "Check the left-hand and right-hand limits separately, then f(a)."),
  t("Użyj ciągów a−1/n i a+1/n: różne granice wykluczają granicę obustronną.",
    "Use the sequences a−1/n and a+1/n: different limits rule out the two-sided limit."));
}
