import { rational as r, addRational as add, subtractRational as sub, multiplyRational as mul, divideRational as div, type Rational } from "../rational";

export type ExactMatrix = readonly (readonly Rational[])[];
export type RowStep = Readonly<{ action: string; matrix: ExactMatrix }>;
export type Reduction = Readonly<{ matrix: ExactMatrix; pivots: readonly number[]; steps: readonly RowStep[] }>;
const zero = (v: Rational) => v.numerator === 0n;
export function checkMatrix(a: ExactMatrix): { rows: number; columns: number } {
  const rows = a.length, columns = a[0]?.length ?? 0;
  if (!Number.isInteger(rows) || !Number.isInteger(columns) || rows < 1 || rows > 4 || columns < 1 || columns > 9 || a.some(row => row.length !== columns || row.some(v => !v || typeof v.numerator !== "bigint" || typeof v.denominator !== "bigint" || v.denominator <= 0n))) throw new Error("Invalid exact matrix");
  return { rows, columns };
}
export const identity = (n: number): ExactMatrix => Array.from({length:n}, (_,i) => Array.from({length:n},(_,j) => r(i===j?1:0)));
export function product(a: ExactMatrix, b: ExactMatrix): ExactMatrix {
  const left=checkMatrix(a), right=checkMatrix(b);
  if(left.columns!==right.rows) throw new Error("Incompatible matrix dimensions");
  return a.map(row=>Array.from({length:right.columns},(_,j)=>row.reduce((acc,v,k)=>add(acc,mul(v,b[k][j])),r(0))));
}
/** Exact Gauss–Jordan; limited pivot columns also reduces augmented matrices safely. */
export function reduceRows(source: ExactMatrix, pivotColumns = checkMatrix(source).columns): Reduction {
  const { rows, columns } = checkMatrix(source);
  if (!Number.isInteger(pivotColumns) || pivotColumns < 1 || pivotColumns > columns) throw new Error("Invalid pivot columns");
  const a = source.map(row=>[...row]);
  const steps: RowStep[] = [], pivots: number[]=[];
  let lead=0;
  const record=(action:string)=>steps.push({action,matrix:a.map(row=>[...row])});
  for(let col=0;col<pivotColumns && lead<rows;col++) {
    const index=a.findIndex((row,i)=>i>=lead && !zero(row[col]));
    if(index<0) continue;
    if(index!==lead) { [a[index],a[lead]]=[a[lead],a[index]]; record(`R${lead+1} ↔ R${index+1}`); }
    const pivot=a[lead][col];
    if(pivot.numerator===0n) throw new Error("Zero pivot");
    if(pivot.numerator!==pivot.denominator) { a[lead]=a[lead].map(v=>div(v,pivot)); record(`R${lead+1} ← R${lead+1} / (${pivot.numerator}/${pivot.denominator})`); }
    for(let i=0;i<rows;i++) if(i!==lead && !zero(a[i][col])) {
      const factor=a[i][col];
      a[i]=a[i].map((v,j)=>sub(v,mul(factor,a[lead][j])));
      record(`R${i+1} ← R${i+1} − (${factor.numerator}/${factor.denominator})R${lead+1}`);
    }
    pivots.push(col); lead++;
  }
  return {matrix:a,pivots,steps};
}
export function rank(a: ExactMatrix): number { return reduceRows(a).pivots.length; }
export function inverse(a: ExactMatrix): { value: ExactMatrix | null; reduction: Reduction } {
  const {rows,columns}=checkMatrix(a);
  if(rows!==columns || rows>3) throw new Error("Inverse requires square 1–3 matrix");
  const reduction=reduceRows(a.map((row,i)=>[...row,...identity(rows)[i]]),rows);
  return {value: reduction.pivots.length===rows ? reduction.matrix.map(row=>row.slice(rows)) : null,reduction};
}
export function classifySystem(a: ExactMatrix,b: readonly Rational[]): {kind:"system-one"|"system-none"|"system-many"; values:readonly Rational[]; rankA:number; rankAugmented:number; reduction:Reduction; freeColumns:readonly number[]} {
  const {rows,columns}=checkMatrix(a);
  if(b.length!==rows || columns>4) throw new Error("Invalid system dimensions");
  const reduction=reduceRows(a.map((row,i)=>[...row,b[i]]),columns);
  const rankA=reduction.pivots.length;
  const inconsistent=reduction.matrix.some(row=>row.slice(0,columns).every(zero) && !zero(row[columns]));
  const freeColumns=Array.from({length:columns},(_,j)=>j).filter(j=>!reduction.pivots.includes(j));
  return {kind:inconsistent?"system-none":rankA===columns?"system-one":"system-many",values:!inconsistent && rankA===columns ? reduction.matrix.slice(0,columns).map(row=>row[columns]) : [],rankA,rankAugmented:rankA+(inconsistent?1:0),reduction,freeColumns};
}
export function parameterization(result: ReturnType<typeof classifySystem>, variables: readonly string[]): string[] {
  if(result.kind!=="system-many") return [];
  const rows=result.reduction.matrix, n=variables.length;
  return variables.map((name,j)=> {
    if(result.freeColumns.includes(j)) return `${name} = t${result.freeColumns.indexOf(j)+1}`;
    const i=result.reduction.pivots.indexOf(j);
    const terms=result.freeColumns.map((free,k)=>({coefficient:rows[i][free],name:`t${k+1}`})).filter(item=>!zero(item.coefficient));
    return `${name} = ${rows[i][n].numerator}/${rows[i][n].denominator}${terms.map(term=>` − (${term.coefficient.numerator}/${term.coefficient.denominator})${term.name}`).join("")}`;
  });
}
/** Forward Gaussian elimination with a separate exact backward substitution. */
export function gaussianElimination(a: ExactMatrix, b: readonly Rational[]): Reduction {
  const {rows,columns}=checkMatrix(a);
  if(b.length!==rows || columns>4) throw new Error("Invalid system dimensions");
  const matrix=a.map((row,i)=>[...row,b[i]]), steps:RowStep[]=[], pivots:number[]=[];
  let lead=0;
  for(let col=0;col<columns && lead<rows;col++){
    const pivot=matrix.findIndex((row,i)=>i>=lead && !zero(row[col]));
    if(pivot<0)continue;
    if(pivot!==lead){[matrix[pivot],matrix[lead]]=[matrix[lead],matrix[pivot]];steps.push({action:`R${lead+1} ↔ R${pivot+1}`,matrix:matrix.map(row=>[...row])});}
    for(let i=lead+1;i<rows;i++)if(!zero(matrix[i][col])){
      const factor=div(matrix[i][col],matrix[lead][col]);
      matrix[i]=matrix[i].map((v,j)=>sub(v,mul(factor,matrix[lead][j])));
      steps.push({action:`R${i+1} ← R${i+1} − (${factor.numerator}/${factor.denominator})R${lead+1}`,matrix:matrix.map(row=>[...row])});
    }
    pivots.push(col);lead++;
  }
  return {matrix,pivots,steps};
}
export function backSubstitute(reduction:Reduction, variables:number):readonly Rational[] {
  if(reduction.pivots.length!==variables || reduction.matrix.length<variables) throw new Error("Not a unique square solution");
  const x=Array.from({length:variables},()=>r(0));
  for(let i=variables-1;i>=0;i--){
    const col=reduction.pivots[i], row=reduction.matrix[i];
    const remaining=row.slice(col+1,variables).reduce((sum,c,j)=>add(sum,mul(c,x[col+1+j])),r(0));
    x[col]=div(sub(row[variables],remaining),row[col]);
  }
  return x;
}
