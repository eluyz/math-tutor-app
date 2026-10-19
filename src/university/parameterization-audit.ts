// Test-only parser for the deliberately narrow displayed affine form.
// Verifies the whole real solution family by checking zero and every
// parameter basis vector with exact independent arithmetic.
import { expect } from "vitest";
import type { Rational } from "../rational";
import { a, s, m, q, eq } from "./audit";
import type { Solution } from "../solutions/types";
export function auditShownParameters(matrix:readonly (readonly Rational[])[],rhs:readonly Rational[],solution:Solution){
  const n=matrix[0].length,names=["x","y","z","w"].slice(0,n);
  const action=solution.find(step=>step.kind==="working"&&step.action.includes("t1")&&step.action.includes("x = "))?.action;
  expect(action).toBeDefined();
  const formulas=action!.split("; ");
  expect(formulas).toHaveLength(n);
  const parameterCount=Math.max(...[...action!.matchAll(/t(\d+)/g)].map(match=>Number(match[1])));
  expect(parameterCount).toBeGreaterThan(0);
  const evaluate=(text:string,parameters:Rational[]):Rational=>{
    if(/^t\d+$/.test(text))return parameters[Number(text.slice(1))-1];
    const [constant,...terms]=text.split(" − ");
    const base=/^(-?\d+)\/(\d+)$/.exec(constant);
    expect(base,text).not.toBeNull();
    let value=q(BigInt(base![1]),BigInt(base![2]));
    for(const term of terms){
      const parsed=/^\((-?\d+)\/(\d+)\)t(\d+)$/.exec(term);
      expect(parsed,text).not.toBeNull();
      value=s(value,m(q(BigInt(parsed![1]),BigInt(parsed![2])),parameters[Number(parsed![3])-1]));
    }
    return value;
  };
  for(let basis=-1;basis<parameterCount;basis++){
    const parameters=Array.from({length:parameterCount},(_,j)=>q(j===basis?1:0));
    const values=formulas.map((formula,i)=>{
      expect(formula.startsWith(`${names[i]} = `)).toBe(true);
      return evaluate(formula.slice(names[i].length+3),parameters);
    });
    for(let i=0;i<matrix.length;i++)expect(eq(matrix[i].map((c,j)=>m(c,values[j])).reduce(a,q(0)),rhs[i])).toBe(true);
  }
}
