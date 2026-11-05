import type {makeUniversityTask} from "../university/catalog";
import {formatRational as f,type AnswerInput} from "../answers";
import {wrongAcceptanceAnswer} from "./acceptance";
import {r,add,sub,mul,div,sign,cmp,demand,type Rational} from "./batchFMath";

export const batchG=[
 {block:"G1",skills:["C05"],family:"sequence-euler-product",level:"expert",variants:[0,1]},
 {block:"G1",skills:["C06"],family:"sequence-monotonic-bounded",level:"advanced",variants:[2,4]},
] as const;
type Task=ReturnType<typeof makeUniversityTask>;
export type GCertificate={input:AnswerInput;anchors:readonly (readonly string[])[];facts:readonly string[];choiceLabel?:string;critical?:readonly Rational[];contains?:(x:Rational)=>boolean;classes?:string;bounds?:{lower:Rational|null;upper:Rational|null}};
const qkey=(x:Rational)=>`${x.numerator}/${x.denominator}`;
const exponent=(q:Rational):AnswerInput=>sign(q)===0?"1":{kind:"choice",value:"exp:"+qkey(q)};

/** Parameters only. No production answer, hint, solution or solver is read. */
export function batchGCertificate(task:Task,locale:"pl"|"en"="en"):GCertificate {
 const p=task.university;
 const t=(pl:string,en:string)=>locale==="pl"?pl:en;
 switch(p.kind){
  case "sequence-euler-product":{
   const contributions=p.factors.map(t=>{
    demand(sign(add(r(1),t.b))>0,"Positive shifted denominator for n>=1");
    const lower=sign(t.a)<0?add(r(1),div(t.a,add(r(1),t.b))):r(1);
    demand(sign(lower)>0&&sign(t.a)!==0&&sign(t.c)!==0,"Positive base and genuine 1^infinity factor");
    // log factor = [log(1+u)/u] * a*(cn+d)/(n+b).
    return mul(t.a,t.c);
   });
   const q=contributions.reduce(add,r(0));
   return {input:exponent(q),choiceLabel:sign(q)===0?undefined:`e^(${f(q)})`,anchors:[[t("Sprawdzamy dodatniość wszystkich podstaw.","Verify positivity of all bases.")],...p.factors.map((t,i)=>[`F${i+1}: ln(1+(${f(t.a)})/(n+${f(t.b)}))·((${f(t.c)})·n+${f(t.d)}) → ${f(contributions[i])}`]),[`ln L = ${contributions.map(f).join(" + ")} = ${f(q)}`,`L=${sign(q)===0?"1":`e^(${f(q)})`}`]],facts:["each base tends to 1 and is positive for every n>=1","nonzero c gives signed infinite exponent; log(1+u)/u tends to 1","constant shifts disappear; product logarithms add"],classes:sign(q)<0?"exponent-negative":sign(q)>0?"exponent-positive":"exponent-zero"};
  }
  case "sequence-monotonic-bounded":{
   demand(p.shift>=0&&Number.isInteger(p.shift)&&sign(p.amplitude)!==0,"Bounded catalog excludes constants");
   const s=p.amplitude,c=p.offset,k=p.shift,positive=sign(s)>0;
   const atOne=p.mode==="linear"?add(c,s):add(c,div(s,r(k+1)));
   const absS=positive?s:sub(r(0),s);
   const bounds=p.mode==="linear"?{lower:positive?atOne:null,upper:positive?null:atOne}:
    p.mode==="reciprocal"?{lower:cmp(c,atOne)<0?c:atOne,upper:cmp(c,atOne)>0?c:atOne}:
    {lower:sub(c,div(absS,r(k+1))),upper:add(c,div(absS,r(k+1)))};
   const formula=f(c)+" + ("+f(s)+")"+(p.mode==="linear"?"·n":p.mode==="reciprocal"?"/(n+"+k+")":"·(−1)ⁿ/(n+"+k+")");
   let value:string,step:string,bound:string;
   if(p.mode==="linear"){
    // Difference exactly s; n>=1 gives one finite endpoint bound and
    // growth in the other direction. Two-sided boundedness is false.
    value=positive?"increasing-unbounded":"decreasing-unbounded";step=`aₙ₊₁−aₙ=${f(s)}`;bound="|aₙ|→+∞";
    demand(cmp(sub(add(c,mul(r(2),s)),add(c,s)),s)===0,"Linear difference identity");
   }else if(p.mode==="reciprocal"){
    // Cross multiplication: 1/(n+k+1)-1/(n+k)=-1/((n+k)(n+k+1)).
    value=positive?"decreasing-bounded":"increasing-bounded";
    step=`aₙ₊₁−aₙ=−(${f(s)})/((n+${k})(n+${k+1}))`;bound=`0<1/(n+${k})≤1/${k+1}`;
   }else{
    value="neither-bounded";
    step=`a₁=${f(c)}−(${f(s)})/(1+${k}); a₂=${f(c)}+(${f(s)})/(2+${k}); a₃=${f(c)}−(${f(s)})/(3+${k})`;
    bound=`|aₙ−(${f(c)})|≤|${f(s)}|/${k+1}`;
    // Derive alternating difference for all n, not just sample terms:
    // Δ = -s*(-1)^n*(2n+2k+1)/((n+k)(n+k+1)).
    demand(sign(mul(s,r(2*k+3)))!==0,"Alternating differences change sign with parity");
   }
   return {input:{kind:"choice",value},anchors:[["n≥1; aₙ="+formula],[step],[bound]],facts:["exact difference identity for every n>=1",p.mode==="linear"?"a1 bounds one side only; other side unbounded":"explicit two-sided bound via reciprocal or absolute amplitude",p.mode==="alternating"?"alternating differences have both signs":"difference sign proves strict monotonicity"],classes:value,bounds};
  }
  default:throw Error("Outside Batch G matrix: "+p.kind);
 }
}
export const batchGOracle=(task:Task)=>batchGCertificate(task).input;
export function wrongBatchG(input:AnswerInput,task:Task):AnswerInput {
 if(typeof input==="string")return input==="0"?"1":"0";
 return wrongAcceptanceAnswer(input,task);
}
