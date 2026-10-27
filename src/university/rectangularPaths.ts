import {rational as r, addRational as add, divideRational as div, multiplyRational as mul, type Rational} from "../rational";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type Shape=Readonly<{rows:number;columns:number}>;
type Chain=Readonly<{kind:"matrix-four-factor-dimensions";matrices:readonly [Shape,Shape,Shape,Shape]}>;
type Path=Readonly<{kind:"multivar-anisotropic-limit";atX:Rational;atY:Rational;base:Rational;factor:Rational;valueAt:Rational;mode:"different-paths"|"continuous"|"removable";power:3|4}>;
export type RectangularPathProblem=Chain|Path;
const levels:readonly Difficulty[]=["hard","advanced","expert"];
const n=(d:Difficulty)=>d==="hard"?0:d==="advanced"?1:2;
const dim=(x:Shape)=>x.rows+"×"+x.columns;
const shape=(rows:number,columns:number):Shape=>({rows,columns});
const eq=(a:Rational,b:Rational)=>a.numerator*b.denominator===b.numerator*a.denominator;

function makeChain(v:number,d:Difficulty):Chain{
 const t=n(d),ar=2+v%4,ac=2+Math.floor(v/4)%6;
 const bcols=2+(v+2*t)%5,ccols=2+(Math.floor(v/3)+t)%5,dcols=2+(Math.floor(v/5)+t)%5;
 const mode=v%4; // valid, invalid AB, invalid (AB)C, invalid ((AB)C)D
 return {kind:"matrix-four-factor-dimensions",matrices:[
  shape(ar,ac),shape(mode===1?(ac===7?ac-1:ac+1):ac,bcols),
  shape(mode===2?bcols+1:bcols,ccols),
  shape(mode===3?ccols+1:ccols,dcols),
 ]};
}
function makePath(v:number,d:Difficulty):Path{
 const t=n(d),den=[1,2,3][t],mode=(["different-paths","continuous","removable"] as const)[v%3];
 const base=r(v%9-4,den),factor=r((v%2===0?1:-1)*(1+v%5),den);
 return {kind:"multivar-anisotropic-limit",atX:r(v-11,den),atY:r(v%11-5,den),base,factor,
  valueAt:mode==="removable"?add(base,r(1+Math.floor(v/3)%4,den)):base,
  mode,power:mode==="different-paths"?3:4};
}
export const rectangularPathFamilies:readonly UniversityFamily[]=[
 {id:"matrix-four-factor-dimensions",category:"matrices",
  titles:{pl:"Wykonalność łańcucha czterech macierzy",en:"Compatibility of a four-matrix product"},
  supportedDifficulties:levels,create:makeChain},
 {id:"multivar-anisotropic-limit",category:"function-limits",
  titles:{pl:"Granice 2D po nieliniowej drodze",en:"Two-variable limits along nonlinear paths"},
  supportedDifficulties:levels,create:makePath},
];
export function chainTrace(p:Chain):Readonly<{shape:Shape|null;steps:readonly {left:Shape;right:Shape;result:Shape|null}[]}>{
 let current:Shape|null=p.matrices[0];const steps:{left:Shape;right:Shape;result:Shape|null}[]=[];
 for(const right of p.matrices.slice(1)){
  if(current===null)break;
  const left:Shape=current;
  const result:Shape|null=left.columns===right.rows?shape(left.rows,right.columns):null;
  steps.push({left,right,result});
  current=result;
 }
 return {shape:current,steps};
}
export type AnisotropicClass="nonremovable"|"continuous"|"removable";
export function anisotropicClass(p:Path):AnisotropicClass{
 if(p.factor.numerator===0n)throw Error("Nonzero factor is required");
 if(p.power===3)return "nonremovable";
 return eq(p.valueAt,p.base)?"continuous":"removable";
}
export function nonlinearPathValue(p:Path):Rational{
 if(p.power!==3||p.factor.numerator===0n)throw Error("Counterexample requires p=3 and nonzero factor");
 return add(p.base,div(p.factor,r(2)));
}
function matrixChoices(p:Chain,locale:Locale){
 const result=chainTrace(p).shape,first=p.matrices[0],last=p.matrices[3];
 const options:{value:string;label:string}[]=[
  {value:"not-possible",label:locale==="pl"?"Nie można wykonać":"Not possible"},
 ];
 const candidates:Shape[]=[shape(first.rows,last.columns),shape(last.columns,first.rows),
  shape(first.columns,last.columns),shape(first.rows,p.matrices[2].columns)];
 for(let i=2;i<=8;i++)for(let j=2;j<=8;j++)candidates.push(shape(i,j));
 const seen=new Set<string>();
 if(result){seen.add(result.rows+"x"+result.columns);
  options.push({value:result.rows+"x"+result.columns,label:dim(result)});}
 for(const s of candidates){
  const value=s.rows+"x"+s.columns;
  if(seen.has(value))continue;seen.add(value);
  options.push({value,label:dim(s)});
  if(options.length===5)break;
 }
 if(options.length!==5||new Set(options.map(o=>o.value)).size!==5)throw Error("Invalid dimension distractors");
 return {kind:"choice" as const,value:result?result.rows+"x"+result.columns:"not-possible",options};
}
function presentChain(p:Chain,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;const names=["A","B","C","D"] as const;
 for(let i=0;i<4;i++)lesson.work("dim("+names[i]+")="+dim(p.matrices[i]),
  t("Podaj najpierw liczbę wierszy, później kolumn.","List the number of rows first, then columns."));
 const trace=chainTrace(p);
 for(let i=0;i<trace.steps.length;i++){
  const step=trace.steps[i],term=["AB","(AB)C","((AB)C)D"][i];
  lesson.work(term+": "+dim(step.left)+" · "+dim(step.right)+" ⇒ "+
   (step.result?dim(step.result):t("niewykonalne","not defined")),
   step.result?
    t("Wewnętrzne wymiary są równe; wynik ma zewnętrzne wymiary.",
      "Inner dimensions agree; the result takes the outer dimensions."):
    t("Liczba kolumn lewej macierzy różni się od liczby wierszy prawej. Łańcuch nie jest wykonalny.",
      "The left column count differs from the right row count. The product is undefined."));
 }
 lesson.work("dim(ABCD)="+(trace.shape?dim(trace.shape):t("nie istnieje","undefined")),
  trace.shape?
   t("Sprawdziliśmy zgodność wszystkich trzech mnożeń, a nie tylko początkowej pary.",
     "All three multiplications are compatible, not merely the first pair."):
   t("Wystarczy jedna niezgodna para w wymaganym łańcuchu, aby iloczyn nie istniał.",
     "One incompatible inner dimension makes the requested product undefined."));
 return lesson.finish(
  t("Określ, czy istnieje iloczyn ABCD. Jeśli tak, podaj jego wymiary. ",
    "Determine whether ABCD is defined. If so, give its dimensions. ")+
  p.matrices.map((s,i)=>names[i]+": "+dim(s)).join("; "),
  matrixChoices(p,locale),
  t("Sprawdź kolejno A·B, (AB)·C, ((AB)C)·D.","Check A·B, then (AB)·C, then ((AB)C)·D."),
  t("Zgodność wymaga kolumny(lewej)=wiersze(prawej). Wynik ma wiersze pierwszej i kolumny ostatniej macierzy.",
    "Compatibility requires columns(left)=rows(right). The result takes the first matrix's rows and last matrix's columns."));
}
function pathLabels(locale:Locale){
 const pl=[
  {value:"continuous",label:"Funkcja jest ciągła w punkcie"},
  {value:"removable",label:"Nieciągłość usuwalna — granica istnieje, ale f(a,b) jest inne"},
  {value:"nonremovable",label:"Nieciągłość nieusuwalna — granica nie istnieje"},
 ];
 const en=[
  {value:"continuous",label:"The function is continuous at the point"},
  {value:"removable",label:"Removable discontinuity — the limit exists but differs from f(a,b)"},
  {value:"nonremovable",label:"Nonremovable discontinuity — the limit does not exist"},
 ];
 return locale==="pl"?pl:en;
}
function presentPath(p:Path,locale:Locale){
 const lesson=teaching(locale),{t}=lesson,at="("+f(p.atX)+", "+f(p.atY)+")";
 const base=f(p.base),k=f(p.factor),fAt=f(p.valueAt);
 if(p.factor.numerator===0n)throw Error("Nonzero coefficient required");
 lesson.work("u=x−("+f(p.atX)+"); v=y−("+f(p.atY)+"); (u,v)→(0,0)",
  t("Przesuwamy punkt i sprawdzamy wszystkie drogi w otoczeniu bez środka.",
    "Translate the target point and consider all paths in the punctured neighbourhood."));
 lesson.work("u⁶+v⁴>0 "+t("dla","for")+" (u,v)≠(0,0)",
  t("Oba składniki mianownika są nieujemne i jednocześnie zerują się tylko w środku.",
    "Both denominator terms are nonnegative and vanish simultaneously only at the origin."));
 if(p.power===3){
  const different=nonlinearPathValue(p);
  lesson.work("v=0, u→0: g="+base,
   t("Na osi poziomej licznik u³v² znika.","On the horizontal axis the numerator u³v² vanishes."));
  lesson.work("u=t², v=t³, t→0, t≠0: u³v²/(u⁶+v⁴)=t¹²/(2t¹²)=1/2",
   t("Nieliniowa droga przecina różne poziomy współrzędnych; po podstawieniu wynik jest stały.",
     "The nonlinear parametrised path produces the constant ratio after cancellation."));
  lesson.work("L_osi="+base+"; L_drogi="+f(different)+"; L_osi≠L_drogi",
   t("Dwie różne granice drogowe wykluczają wspólną granicę 2D, niezależnie od g w środku.",
     "Two distinct path limits disprove a two-variable limit, regardless of the assigned central value."));
 }else{
  lesson.work("2|u³|v² ≤ u⁶+v⁴",
   t("Stosujemy nierówność 2ab≤a²+b² dla a=|u³|, b=v².",
     "Apply 2ab≤a²+b² to a=|u³| and b=v²."));
  lesson.work("|u⁴v²/(u⁶+v⁴)| ≤ |u|/2",
   t("Dodatkowy czynnik u sprawia, że oszacowanie dąży do zera po dowolnej drodze.",
     "The extra factor u makes the bound tend to zero along every path."));
  lesson.work("|g−("+base+")| ≤ |"+k+"|·|u|/2 → 0",
   t("Twierdzenie o trzech funkcjach dowodzi granicy 2D dla wszystkich dróg.",
     "The squeeze theorem proves the full two-variable limit for all paths."));
  lesson.work("lim g="+base+"; g"+at+"="+fAt,
   anisotropicClass(p)==="continuous"?
    t("Wartość w punkcie równa granicy, zatem funkcja jest ciągła.",
      "The assigned value equals the limit, so the function is continuous."):
    t("Wartość w punkcie różni się od granicy, więc nieciągłość jest usuwalna.",
      "The assigned value differs from the limit, hence discontinuity is removable."));
 }
 return lesson.finish(
  t("Sklasyfikuj granicę i ciągłość funkcji dwóch zmiennych w punkcie ",
    "Classify the limit and continuity of the two-variable function at ")+at+".\n"+
  "u=x−("+f(p.atX)+"), v=y−("+f(p.atY)+"); g(x,y)=("+base+")+("+k+")u^"+p.power+"v²/(u⁶+v⁴) "+
  t("dla","for")+" (u,v)≠(0,0); g"+at+"="+fAt+".",
  {kind:"choice",value:anisotropicClass(p),options:pathLabels(locale)},
  t("Porównaj drogę v=0 z u=t², v=t³; do istnienia granicy potrzebujesz oszacowania wszystkich dróg.",
    "Compare v=0 with u=t², v=t³; proving existence requires a bound for all paths."),
  t("Gdy p=3, droga nieliniowa daje 1/2. Gdy p=4, skorzystaj z 2|u³|v²≤u⁶+v⁴.",
    "For p=3 the nonlinear path gives 1/2. For p=4 apply 2|u³|v²≤u⁶+v⁴."));
}
export function presentRectangularPath(p:RectangularPathProblem,locale:Locale){
 return p.kind==="matrix-four-factor-dimensions"?presentChain(p,locale):presentPath(p,locale);
}
