import {rational as r,addRational as add,subtractRational as sub,multiplyRational as mul,divideRational as div, type Rational} from "../rational";
import {multiplyMatrices,determinant,type Matrix} from "../matrices";
import {formatRational as fmt} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

export type NegativePowerProblem =
 | Readonly<{kind:"matrix-negative-square-two";A:Matrix}>
 | Readonly<{kind:"matrix-conjugation-two";A:Matrix;P:Matrix}>;
type Power=Extract<NegativePowerProblem,{kind:"matrix-negative-square-two"}>;
type Conjugation=Extract<NegativePowerProblem,{kind:"matrix-conjugation-two"}>;
const print=(A:Matrix)=>"["+A.map(row=>row.map(fmt).join(", ")).join("; ")+"]";
const den=(d:Difficulty)=>d==="hard"?1:d==="advanced"?2:3;
const sign=(v:number)=>v%2===0?1:-1;
function base(v:number,level:Difficulty):Matrix{
 const d=den(level),a=r(((v*5)%13)-6||1,d);
 const offsetDen=level==="hard"?3:level==="advanced"?5:7;
 const bIndex=(Math.floor(v/3)%7)-3;
 const b=r(bIndex*offsetDen+1,offsetDen); // distinct 1/3, 1/5, 1/7 fractional parts across levels
 return [[add(r(1),mul(a,b)),a],[b,r(1)]];
}
function makePower(v:number,level:Difficulty):Power{return {kind:"matrix-negative-square-two",A:base(v,level)};}
function makeConjugation(v:number,level:Difficulty):Conjugation{
 const c=r(sign(v)*(1+(v%7)),den(level));
 return {kind:"matrix-conjugation-two",A:base(v,level),P:[[r(1),c],[r(0),r(1)]]};
}
export const negativePowerFamilies:readonly UniversityFamily[]=[
 {id:"matrix-negative-square-two",category:"matrices",
  titles:{pl:"Ujemna potęga A⁻² macierzy 2×2",en:"Negative matrix power A⁻² for 2×2 matrices"},
  supportedDifficulties:["hard","advanced","expert"],create:makePower},
 {id:"matrix-conjugation-two",category:"matrices",
  titles:{pl:"Wyrażenie P A P⁻¹ z macierzami 2×2",en:"Matrix expression P A P⁻¹ with 2×2 matrices"},
  supportedDifficulties:["hard","advanced","expert"],create:makeConjugation},
];
export function inverseTwo(A:Matrix):Matrix{
 if(A.length!==2||A.some(row=>row.length!==2))throw Error("Expected a 2×2 matrix");
 const d=determinant(A);
 if(d.numerator===0n)throw Error("Matrix must be invertible");
 return [[div(A[1][1],d),div(sub(r(0),A[0][1]),d)],
         [div(sub(r(0),A[1][0]),d),div(A[0][0],d)]];
}
export function negativePowerResult(p:NegativePowerProblem):Matrix{
 const inverse=inverseTwo(p.kind==="matrix-negative-square-two"?p.A:p.P);
 return p.kind==="matrix-negative-square-two"
  ?multiplyMatrices(inverse,inverse)
  :multiplyMatrices(multiplyMatrices(p.P,p.A),inverse);
}
export function presentNegativePower(p:NegativePowerProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const target=p.kind==="matrix-negative-square-two"?p.A:p.P;
 const d=determinant(target),inv=inverseTwo(target),result=negativePowerResult(p);
 lesson.work((p.kind==="matrix-negative-square-two"?"A":"P")+"="+print(target),
  t("Najpierw sprawdź wymiar i odwracalność macierzy.",
    "First check the matrix dimensions and invertibility."));
 lesson.work("det="+fmt(d)+" ≠ 0",
  t("Niezerowy wyznacznik jest warunkiem istnienia odwrotności.",
    "A nonzero determinant guarantees that the inverse exists."));
 lesson.work((p.kind==="matrix-negative-square-two"?"A⁻¹":"P⁻¹")+"=(1/det)[[d,−b],[−c,a]]="+print(inv),
  t("We wzorze dla 2×2 zamień elementy na przekątnej i zmień znaki poza nią.",
    "For a 2×2 inverse swap diagonal entries and negate off-diagonal entries."));
 if(p.kind==="matrix-negative-square-two"){
  lesson.work("A⁻²=A⁻¹·A⁻¹",
   t("Potęga ujemna oznacza potęgę macierzy odwrotnej, nie odwrotności poszczególnych elementów.",
     "A negative matrix power uses the inverse matrix, not entrywise reciprocals."));
  lesson.work("A⁻¹·A⁻¹="+print(result),
   t("Każdy element to suma iloczynów odpowiedniego wiersza i kolumny.",
     "Each entry is a row-by-column dot product."));
  lesson.work("A²·A⁻²=I₂",
   t("Sprawdzenie przez mnożenie potwierdza własność potęg dla macierzy odwracalnej.",
     "Multiplication verifies the inverse-power identity for an invertible matrix."));
  return lesson.finish(
   t("Oblicz macierz A⁻² dla A=","Calculate the matrix A⁻² for A=")+print(p.A)+". "+t("Podaj cztery dokładne elementy wyniku.","Enter the four exact entries of the result."),
   {kind:"matrix",values:result},
   t("Najpierw oblicz det(A) i A⁻¹.","Compute det(A) and A⁻¹ first."),
   t("Następnie pomnóż A⁻¹ przez A⁻¹ w zwykły sposób macierzowy.",
     "Then multiply A⁻¹ by A⁻¹ using matrix multiplication."));
 }
 const PA=multiplyMatrices(p.P,p.A);
 lesson.work("PA="+print(PA),
  t("Najpierw mnożymy P przez A, zachowując podaną kolejność.",
    "Multiply P by A first, keeping the stated order."));
 lesson.work("PAP⁻¹=(PA)P⁻¹="+print(result),
  t("Następnie mnożymy z prawej strony przez P⁻¹; macierze na ogół nie komutują.",
    "Next multiply on the right by P⁻¹; matrices generally do not commute."));
 lesson.work("det(PAP⁻¹)=det(A)",
  t("Podobieństwo zachowuje wyznacznik, co pomaga wykryć pomyłki rachunkowe.",
    "Similarity preserves the determinant, a useful arithmetic cross-check."));
 return lesson.finish(
  t("Oblicz wyrażenie P A P⁻¹ dla macierzy ","Evaluate the matrix expression P A P⁻¹ for ")+
   "A="+print(p.A)+"; P="+print(p.P)+".",
  {kind:"matrix",values:result},
  t("Sprawdź det(P), a potem oblicz P⁻¹.","Check det(P), then compute P⁻¹."),
  t("Wykonaj PA, a następnie (PA)P⁻¹. Nie zamieniaj kolejności mnożenia.",
    "Compute PA, then (PA)P⁻¹. Do not reverse the multiplication order."));
}
