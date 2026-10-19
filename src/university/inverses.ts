import { rational as r, multiplyRational as mul, addRational as add, subtractRational as sub, type Rational } from "../rational";
import { formatRational as f, type AnswerSpec } from "../answers";
import type { Difficulty } from "../difficulty";
import type { Locale } from "../locales/types";
import type { LinearAlgebraProblem, UniversityFamily } from "./schema";
import { calculate, teaching } from "./teaching";
import { inverse, product, rank, type ExactMatrix } from "./linearAlgebraMath";

const compact=(a:ExactMatrix)=>`[${a.map(row=>`[${row.map(f).join(", ")}]`).join("; ")}]`;
const choice=(value:string, locale:Locale):AnswerSpec=>({kind:"choice",value,options:[{value:"inverse-yes",label:locale==="pl"?"Istnieje odwrotność":"An inverse exists"},{value:"inverse-no",label:locale==="pl"?"Brak odwrotności":"No inverse"}]});
function two(v:number, level:Difficulty): ExactMatrix {
  const a=level==="hard"?r((v%3)+1,2):r(level==="easy"?1:(v%3)+1), b=r(v-11), d=r(v%2?-2:2);
  const top=[a,b], bottom=[r(0),d];
  if(level==="easy") return [top,bottom];
  const k=r(level==="medium"?v%3+1:level==="hard"?v%3+4:level==="advanced"?v%3+7:-(v%3+10));
  return [top,bottom.map((x,j)=>add(x,mul(k,top[j])))];
}
function three(v:number, level:Difficulty):ExactMatrix {
  const a: Rational[][]=[
    [r(1),r(v-11),r((v%5)-2)],
    [r(0),r(v%2?-1:2),r((v%7)-3)],
    [r(0),r(0),r(v%3?1:-2)],
  ];
  if(level!=="hard") for(let j=0;j<3;j++) a[2][j]=add(a[2][j],mul(r(v%2?2:-1),a[1][j]));
  if(level==="expert") for(let j=0;j<3;j++) a[1][j]=add(a[1][j],mul(r((v%3)+1),a[0][j]));
  if(v%2) [a[0],a[1]]=[a[1],a[0]];
  return a;
}
const family=(id:string,titles:Record<Locale,string>,supportedDifficulties:readonly Difficulty[],create:UniversityFamily["create"]):UniversityFamily=>({id,category:"matrices",titles,supportedDifficulties,create});
export const inverseFamilies:readonly UniversityFamily[]=[
  family("inverse-two",{pl:"Macierz odwrotna 2×2",en:"Inverse matrix 2×2"},["easy","medium","hard"],(v,d)=>({kind:"linear-inverse",matrix:d==="hard" && v%4===0? (()=>{const a=two(v,d);return [a[0],a[0].map(x=>mul(x,r(v%3+1)))];})():two(v,d),method:"inverse"})),
  family("inverse-three",{pl:"Macierz odwrotna 3×3",en:"Inverse matrix 3×3"},["hard","advanced","expert"],(v,d)=>({kind:"linear-inverse",matrix:three(v,d),method:"inverse"})),
  family("inverse-existence",{pl:"Warunek odwracalności",en:"Invertibility condition"},["medium","hard","advanced"],(v,d)=>{const a=d!=="medium"&&v%2?three(v,d):two(v,d);return {kind:"linear-inverse",method:"classification",matrix:v%3===0?[...a.slice(0,-1),a[0].map(x=>mul(x,r(d==="medium"?2:d==="hard"?3:4)))]:a};}),
  family("inverse-applications",{pl:"Równanie macierzowe AX = B",en:"Matrix equation AX = B"},["medium","hard","advanced","expert"],(v,d)=>{
    const a=d==="advanced"||d==="expert"?three(v,d):two(v,d);
    const n=a.length, columns=d==="medium"?1:2;
    const x=Array.from({length:n},(_,i)=>Array.from({length:columns},(_,j)=>r((v+i*3+j*5)%7-3,j===1&&d==="expert"?2:1)));
    return {kind:"linear-application",matrix:a,rhs:product(a,x),method:"ax"};
  }),
  family("inverse-right-applications",{pl:"Równanie macierzowe XA = B",en:"Matrix equation XA = B"},["advanced","expert"],(v,d)=>{
    const a=d==="expert"?three(v,d):two(v,d);
    const x=Array.from({length:2},(_,i)=>Array.from({length:a.length},(_,j)=>r((v+2*i+3*j)%7-3,d==="expert"&&j===1?2:1)));
    return {kind:"linear-application",matrix:a,rhs:product(x,a),method:"xa"};
  }),
];
export function presentInverse(p:Extract<LinearAlgebraProblem,{kind:"linear-inverse"|"linear-application"}>,locale:Locale) {
  const lesson=teaching(locale), {t}=lesson;
  const a=p.matrix, n=a.length;
  if(p.kind==="linear-application") {
    const b=p.rhs!;
    const result=inverse(a);
    if(!result.value) throw new Error("Generated matrix equation must be invertible");
    const right=p.method==="xa",x=right?product(b,result.value):product(result.value,b);
    lesson.work(`A = ${compact(a)}; B = ${compact(b)}; X = ${right?"BA⁻¹":"A⁻¹B"}`,right?t("Mnożymy z prawej strony przez A⁻¹. Kolejność ma znaczenie: XA=B, więc X=BA⁻¹.","Multiply on the right by A⁻¹. Order matters: XA=B, hence X=BA⁻¹."):t("Mnożymy z lewej strony przez A⁻¹. Kolejność ma znaczenie: AX=B, więc X=A⁻¹B.","Multiply on the left by A⁻¹. Order matters: AX=B, hence X=A⁻¹B."));
    for(const step of result.reduction.steps) lesson.work(`${step.action}: ${compact(step.matrix)}`,t("Tę samą operację stosujemy do obu bloków [A|I].", "Apply the same row operation to both blocks [A|I]."));
    lesson.work(`A⁻¹ = ${compact(result.value)}; X = ${right?"BA⁻¹":"A⁻¹B"} = ${compact(x)}`,t("Mnożymy macierze w dozwolonej kolejności; każdą komórkę wyznacza iloczyn wiersza i kolumny.","Multiply matrices in the valid order; each entry is a row-column dot product."));
    lesson.work(`${right?"XA":"AX"} = ${compact(right?product(x,a):product(a,x))} = B`,t("Podstawienie do oryginalnego równania sprawdza każdy element wyniku.","Substitution into the original equation checks every entry."));
    return lesson.finish(right?t(`Rozwiąż XA = B dla A = ${compact(a)}, B = ${compact(b)}. Podaj macierz X.`,`Solve XA = B for A = ${compact(a)}, B = ${compact(b)}. Enter matrix X.`):t(`Rozwiąż AX = B dla A = ${compact(a)}, B = ${compact(b)}. Podaj macierz X.`,`Solve AX = B for A = ${compact(a)}, B = ${compact(b)}. Enter matrix X.`),{kind:"matrix",values:x},right?t("Sprawdź, czy A jest odwracalna, a potem pomnóż B przez A⁻¹ z prawej.","Check that A is invertible, then multiply B by A⁻¹ on the right."):t("Sprawdź, czy A jest odwracalna, a potem pomnóż A⁻¹ przez B z lewej.","Check that A is invertible, then multiply A⁻¹ by B on the left."),t("Przekształć [A|I] do [I|A⁻¹], zachowując tę samą operację po obu stronach.","Reduce [A|I] to [I|A⁻¹], applying the same operation to both sides."));
  }
  const result=inverse(a);
  const det2=n===2?sub(mul(a[0][0],a[1][1]),mul(a[0][1],a[1][0])):undefined;
  lesson.work(`A = ${compact(a)}; ${det2?`det(A) = (${f(a[0][0])})·(${f(a[1][1])}) − (${f(a[0][1])})·(${f(a[1][0])}) = ${f(det2)}`:`rank(A) = ${rank(a)}; n = ${n}`}`,t("Macierz kwadratowa ma odwrotność wtedy i tylko wtedy, gdy jej rząd wynosi n (równoważnie det A ≠ 0).","A square matrix is invertible exactly when its rank is n (equivalently det A ≠ 0)."));
  for(const step of result.reduction.steps) lesson.work(`${step.action}: ${compact(step.matrix)}`,t("W metodzie Gaussa–Jordana wykonujemy tę samą operację na obu blokach [A|I].","In Gauss–Jordan elimination apply the same operation to both blocks [A|I]."));
  const existence=p.method==="classification";
  if(!result.value) {
    lesson.work(t("Brak odwrotności", "No inverse"),t(`Lewa część [A|I] ma tylko ${result.reduction.pivots.length} pivotów zamiast ${n}; nie może stać się I. Nie dzielimy przez zero.`,`The left block [A|I] has only ${result.reduction.pivots.length} pivots, not ${n}; it cannot become I. Never divide by zero.`));
    return lesson.finish(t(`Czy macierz A = ${compact(a)} ma odwrotność?`,`Does matrix A = ${compact(a)} have an inverse?`),choice("inverse-no",locale),t("Porównaj rząd A z jej wymiarem.","Compare rank(A) with its dimension."),t("Jeśli brakuje pivota, odwrotność nie istnieje.","If a pivot is missing, no inverse exists."));
  }
  if(n===2 && !existence && det2){
    const numerators=[[a[1][1],mul(r(-1),a[0][1])],[mul(r(-1),a[1][0]),a[0][0]]];
    const divisions=numerators.map(row=>row.map(value=>calculate("quotient",value,det2)));
    if(divisions.some((row,i)=>row.some((c,j)=>f(c.result)!==f(result.value![i][j]))))throw new Error("Inverse formula and Gauss–Jordan disagree");
    lesson.work(`A⁻¹ = (1/${f(det2)}) ${compact(numerators)} = ${compact(divisions.map(row=>row.map(c=>c.result)))}`,t("Dla 2×2 zamieniamy miejsca a i d, zmieniamy znaki b i c, a potem dzielimy wszystkie cztery elementy przez niezerowy wyznacznik.","For 2×2 swap a with d, negate b and c, then divide all four entries by the nonzero determinant."),...divisions.flat());
  }
  lesson.work(`A⁻¹ = ${compact(result.value)}`,t("Po prawej stronie [I|A⁻¹] odczytujemy dokładną macierz odwrotną.","Read the exact inverse from the right block of [I|A⁻¹]."));
  lesson.work(`AA⁻¹ = ${compact(product(a,result.value))}; A⁻¹A = ${compact(product(result.value,a))}`,t("Oba iloczyny są macierzą jednostkową — to kontrola wyniku.","Both products equal the identity matrix, verifying the answer."));
  const answer:AnswerSpec=existence?choice("inverse-yes",locale):{kind:"matrix",values:result.value};
  return lesson.finish(existence?t(`Czy macierz A = ${compact(a)} ma odwrotność?`,`Does matrix A = ${compact(a)} have an inverse?`):t(`Wyznacz A⁻¹ dla A = ${compact(a)}.`,`Find A⁻¹ for A = ${compact(a)}.`),answer,t("Sprawdź wyznacznik lub rząd; potem redukuj [A|I].","Check the determinant or rank, then reduce [A|I]."),t("Pivoty muszą wystąpić w każdej kolumnie A. Stosuj operacje także na I.","Every column of A needs a pivot. Apply operations to I as well."));
}
