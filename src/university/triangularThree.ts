import {rational as r,subtractRational as sub,multiplyRational as mul,type Rational} from "../rational";
import {multiplyMatrices,type Matrix} from "../matrices";
import {formatRational as f} from "../answers";
import type {Difficulty} from "../difficulty";
import type {Locale} from "../locales/types";
import type {UniversityFamily} from "./schema";
import {teaching} from "./teaching";

type Upper=Readonly<{kind:"matrix-negative-square-three";A:Matrix}>;
type Similarity=Readonly<{kind:"matrix-conjugation-three";A:Matrix;P:Matrix}>;
export type TriangularThreeProblem=Upper|Similarity;

const sign=(v:number)=>v%2===0?1:-1;
const den=(d:Difficulty)=>d==="hard"?3:d==="advanced"?5:7;
const neg=(v:Rational)=>sub(r(0),v);
const print=(m:Matrix)=>"["+m.map(row=>row.map(f).join(", ")).join("; ")+"]";
function upperMatrix(v:number,difficulty:Difficulty):Matrix{
 const d=den(difficulty);
 const a=r(sign(v)*(1+v%7)*d+1,d);
 const c=r(sign(Math.floor(v/2))*(1+Math.floor(v/7)%4)*d+2,d);
 const b=r((v%5-2)*d+1,d);
 return [[r(1),a,b],[r(0),r(1),c],[r(0),r(0),r(1)]];
}
function createPower(v:number,d:Difficulty):Upper{
 return {kind:"matrix-negative-square-three",A:upperMatrix(v,d)};
}
function createSimilarity(v:number,d:Difficulty):Similarity{
 const t=r(sign(v)*(1+v%6)*den(d)+1,den(d));
 return {kind:"matrix-conjugation-three",A:upperMatrix(v,d),
   P:[[r(1),r(0),r(0)],[t,r(1),r(0)],[r(0),r(0),r(1)]]};
}
export const triangularThreeFamilies:readonly UniversityFamily[]=[
 {id:"matrix-negative-square-three",category:"matrices",
  titles:{pl:"Potęga A⁻² macierzy trójkątnej 3×3",en:"Negative power A⁻² of a triangular 3×3 matrix"},
  supportedDifficulties:["hard","advanced","expert"],create:createPower},
 {id:"matrix-conjugation-three",category:"matrices",
  titles:{pl:"Wyrażenie P A P⁻¹ dla macierzy 3×3",en:"Similarity P A P⁻¹ of 3×3 matrices"},
  supportedDifficulties:["hard","advanced","expert"],create:createSimilarity},
];
function validateUpper(A:Matrix):void{
 if(A.length!==3||A.some(row=>row.length!==3))throw Error("3×3 expected");
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){
  const target=i===j?1:0;
  if((i>=j&& !(A[i][j].numerator===BigInt(target)*A[i][j].denominator)))
   throw Error("Expected upper-unitriangular matrix");
 }
}
export function triangularUpperInverse(A:Matrix):Matrix{
 validateUpper(A);
 const a=A[0][1],b=A[0][2],c=A[1][2];
 return [[r(1),neg(a),sub(mul(a,c),b)],
  [r(0),r(1),neg(c)],[r(0),r(0),r(1)]];
}
export function lowerElementaryInverse(P:Matrix):Matrix{
 if(P.length!==3||P.some(row=>row.length!==3))throw Error("3×3 expected");
 const t=P[1][0];
 const expected:[[number,number,number],[number,number,number],[number,number,number]]=[[1,0,0],[0,1,0],[0,0,1]];
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){
  if(i===1&&j===0)continue;
  const z=P[i][j];
  if(z.numerator!==BigInt(expected[i][j])*z.denominator)throw Error("Expected P=I+tE21");
 }
 if(t.numerator===0n)throw Error("Nontrivial similarity required");
 return [[r(1),r(0),r(0)],[neg(t),r(1),r(0)],[r(0),r(0),r(1)]];
}
export function triangularThreeResult(p:TriangularThreeProblem):Matrix{
 if(p.kind==="matrix-negative-square-three"){
  const inverse=triangularUpperInverse(p.A);
  return multiplyMatrices(inverse,inverse);
 }
 validateUpper(p.A);
 const pinv=lowerElementaryInverse(p.P);
 return multiplyMatrices(multiplyMatrices(p.P,p.A),pinv);
}
export function presentTriangularThree(p:TriangularThreeProblem,locale:Locale){
 const lesson=teaching(locale),{t}=lesson;
 const A=p.A,invA=triangularUpperInverse(A),result=triangularThreeResult(p);
 lesson.work("A="+print(A),
   t("Macierz A jest górnotrójkątna z jedynkami na przekątnej, więc det(A)=1.",
     "A is upper triangular with unit diagonal, so det(A)=1."));
 lesson.work("N=A−I₃; N³=0",
   t("Ściśle górnotrójkątna macierz N w wymiarze 3 jest nilpotentna stopnia co najwyżej 3.",
     "A strictly upper-triangular 3×3 matrix N is nilpotent with N cubed equal to zero."));
 lesson.work("A⁻¹=I₃−N+N²="+print(invA),
   t("Iloczyn (I+N)(I−N+N²) daje I+N³=I.",
     "Multiplying (I+N)(I−N+N²) gives I+N³=I."));
 if(p.kind==="matrix-negative-square-three"){
  lesson.work("A⁻²=A⁻¹·A⁻¹=I₃−2N+3N²",
    t("Pomnóż macierz odwrotną przez siebie; N³ i wyższe potęgi znikają.",
      "Multiply the inverse by itself; N cubed and higher powers vanish."));
  lesson.work("A⁻²="+print(result),
    t("Oblicz dziewięć elementów dokładnie jako ułamki, bez zaokrągleń.",
      "Calculate all nine entries as exact fractions, without rounding."));
  lesson.work("A²·A⁻²=I₃",
    t("Sprawdź wynik, mnożąc dodatnią i ujemną potęgę tej samej macierzy.",
      "Check by multiplying positive and negative powers of the same matrix."));
  return lesson.finish(
   t("Oblicz dziewięć elementów macierzy A⁻² dla ","Calculate all nine entries of A⁻² for ")+
     "A="+print(A)+".",
   {kind:"matrix",values:result},
   t("Rozłóż A=I+N, gdzie N³=0.","Write A=I+N, where N³=0."),
   t("Najpierw policz A⁻¹=I−N+N², a potem podnieś tę macierz do kwadratu.",
     "First calculate A⁻¹=I−N+N², then square that matrix."));
 }
 const invP=lowerElementaryInverse(p.P),PA=multiplyMatrices(p.P,A);
 lesson.work("P="+print(p.P)+"; det(P)=1",
   t("Macierz P jest dolnotrójkątna z jedynkami na przekątnej.",
     "P is lower triangular with unit diagonal."));
 lesson.work("P⁻¹="+print(invP),
   t("Jeśli P=I+tE₂₁, to (E₂₁)²=0 i P⁻¹=I−tE₂₁.",
     "If P=I+tE₂₁, then (E₂₁)²=0 and P⁻¹=I−tE₂₁."));
 lesson.work("PA="+print(PA),
   t("Najpierw wykonaj iloczyn P razy A, zachowując kolejność macierzy.",
     "First multiply P by A while keeping the matrix order."));
 lesson.work("(PA)P⁻¹="+print(result),
   t("Domnóż wynik z prawej przez P⁻¹; zazwyczaj PA≠AP.",
     "Multiply on the right by P⁻¹; in general PA≠AP."));
 lesson.work("det(PAP⁻¹)=det(P)det(A)det(P⁻¹)=1",
   t("Podobieństwo zachowuje wyznacznik i może służyć jako kontrola rachunkowa.",
     "Similarity preserves determinant, which supplies an arithmetic cross-check."));
 return lesson.finish(
  t("Oblicz dziewięć elementów wyrażenia P A P⁻¹.","Calculate all nine entries of P A P⁻¹.")+
   "\nA="+print(A)+"; P="+print(p.P)+".",
  {kind:"matrix",values:result},
  t("Wyznacz P⁻¹ ze wzoru I−tE₂₁.","Find P⁻¹ using I−tE₂₁."),
  t("Oblicz najpierw PA, a następnie (PA)P⁻¹. Kolejność jest istotna.",
    "Compute PA first, then (PA)P⁻¹. The order matters."));
}
